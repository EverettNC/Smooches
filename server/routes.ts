import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fsp from "fs/promises";
import { storage } from "./storage";
import { setupSimpleAuth } from "./simple-auth";
import { isAuthenticated } from "./auth";
import {
  insertVideoSchema,
  insertCommentSchema,
  insertFollowSchema,
  insertRadioStationSchema,
  insertRadioScheduleSchema,
  insertReactionSchema,
  insertTransactionSchema,
  insertSubscriptionSchema,
  insertEarningsSchema,
  insertClipSchema
} from "@shared/schema";
import { createCanvas } from 'canvas';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateClipTitle, generateClipDescription } from "./openai";

// Multer storage config
const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'public/uploads/videos'));
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'public/uploads/avatars'));
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only video files allowed'));
  }
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// Audio upload for radio / audio content (3-5min focus)
const audioStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'public/uploads/videos')); // reuse videos dir or audio
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'audio-' + unique + path.extname(file.originalname));
  }
});
const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only audio/video files allowed for radio/video'));
  }
});

// WebSocket tracking
const streamClients = new Map<number, Set<WebSocket>>();
const reactionClients = new Map<string, Set<WebSocket>>();

// WebRTC signaling tracking for live streaming
const broadcasterClients = new Map<string, WebSocket>(); // streamId -> broadcaster WS
const viewerPeerConnections = new Map<string, Map<string, WebSocket>>(); // streamId -> (viewerId -> viewer WS)

const clipRequestSchema = z.object({
  audioUrl: z.string().url(),
  startTime: z.number(),
  endTime: z.number(),
  showName: z.string()
});

export function registerRoutes(app: Express): Server {

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'public/uploads', req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Unified auth middleware - checks both passport and simple-auth sessions
function requireAuthUnified(req: Request, res: Response, next: any) {
  // Check passport session first
  if (isAuthenticated(req)) {
    return next();
  }
  // Fall back to simple-auth session
  if (req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: "Authentication required" });
}

function getCurrentUserIdUnified(req: Request): number | undefined {
  // Check passport session first
  if (isAuthenticated(req)) {
    return req.user.id;
  }
  // Fall back to simple-auth session
  return req.session.userId;
}

