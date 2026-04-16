import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupSimpleAuth, requireAuth, getCurrentUserId } from "./simple-auth";
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

// WebSocket tracking
const streamClients = new Map<number, Set<WebSocket>>();
const reactionClients = new Map<string, Set<WebSocket>>();

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
    });
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
      const currentUserId = getCurrentUserId(req);
      if (!currentUserId || currentUserId !== userId) return res.status(403).json({ message: "Unauthorized" });
      const { displayName, bio, location, website, avatar } = req.body;
      if (!displayName) return res.status(400).json({ message: "Display name is required" });
      const updated = await storage.updateUser(userId, { displayName, bio: bio || null, location: location || null, website: website || null, avatar: avatar || null });
      const { password, ...safe } = updated;
      res.json(safe);
    } catch (e) { res.status(500).json({ message: "Failed to update profile" }); }
  });

  // Upload avatar as file
  app.post("/api/users/:id/avatar", requireAuth, uploadAvatar.single('avatar'), async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = getCurrentUserId(req);
      if (!currentUserId || currentUserId !== userId) return res.status(403).json({ message: "Unauthorized" });
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const updated = await storage.updateUser(userId, { avatar: avatarUrl });
      const { password, ...safe } = updated;
      res.json(safe);
    } catch (e) { res.status(500).json({ message: "Failed to upload avatar" }); }
  });

  // Settings (stored client-side, but route must exist)
  app.patch("/api/users/:id/settings", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = getCurrentUserId(req);
      if (!currentUserId || currentUserId !== userId) return res.status(403).json({ message: "Unauthorized" });
      // Settings are client-side preferences; acknowledge save
      res.json({ success: true, settings: req.body });
    } catch (e) { res.status(500).json({ message: "Failed to save settings" }); }
  });

  // Upgrade role to creator
  app.post("/api/users/:id/upgrade", requireAuth, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = getCurrentUserId(req);
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
  app.post("/api/videos", requireAuth, uploadVideo.single('video'), async (req: any, res) => {
    try {
      const userId = getCurrentUserId(req);
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
  app.post("/api/videos/:id/like", requireAuth, async (req, res) => {
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

  app.post("/api/comments", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const result = insertCommentSchema.safeParse({ ...req.body, userId });
      if (!result.success) return res.status(400).json({ message: "Invalid comment data" });
      const comment = await storage.createComment(result.data);
      res.status(201).json(comment);
    } catch (e) { res.status(500).json({ message: "Failed to post comment" }); }
  });

  // ── FOLLOWS ────────────────────────────────────────────────────────────────

  app.post("/api/follows", requireAuth, async (req, res) => {
    try {
      const followerId = getCurrentUserId(req);
      const result = insertFollowSchema.safeParse({ ...req.body, followerId });
      if (!result.success) return res.status(400).json({ message: "Invalid follow data" });
      const follow = await storage.createFollow(result.data);
      res.status(201).json(follow);
    } catch (e) { res.status(500).json({ message: "Failed to follow" }); }
  });

  app.delete("/api/follows/:followerId/:followingId", requireAuth, async (req, res) => {
    const currentUserId = getCurrentUserId(req);
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

  app.post("/api/radio-stations", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
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

  app.post("/api/radio-schedules", requireAuth, async (req, res) => {
    try {
      const result = insertRadioScheduleSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ message: "Invalid schedule data" });
      const schedule = await storage.createRadioSchedule(result.data);
      res.status(201).json(schedule);
    } catch (e) { res.status(500).json({ message: "Failed to create schedule" }); }
  });

  // ── REACTIONS ──────────────────────────────────────────────────────────────

  app.post("/api/reactions", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
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

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const result = insertTransactionSchema.safeParse({ ...req.body, userId });
      if (!result.success) return res.status(400).json({ message: "Invalid transaction data" });
      const transaction = await storage.createTransaction(result.data);
      res.status(201).json(transaction);
    } catch (e) { res.status(500).json({ message: "Failed to create transaction" }); }
  });

  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req)!;
      const transactions = await storage.getTransactions(userId);
      res.json(transactions);
    } catch (e) { res.status(500).json({ message: "Failed to fetch transactions" }); }
  });

  // ── SUBSCRIPTIONS ──────────────────────────────────────────────────────────

  app.post("/api/subscriptions", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const result = insertSubscriptionSchema.safeParse({ ...req.body, userId });
      if (!result.success) return res.status(400).json({ message: "Invalid subscription data" });
      const subscription = await storage.createSubscription(result.data);
      res.status(201).json(subscription);
    } catch (e) { res.status(500).json({ message: "Failed to create subscription" }); }
  });

  app.get("/api/subscriptions", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req)!;
      const subscriptions = await storage.getSubscriptions(userId);
      res.json(subscriptions);
    } catch (e) { res.status(500).json({ message: "Failed to fetch subscriptions" }); }
  });

  app.get("/api/subscriptions/subscribers", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req)!;
      const subscribers = await storage.getSubscribers(userId);
      res.json(subscribers);
    } catch (e) { res.status(500).json({ message: "Failed to fetch subscribers" }); }
  });

  // ── EARNINGS ───────────────────────────────────────────────────────────────

  app.get("/api/earnings", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req)!;
      const earnings = await storage.getEarnings(userId);
      res.json(earnings);
    } catch (e) { res.status(500).json({ message: "Failed to fetch earnings" }); }
  });

  app.post("/api/earnings", requireAuth, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
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

  app.post("/api/clips", requireAuth, async (req, res) => {
    try {
      const result = insertClipSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ message: "Invalid clip data" });
      const clip = await storage.createClip(result.data);
      res.status(201).json(clip);
    } catch (e) { res.status(500).json({ message: "Failed to create clip" }); }
  });

  app.post("/api/clips/generate", requireAuth, async (req, res) => {
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