// Register simple-auth routes (login, register, logout, /api/auth/user)
setupSimpleAuth(app);

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    let streamId: number | undefined;
    let reactionTarget: string | undefined;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        switch (message.type) {
          case 'join':
            streamId = message.streamId;
            if (typeof streamId === 'number') {
              if (!streamClients.has(streamId)) streamClients.set(streamId, new Set());
              streamClients.get(streamId)?.add(ws);
            }
            break;
          case 'join_reactions':
            reactionTarget = `${message.targetType}_${message.targetId}`;
            if (!reactionClients.has(reactionTarget)) reactionClients.set(reactionTarget, new Set());
            reactionClients.get(reactionTarget)?.add(ws);
            break;
          case 'reaction':
            if (reactionTarget && reactionClients.has(reactionTarget)) {
              const msg = { type: 'reaction', emoji: message.emoji, targetType: message.targetType, targetId: message.targetId, timestamp: new Date().toISOString() };
              reactionClients.get(reactionTarget)?.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(msg)); });
            }
            break;
          case 'chat':
            if (streamId && streamClients.has(streamId)) {
              const msg = { type: 'chat', userId: message.userId, username: message.username, content: message.content, timestamp: new Date().toISOString() };
              streamClients.get(streamId)?.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(msg)); });
            }
            break;
          case 'gift':
            const giftMsg = { type: 'gift', icon: message.icon || '🎁', amount: message.amount, targetId: message.targetId || streamId, timestamp: new Date().toISOString() };
            if (streamId && streamClients.has(streamId)) {
              streamClients.get(streamId)?.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(giftMsg)); });
            }
            if (reactionTarget && reactionClients.has(reactionTarget)) {
              reactionClients.get(reactionTarget)?.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(giftMsg)); });
            }
            break;

          // WebRTC signaling for live streaming
          case 'broadcaster-ready':
            if (message.streamId) {
              broadcasterClients.set(message.streamId, ws);
              // Notify any waiting viewers that broadcaster is ready
              const viewers = viewerPeerConnections.get(message.streamId);
              if (viewers) {
                viewers.forEach((viewerWs, viewerId) => {
                  if (viewerWs.readyState === WebSocket.OPEN) {
                    viewerWs.send(JSON.stringify({ type: 'broadcaster-ready', streamId: message.streamId }));
                  }
                  // Also notify broadcaster about each waiting viewer
                  ws.send(JSON.stringify({ 
                    type: 'viewer-connected', 
                    viewerId,
                    streamId: message.streamId 
                  }));
                });
              }
            }
            break;
          case 'broadcaster-stopped':
            if (message.streamId) {
              broadcasterClients.delete(message.streamId);
              // Notify all viewers the stream ended
              const viewers = viewerPeerConnections.get(message.streamId);
              if (viewers) {
                viewers.forEach((viewerWs) => {
                  if (viewerWs.readyState === WebSocket.OPEN) {
                    viewerWs.send(JSON.stringify({ type: 'stream-ended', streamId: message.streamId }));
                  }
                });
                viewerPeerConnections.delete(message.streamId);
              }
            }
            break;
          case 'viewer-join':
            if (message.streamId && message.viewerId) {
              // Register viewer
              if (!viewerPeerConnections.has(message.streamId)) {
                viewerPeerConnections.set(message.streamId, new Map());
              }
              viewerPeerConnections.get(message.streamId)!.set(message.viewerId, ws);
              
              // If broadcaster is already ready, notify viewer
              const broadcasterWs = broadcasterClients.get(message.streamId);
              if (broadcasterWs && broadcasterWs.readyState === WebSocket.OPEN) {
                broadcasterWs.send(JSON.stringify({ 
                  type: 'viewer-connected', 
                  viewerId: message.viewerId,
                  streamId: message.streamId 
                }));
              }
            }
            break;
          case 'offer':
            // Relay offer from broadcaster to specific viewer
            if (message.streamId && message.viewerId && message.offer) {
              const viewers = viewerPeerConnections.get(message.streamId);
              if (viewers) {
                const viewerWs = viewers.get(message.viewerId);
                if (viewerWs && viewerWs.readyState === WebSocket.OPEN) {
                  viewerWs.send(JSON.stringify({ 
                    type: 'offer', 
                    offer: message.offer,
                    streamId: message.streamId 
                  }));
                }
              }
            }
            break;
          case 'answer':
            // Relay answer from viewer to broadcaster
            if (message.streamId && message.viewerId && message.answer) {
              const broadcasterWs = broadcasterClients.get(message.streamId);
              if (broadcasterWs && broadcasterWs.readyState === WebSocket.OPEN) {
                broadcasterWs.send(JSON.stringify({ 
                  type: 'answer', 
                  answer: message.answer,
                  streamId: message.streamId,
                  viewerId: message.viewerId
                }));
              }
            }
            break;
          case 'ice-candidate':
            // Relay ICE candidate. Distinguish direction by whether sender is the registered broadcaster.
            if (message.streamId && message.candidate) {
              const bcWs = broadcasterClients.get(message.streamId);
              const isFromBroadcaster = bcWs === ws;
              if (isFromBroadcaster && message.viewerId) {
                // Broadcaster -> specific viewer
                const viewers = viewerPeerConnections.get(message.streamId);
                if (viewers) {
                  const viewerWs = viewers.get(message.viewerId);
                  if (viewerWs && viewerWs.readyState === WebSocket.OPEN) {
                    viewerWs.send(JSON.stringify({ 
                      type: 'ice-candidate', 
                      candidate: message.candidate,
                      streamId: message.streamId
                    }));
                  }
                }
              } else if (message.viewerId) {
                // Viewer -> broadcaster
                if (bcWs && bcWs.readyState === WebSocket.OPEN) {
                  bcWs.send(JSON.stringify({ 
                    type: 'ice-candidate', 
                    candidate: message.candidate,
                    streamId: message.streamId,
                    viewerId: message.viewerId
                  }));
                }
              }
            }
            break;
          case 'heart':
            // Broadcast heart to all viewers of the stream
            if (message.streamId) {
              const viewers = viewerPeerConnections.get(message.streamId);
              if (viewers) {
                const heartMsg = { 
                  type: 'heart', 
                  streamId: message.streamId,
                  timestamp: new Date().toISOString() 
                };
                viewers.forEach((viewerWs) => {
                  if (viewerWs.readyState === WebSocket.OPEN) {
                    viewerWs.send(JSON.stringify(heartMsg));
                  }
                });
              }
            }
            break;
        }
      } catch (e) { console.error('WS error:', e); }
    });

    ws.on('close', () => {
      if (streamId && streamClients.has(streamId)) {
        streamClients.get(streamId)?.delete(ws);
        if (streamClients.get(streamId)?.size === 0) streamClients.delete(streamId);
      }
      if (reactionTarget && reactionClients.has(reactionTarget)) {
        reactionClients.get(reactionTarget)?.delete(ws);
        if (reactionClients.get(reactionTarget)?.size === 0) reactionClients.delete(reactionTarget);
      }
      // Clean up WebRTC tracking
      // broadcaster?
      for (const [sid, bws] of broadcasterClients.entries()) {
        if (bws === ws) {
          broadcasterClients.delete(sid);
          const viewers = viewerPeerConnections.get(sid);
          if (viewers) {
            viewers.forEach((viewerWs) => {
              if (viewerWs.readyState === WebSocket.OPEN) {
                viewerWs.send(JSON.stringify({ type: 'stream-ended', streamId: sid }));
              }
            });
            viewerPeerConnections.delete(sid);
          }
          break;
        }
      }
      // viewer?
      for (const [sid, viewers] of viewerPeerConnections.entries()) {
        for (const [vid, vws] of viewers.entries()) {
          if (vws === ws) {
            viewers.delete(vid);
            const bc = broadcasterClients.get(sid);
            if (bc && bc.readyState === WebSocket.OPEN) {
              bc.send(JSON.stringify({ type: 'viewer-disconnected', viewerId: vid, streamId: sid }));
            }
            if (viewers.size === 0) viewerPeerConnections.delete(sid);
            break;
          }
        }
      }
    });
  });

  // ── SMOOCHES CREATOR API (8030) ────────────────────────────────────────────
  // /identity, /video (3-5min+radio), /live (+gifting), /ambassador (monetization+Prime+podcast)
  // Creator-first: 85% revenue, no exploitation. Strict upward to /source/ingest (see DISPATCH.md).

  app.get("/smooches/health", (_req, res) => {
    res.json({ status: "healthy", port: 8030, timestamp: new Date().toISOString() });
  });

  app.post("/api/ai/title", requireAuthUnified, async (req, res) => {
    const { clipContent = "", showName = "", duration = 60 } = req.body || {};
    const title = await generateClipTitle(clipContent, showName, Number(duration));
    res.json({ title });
  });

  app.post("/api/ai/desc", requireAuthUnified, async (req, res) => {
    const { clipContent = "", showName = "" } = req.body || {};
    const description = await generateClipDescription(clipContent, showName);
    res.json({ description });
  });

  app.get("/api/search", async (req, res) => {
    const q = String(req.query.q || "").toLowerCase().trim();
    if (!q) return res.json({ videos: [], clips: [], stations: [] });
    const allV = await storage.getVideos();
    const videos = allV.filter(v => (v.title || "").toLowerCase().includes(q) || (v.description || "").toLowerCase().includes(q));
    const clips = (await storage.getClips?.() || []).filter((c: any) => (c.title || "").toLowerCase().includes(q) || (c.showName || "").toLowerCase().includes(q));
    const stations = (await storage.getRadioStations?.() || []).filter((s: any) => (s.name || "").toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q));
    res.json({ videos: videos.slice(0, 20), clips: clips.slice(0, 20), stations: stations.slice(0, 20) });
  });

  async function forwardToIngest(payload: any, retries = 2): Promise<any> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await new Promise((resolve, reject) => {
          const data = JSON.stringify(payload);
          const reqHttp = http.request({
            hostname: '127.0.0.1',
            port: 8000,
            path: '/source/ingest',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
          }, (res) => {
            let body = '';
            res.on('data', (c) => body += c);
            res.on('end', () => {
              if (res.statusCode && res.statusCode >= 400) {
                return reject(new Error(`ingest ${res.statusCode}: ${body}`));
              }
              try { resolve(JSON.parse(body || '{}')); } catch { resolve({}); }
            });
          });
          reqHttp.on('error', (e) => { reject(e); });
          reqHttp.write(data); reqHttp.end();
        });
      } catch (err) {
        if (attempt === retries) throw err;
        await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }

  function makeTraceId(): string {
    return `smooches-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  // Basic S3 upload helper (uses existing @aws-sdk/client-s3). Falls back to local if no S3_BUCKET.
  // Cleans up local temp file after S3 upload for prod hygiene.
  const s3 = process.env.S3_BUCKET ? new S3Client({}) : null;
  async function uploadMedia(file: any, keyPrefix: string): Promise<string> {
    const key = `${keyPrefix}/${file.filename}`;
    if (s3 && process.env.S3_BUCKET) {
      const body = await fsp.readFile(file.path);
      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: file.mimetype,
      }));
      // Cleanup local temp file
      try { await fsp.unlink(file.path); } catch {}
      return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
    }
    // Dev fallback (keep local)
    return `/uploads/videos/${file.filename}`;
  }

  app.get("/smooches/identity", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req);
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const earnings = await storage.getEarnings(userId);
      const total = earnings.reduce((s, e) => s + parseFloat((e.amount as any) || '0'), 0);
      const subsCount = (await storage.getSubscribers(userId)).length;
      const pUser = (req as any).user; // from Passport
      res.json({
        id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar,
        role: user.role, ambassador: (user.role === 'creator') || !!(pUser && pUser.role === 'creator'),
        earningsTotal: total, subscriberCount: subsCount,
        monetizationEnabled: true, creatorCutPercent: 85,
        platform: "Smooches - creator monetization forward"
      });
    } catch (e) { res.status(500).json({ error: "Identity failed" }); }
  });

  // POST /smooches/video (3-5min + radio) — detect/extract/verify/post then upward dispatch.
  app.post("/smooches/video", requireAuthUnified, uploadAudio.fields([{ name: 'video', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), async (req: any, res) => {
    try {
      const userId = getCurrentUserIdUnified(req)!;
      const files = req.files || {};
      const file = (files.video && files.video[0]) || (files.audio && files.audio[0]);
      const { title, description, contentType = (files.audio ? 'radio' : 'video'), duration, sourceUrl } = req.body;
      if (!title) return res.status(400).json({ error: "Title required" });
      if (!file && !sourceUrl) return res.status(400).json({ error: "No media file (use field video or audio)" });

      // detect / extract / verify (3-5min focus)
      const detectedType = contentType;
      const url = sourceUrl || await uploadMedia(file, 'smooches');
      const extractedDuration = duration ? Number(duration) : null;
      if (detectedType === 'video' && extractedDuration != null && (extractedDuration < 180 || extractedDuration > 300)) {
        console.log(`[verify] video duration ${extractedDuration}s outside 180-300s focus (still accepted)`);
      }

      let record: any;
      if (detectedType === 'radio') {
        record = await storage.createRadioStation({ name: title, description: description || null, streamUrl: url, coverImage: null, isActive: true, userId } as any);
      } else {
        record = await storage.createVideo({ userId, title, description: description || null, videoUrl: url, thumbnail: null, isLive: false });
      }

      // post complete (gifting via other paths) — build dispatch payload
      const trace_id = makeTraceId();
      const dispatch = {
        trace_id,
        from: "smooches",
        type: detectedType,
        source: {
          sourceUrl: url,
          title,
          userId,
          duration: extractedDuration,
          meta: { radio: detectedType === 'radio' }
        },
        result: {
          success: true,
          record
        },
        metadata: {
          action: "video",
          creatorCutPercent: 85,
          timestamp: new Date().toISOString(),
          platform: "Smooches"
        },
        status: "processed"
      };

      const ingest = await forwardToIngest(dispatch); // flow complete only on success (see DISPATCH.md)
      res.status(201).json({ success: true, record, ingest, creatorRevenueShare: "85%", note: "3-5min videos + radio supported", trace_id });
    } catch (e: any) { res.status(500).json({ error: e.message || "video failed" }); }
  });

  // Live streaming + gifting entrypoint. Creates live marker, enables gifting via existing tx.
  // Core work then exact upward dispatch per DISPATCH.md.
  app.post("/smooches/live", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req)!;
      const { title, description, streamKey } = req.body;
      if (!title) return res.status(400).json({ error: "title required" });

      // detect/extract/verify + post (gift via tx/WS)
      const detectedType = 'live';
      const liveUrl = streamKey ? `live:${streamKey}` : 'live:ws';
      const live = await storage.createVideo({ userId, title, description: description || null, videoUrl: liveUrl, thumbnail: null, isLive: true });

      const trace_id = makeTraceId();
      const dispatch = {
        trace_id,
        from: "smooches",
        type: detectedType,
        source: {
          sourceUrl: live.videoUrl,
          title,
          userId,
          meta: { gifting: true, realtime: 'ws' }
        },
        result: {
          success: true,
          live
        },
        metadata: {
          action: "live",
          creatorCutPercent: 85,
          timestamp: new Date().toISOString(),
          platform: "Smooches"
        },
        status: "processed"
      };

      const ingest = await forwardToIngest(dispatch); // complete only on success
      res.status(201).json({ success: true, live, ingest, ws: '/ws', gifting: 'POST /api/transactions type=gift', creatorCut: '85% + Ambassador uplift', trace_id });
    } catch (e: any) { res.status(500).json({ error: "live failed" }); }
  });

  // Ambassador Program flow: enroll, subscriptions, earnings. Amazon Prime + podcast integration flags.
  // Enforces creator-friendly economics (85%+ to creator), transparent.
  // Core work then exact upward dispatch per DISPATCH.md.
  app.post("/smooches/ambassador", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req)!;
      const { action = 'enroll', tier = 'silver', amount = '9.99', amazonPrime = false, podcast = false, subscriptionDetails, referralCode } = req.body;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "no user" });

      // detect/extract flags + post/gift (85% enforced)
      const detectedType = 'ambassador';
      const results: any = {};
      const flags = { amazonPrime: !!amazonPrime, podcast: !!podcast, tier, referralCode: referralCode || null };
      if (action === 'enroll') {
        const updated = await storage.updateUser(userId, { role: 'creator' });
        results.user = { ...updated, password: undefined };
        results.ambassador = {
          status: 'enrolled',
          amazonPrimeFeatured: flags.amazonPrime,
          podcastDistribution: flags.podcast,
          creatorRevenueShare: 85,
          platformFee: 15,
          perks: 'Priority ingest, Prime placement, podcast syndication, boosted discovery',
          referralCode: `SM-${userId.toString().padStart(4, '0')}-${Date.now().toString(36).slice(-4).toUpperCase()}`
        };
      }
      if (action === 'subscription' || subscriptionDetails) {
        const subPayload = {
          userId: subscriptionDetails?.subscriberId || userId,
          creatorId: userId,
          status: 'active' as const,
          amount: String(amount),
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 86400000),
        };
        results.subscription = await storage.createSubscription(subPayload as any);
        // Basic referral bonus: if referred, credit small earnings to current user (demo for growth)
        if (referralCode && amount) {
          const bonus = (parseFloat(String(amount)) * 0.05).toFixed(2); // 5% bonus for using referral
          const month = new Date().toISOString().slice(0, 7);
          await storage.createEarnings({ userId, amount: bonus, type: 'referral', month } as any);
          results.referralBonus = bonus;
        }
      }
      if (action === 'earnings' || amount) {
        const month = new Date().toISOString().slice(0, 7);
        const creatorShare = (parseFloat(String(amount)) * 0.85).toFixed(2);
        results.earnings = await storage.createEarnings({ userId, amount: creatorShare, type: 'subscription', month } as any);
        results.payoutNote = "Immediate 85% credit to earnings; Ambassador Prime/podcast bonuses extra.";
      }

      const trace_id = makeTraceId();
      const dispatch = {
        trace_id,
        from: "smooches",
        type: detectedType,
        source: {
          sourceUrl: 'ambassador-enroll',
          title: action,
          userId,
          meta: flags
        },
        result: {
          success: true,
          ...results
        },
        metadata: {
          action: "ambassador",
          creatorCutPercent: 85,
          timestamp: new Date().toISOString(),
          platform: "Smooches"
        },
        status: "processed"
      };

      const ingest = await forwardToIngest(dispatch); // complete only on success
      res.json({ success: true, ...results, message: "Smooches Ambassador: fair monetization, no exploitation.", trace_id, ingest });
    } catch (e: any) { res.status(500).json({ error: "ambassador failed: " + e.message }); }
  });

  // ── USERS ──────────────────────────────────────────────────────────────────

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) return res.status(404).json({ message: "User not found" });
      const { password, ...safe } = user;
      res.json(safe);
    } catch (e) { res.status(500).json({ message: "Failed to fetch user" }); }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = getCurrentUserIdUnified(req);
      if (!currentUserId || currentUserId !== userId) return res.status(403).json({ message: "Unauthorized" });
      const { displayName, bio, location, website, avatar } = req.body;
      if (!displayName) return res.status(400).json({ message: "Display name is required" });
      const updated = await storage.updateUser(userId, { displayName, bio: bio || null, location: location || null, website: website || null, avatar: avatar || null });
      const { password, ...safe } = updated;
      res.json(safe);
    } catch (e) { res.status(500).json({ message: "Failed to update profile" }); }
  });

  // Upload avatar as file
  app.post("/api/users/:id/avatar", requireAuthUnified, uploadAvatar.single('avatar'), async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = getCurrentUserIdUnified(req);
      if (!currentUserId || currentUserId !== userId) return res.status(403).json({ message: "Unauthorized" });
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const updated = await storage.updateUser(userId, { avatar: avatarUrl });
      const { password, ...safe } = updated;
      res.json(safe);
    } catch (e) { res.status(500).json({ message: "Failed to upload avatar" }); }
  });

  // Settings (stored client-side, but route must exist)
  app.patch("/api/users/:id/settings", requireAuthUnified, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = getCurrentUserIdUnified(req);
      if (!currentUserId || currentUserId !== userId) return res.status(403).json({ message: "Unauthorized" });
      // Settings are client-side preferences; acknowledge save
      res.json({ success: true, settings: req.body });
    } catch (e) { res.status(500).json({ message: "Failed to save settings" }); }
  });

  // Upgrade role to creator
  app.post("/api/users/:id/upgrade", requireAuthUnified, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = getCurrentUserIdUnified(req);
      if (!currentUserId || currentUserId !== userId) return res.status(403).json({ message: "Unauthorized" });
      const updated = await storage.updateUser(userId, { role: "creator" });
      const { password, ...safe } = updated;
      res.json(safe);
    } catch (e) { res.status(500).json({ message: "Failed to upgrade account" }); }
  });

  app.get("/api/users/:id/videos", async (req, res) => {
    try {
      const videos = await storage.getUserVideos(parseInt(req.params.id));
      res.json(videos);
    } catch (e) { res.status(500).json({ message: "Failed to fetch videos" }); }
  });

  app.get("/api/users/:id/followers", async (req, res) => {
    const followers = await storage.getFollowers(parseInt(req.params.id));
    res.json(followers);
  });

  app.get("/api/users/:id/following", async (req, res) => {
    const following = await storage.getFollowing(parseInt(req.params.id));
    res.json(following);
  });

  app.get("/api/users/:id/clips", async (req, res) => {
    const clips = await storage.getUserClips(parseInt(req.params.id));
    res.json(clips);
  });

  // ── VIDEOS ─────────────────────────────────────────────────────────────────

  app.get("/api/videos", async (_req, res) => {
    const videos = await storage.getVideos();
    res.json(videos);
  });

  app.get("/api/videos/:id", async (req, res) => {
    const video = await storage.getVideo(parseInt(req.params.id));
    if (!video) return res.status(404).json({ message: "Video not found" });
    res.json(video);
  });

  // Upload video with file
  app.post("/api/videos", requireAuthUnified, uploadVideo.single('video'), async (req: any, res) => {
    try {
      const userId = getCurrentUserIdUnified(req);
      if (!userId) return res.status(401).json({ message: "Not authenticated" });

      if (!req.file) return res.status(400).json({ message: "No video file uploaded" });

      const { title, description } = req.body;
      if (!title) return res.status(400).json({ message: "Title is required" });

      const videoUrl = `/uploads/videos/${req.file.filename}`;

      const video = await storage.createVideo({
        userId,
        title,
        description: description || null,
        videoUrl,
        thumbnail: null,
        isLive: false,
      });
      res.status(201).json(video);
    } catch (e: any) {
      console.error('Video upload error:', e);
      res.status(500).json({ message: e.message || "Upload failed" });
    }
  });

  // Like a video (toggle)
  app.post("/api/videos/:id/like", requireAuthUnified, async (req, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const video = await storage.getVideo(videoId);
      if (!video) return res.status(404).json({ message: "Video not found" });
      const newLikes = (video.likes || 0) + 1;
      // We store likes on the video directly
      await storage.updateVideoLikes(videoId, newLikes);
      res.json({ likes: newLikes });
    } catch (e) { res.status(500).json({ message: "Failed to like video" }); }
  });

  // ── COMMENTS ───────────────────────────────────────────────────────────────

  app.get("/api/videos/:id/comments", async (req, res) => {
    const comments = await storage.getComments(parseInt(req.params.id));
    res.json(comments);
  });

  app.post("/api/comments", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req);
      const result = insertCommentSchema.safeParse({ ...req.body, userId });
      if (!result.success) return res.status(400).json({ message: "Invalid comment data" });
      const comment = await storage.createComment(result.data);
      res.status(201).json(comment);
    } catch (e) { res.status(500).json({ message: "Failed to post comment" }); }
  });

  // ── FOLLOWS ────────────────────────────────────────────────────────────────

  app.post("/api/follows", requireAuthUnified, async (req, res) => {
    try {
      const followerId = getCurrentUserIdUnified(req);
      const result = insertFollowSchema.safeParse({ ...req.body, followerId });
      if (!result.success) return res.status(400).json({ message: "Invalid follow data" });
      const follow = await storage.createFollow(result.data);
      res.status(201).json(follow);
    } catch (e) { res.status(500).json({ message: "Failed to follow" }); }
  });

  app.delete("/api/follows/:followerId/:followingId", requireAuthUnified, async (req, res) => {
    const currentUserId = getCurrentUserIdUnified(req);
    const followerId = parseInt(req.params.followerId);
    if (!currentUserId || currentUserId !== followerId) return res.status(403).json({ message: "Unauthorized" });
    await storage.deleteFollow(followerId, parseInt(req.params.followingId));
    res.status(204).send();
  });

  // ── RADIO STATIONS ─────────────────────────────────────────────────────────

  app.get("/api/radio-stations", async (_req, res) => {
    const stations = await storage.getRadioStations();
    res.json(stations);
  });

  app.get("/api/radio-stations/:id", async (req, res) => {
    const station = await storage.getRadioStation(parseInt(req.params.id));
    if (!station) return res.status(404).json({ message: "Station not found" });
    res.json(station);
  });

  app.post("/api/radio-stations", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req);
      const result = insertRadioStationSchema.safeParse({ ...req.body, userId });
      if (!result.success) return res.status(400).json({ message: "Invalid station data", errors: result.error.flatten() });
      const station = await storage.createRadioStation(result.data);
      res.status(201).json(station);
    } catch (e) { res.status(500).json({ message: "Failed to create station" }); }
  });

  app.get("/api/radio-stations/:id/schedule", async (req, res) => {
    const schedules = await storage.getStationSchedules(parseInt(req.params.id));
    res.json(schedules);
  });

  app.get("/api/radio-stations/:id/current-show", async (req, res) => {
    const show = await storage.getCurrentSchedule(parseInt(req.params.id));
    if (!show) return res.status(404).json({ message: "No show currently playing" });
    res.json(show);
  });

  app.post("/api/radio-schedules", requireAuthUnified, async (req, res) => {
    try {
      const result = insertRadioScheduleSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ message: "Invalid schedule data" });
      const schedule = await storage.createRadioSchedule(result.data);
      res.status(201).json(schedule);
    } catch (e) { res.status(500).json({ message: "Failed to create schedule" }); }
  });

  // ── REACTIONS ──────────────────────────────────────────────────────────────

  app.post("/api/reactions", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req);
      const result = insertReactionSchema.safeParse({ ...req.body, userId });
      if (!result.success) return res.status(400).json({ message: "Invalid reaction data" });
      const reaction = await storage.createReaction(result.data);
      res.status(201).json(reaction);
    } catch (e) { res.status(500).json({ message: "Failed to create reaction" }); }
  });

  app.get("/api/reactions/:targetType/:targetId", async (req, res) => {
    const reactions = await storage.getReactions(req.params.targetType, parseInt(req.params.targetId));
    res.json(reactions);
  });

  // ── TRANSACTIONS ───────────────────────────────────────────────────────────

  app.post("/api/transactions", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req);
      const result = insertTransactionSchema.safeParse({ ...req.body, userId });
      if (!result.success) return res.status(400).json({ message: "Invalid transaction data" });
      const bodyVideoId = req.body.videoId ? parseInt(req.body.videoId) : undefined;
      const txData = { ...result.data, videoId: bodyVideoId, targetUserId: req.body.targetUserId ? parseInt(req.body.targetUserId) : undefined };
      const transaction = await storage.createTransaction(txData);
      if (result.data.type === 'gift' && bodyVideoId) {
        const vid = await storage.getVideo(bodyVideoId);
        if (vid && vid.userId) {
          const amt = parseFloat(String(result.data.amount || '0'));
          const share = (amt * 0.85).toFixed(2);
          const month = new Date().toISOString().slice(0, 7);
          await storage.createEarnings({ userId: vid.userId, amount: share, type: 'tip', month } as any);
        }
      }
      res.status(201).json(transaction);
    } catch (e) { res.status(500).json({ message: "Failed to create transaction" }); }
  });

  app.get("/api/transactions", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req)!;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (e) { res.status(500).json({ message: "Failed to fetch transactions" }); }
  });

  // ── SUBSCRIPTIONS ──────────────────────────────────────────────────────────

  app.post("/api/subscriptions", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req);
      const result = insertSubscriptionSchema.safeParse({ ...req.body, userId });
      if (!result.success) return res.status(400).json({ message: "Invalid subscription data" });
      const subscription = await storage.createSubscription(result.data);
      res.status(201).json(subscription);
    } catch (e) { res.status(500).json({ message: "Failed to create subscription" }); }
  });

  app.get("/api/subscriptions", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req)!;
      const subscriptions = await storage.getSubscriptions(userId);
      res.json(subscriptions);
    } catch (e) { res.status(500).json({ message: "Failed to fetch subscriptions" }); }
  });

  app.get("/api/subscriptions/subscribers", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req)!;
      const subscribers = await storage.getSubscribers(userId);
      res.json(subscribers);
    } catch (e) { res.status(500).json({ message: "Failed to fetch subscribers" }); }
  });

  // ── EARNINGS ───────────────────────────────────────────────────────────────

  app.get("/api/earnings", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req)!;
      const earnings = await storage.getEarnings(userId);
      res.json(earnings);
    } catch (e) { res.status(500).json({ message: "Failed to fetch earnings" }); }
  });

  app.post("/api/earnings", requireAuthUnified, async (req, res) => {
    try {
      const userId = getCurrentUserIdUnified(req);
      const result = insertEarningsSchema.safeParse({ ...req.body, userId });
      if (!result.success) return res.status(400).json({ message: "Invalid earnings data" });
      const earnings = await storage.createEarnings(result.data);
      res.status(201).json(earnings);
    } catch (e) { res.status(500).json({ message: "Failed to create earnings record" }); }
  });

  // ── CLIPS ──────────────────────────────────────────────────────────────────

  app.get("/api/clips", async (_req, res) => {
    const clips = await storage.getClips();
    res.json(clips);
  });

  app.get("/api/clips/:id", async (req, res) => {
    const clip = await storage.getClip(parseInt(req.params.id));
    if (!clip) return res.status(404).json({ message: "Clip not found" });
    res.json(clip);
  });

  app.get("/api/radio-stations/:id/clips", async (req, res) => {
    const clips = await storage.getStationClips(parseInt(req.params.id));
    res.json(clips);
  });

  app.post("/api/clips", requireAuthUnified, async (req, res) => {
    try {
      const result = insertClipSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ message: "Invalid clip data" });
      const clip = await storage.createClip(result.data);
      res.status(201).json(clip);
    } catch (e) { res.status(500).json({ message: "Failed to create clip" }); }
  });

  app.post("/api/clips/generate", requireAuthUnified, async (req, res) => {
    const result = clipRequestSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid clip data" });

    try {
      const { audioUrl, startTime, endTime, showName } = result.data;
      const canvas = createCanvas(1200, 630);
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
      gradient.addColorStop(0, '#1a1a1a');
      gradient.addColorStop(1, '#333333');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 630);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 1200; i += 10) {
        const height = Math.random() * 100 + 265;
        ctx.moveTo(i, height);
        ctx.lineTo(i, 630 - height);
      }
      ctx.stroke();
      ctx.font = 'bold 60px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(showName, 600, 200);
      ctx.font = '40px Arial';
      const duration = Math.round(endTime - startTime);
      ctx.fillText(`${duration} second clip`, 600, 280);
      const thumbnailUrl = canvas.toDataURL();
      res.json({ clipUrl: audioUrl, thumbnailUrl, duration });
    } catch (e) {
      console.error('Clip generation error:', e);
      res.status(500).json({ message: "Failed to generate clip" });
    }
  });

  return httpServer;
}
