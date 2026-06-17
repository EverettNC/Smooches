"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
var http_1 = require("http");
var http_2 = require("http");
var ws_1 = require("ws");
var client_s3_1 = require("@aws-sdk/client-s3");
var fsp = require("fs/promises");
var storage_1 = require("./storage");
var simple_auth_1 = require("./simple-auth");
var auth_1 = require("./auth");
var schema_1 = require("@shared/schema");
var canvas_1 = require("canvas");
var zod_1 = require("zod");
var multer_1 = require("multer");
var path_1 = require("path");
var fs_1 = require("fs");
var openai_1 = require("./openai");
// Multer storage config
var videoStorage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, path_1.default.join(process.cwd(), 'public/uploads/videos'));
    },
    filename: function (_req, file, cb) {
        var unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path_1.default.extname(file.originalname));
    }
});
var avatarStorage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, path_1.default.join(process.cwd(), 'public/uploads/avatars'));
    },
    filename: function (_req, file, cb) {
        var unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path_1.default.extname(file.originalname));
    }
});
var uploadVideo = (0, multer_1.default)({
    storage: videoStorage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
    fileFilter: function (_req, file, cb) {
        if (file.mimetype.startsWith('video/'))
            cb(null, true);
        else
            cb(new Error('Only video files allowed'));
    }
});
var uploadAvatar = (0, multer_1.default)({
    storage: avatarStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: function (_req, file, cb) {
        if (file.mimetype.startsWith('image/'))
            cb(null, true);
        else
            cb(new Error('Only image files allowed'));
    }
});
// Audio upload for radio / audio content (3-5min focus)
var audioStorage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, path_1.default.join(process.cwd(), 'public/uploads/videos')); // reuse videos dir or audio
    },
    filename: function (_req, file, cb) {
        var unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'audio-' + unique + path_1.default.extname(file.originalname));
    }
});
var uploadAudio = (0, multer_1.default)({
    storage: audioStorage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: function (_req, file, cb) {
        if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/'))
            cb(null, true);
        else
            cb(new Error('Only audio/video files allowed for radio/video'));
    }
});
// WebSocket tracking
var streamClients = new Map();
var reactionClients = new Map();
// WebRTC signaling tracking for live streaming
var broadcasterClients = new Map(); // streamId -> broadcaster WS
var viewerPeerConnections = new Map(); // streamId -> (viewerId -> viewer WS)
var clipRequestSchema = zod_1.z.object({
    audioUrl: zod_1.z.string().url(),
    startTime: zod_1.z.number(),
    endTime: zod_1.z.number(),
    showName: zod_1.z.string()
});
function registerRoutes(app) {
    // Serve uploaded files
    app.use('/uploads', function (req, res, next) {
        var filePath = path_1.default.join(process.cwd(), 'public/uploads', req.path);
        if (fs_1.default.existsSync(filePath)) {
            res.sendFile(filePath);
        }
        else {
            next();
        }
    });
    // Health check
    app.get('/api/health', function (_req, res) {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    // Passport.js + simple session auth for full stack compatibility
    (0, auth_1.setupAuth)(app);
    (0, simple_auth_1.setupSimpleAuth)(app);
    var httpServer = (0, http_1.createServer)(app);
    var wss = new ws_1.WebSocketServer({ server: httpServer, path: '/ws' });
    wss.on('connection', function (ws) {
        var streamId;
        var reactionTarget;
        ws.on('message', function (data) {
            var _a, _b, _c, _d, _e, _f;
            try {
                var message_1 = JSON.parse(data.toString());
                switch (message_1.type) {
                    case 'join':
                        streamId = message_1.streamId;
                        if (typeof streamId === 'number') {
                            if (!streamClients.has(streamId))
                                streamClients.set(streamId, new Set());
                            (_a = streamClients.get(streamId)) === null || _a === void 0 ? void 0 : _a.add(ws);
                        }
                        break;
                    case 'join_reactions':
                        reactionTarget = "".concat(message_1.targetType, "_").concat(message_1.targetId);
                        if (!reactionClients.has(reactionTarget))
                            reactionClients.set(reactionTarget, new Set());
                        (_b = reactionClients.get(reactionTarget)) === null || _b === void 0 ? void 0 : _b.add(ws);
                        break;
                    case 'reaction':
                        if (reactionTarget && reactionClients.has(reactionTarget)) {
                            var msg_1 = { type: 'reaction', emoji: message_1.emoji, targetType: message_1.targetType, targetId: message_1.targetId, timestamp: new Date().toISOString() };
                            (_c = reactionClients.get(reactionTarget)) === null || _c === void 0 ? void 0 : _c.forEach(function (c) { if (c.readyState === ws_1.WebSocket.OPEN)
                                c.send(JSON.stringify(msg_1)); });
                        }
                        break;
                    case 'chat':
                        if (streamId && streamClients.has(streamId)) {
                            var msg_2 = { type: 'chat', userId: message_1.userId, username: message_1.username, content: message_1.content, timestamp: new Date().toISOString() };
                            (_d = streamClients.get(streamId)) === null || _d === void 0 ? void 0 : _d.forEach(function (c) { if (c.readyState === ws_1.WebSocket.OPEN)
                                c.send(JSON.stringify(msg_2)); });
                        }
                        break;
                    case 'gift':
                        var giftMsg_1 = { type: 'gift', icon: message_1.icon || '🎁', amount: message_1.amount, targetId: message_1.targetId || streamId, timestamp: new Date().toISOString() };
                        if (streamId && streamClients.has(streamId)) {
                            (_e = streamClients.get(streamId)) === null || _e === void 0 ? void 0 : _e.forEach(function (c) { if (c.readyState === ws_1.WebSocket.OPEN)
                                c.send(JSON.stringify(giftMsg_1)); });
                        }
                        if (reactionTarget && reactionClients.has(reactionTarget)) {
                            (_f = reactionClients.get(reactionTarget)) === null || _f === void 0 ? void 0 : _f.forEach(function (c) { if (c.readyState === ws_1.WebSocket.OPEN)
                                c.send(JSON.stringify(giftMsg_1)); });
                        }
                        break;
                    // WebRTC signaling for live streaming
                    case 'broadcaster-ready':
                        if (message_1.streamId) {
                            broadcasterClients.set(message_1.streamId, ws);
                            // Notify any waiting viewers that broadcaster is ready
                            var viewers = viewerPeerConnections.get(message_1.streamId);
                            if (viewers) {
                                viewers.forEach(function (viewerWs, viewerId) {
                                    if (viewerWs.readyState === ws_1.WebSocket.OPEN) {
                                        viewerWs.send(JSON.stringify({ type: 'broadcaster-ready', streamId: message_1.streamId }));
                                    }
                                });
                            }
                        }
                        break;
                    case 'broadcaster-stopped':
                        if (message_1.streamId) {
                            broadcasterClients.delete(message_1.streamId);
                            // Notify all viewers the stream ended
                            var viewers = viewerPeerConnections.get(message_1.streamId);
                            if (viewers) {
                                viewers.forEach(function (viewerWs) {
                                    if (viewerWs.readyState === ws_1.WebSocket.OPEN) {
                                        viewerWs.send(JSON.stringify({ type: 'stream-ended', streamId: message_1.streamId }));
                                    }
                                });
                                viewerPeerConnections.delete(message_1.streamId);
                            }
                        }
                        break;
                    case 'viewer-join':
                        if (message_1.streamId && message_1.viewerId) {
                            // Register viewer
                            if (!viewerPeerConnections.has(message_1.streamId)) {
                                viewerPeerConnections.set(message_1.streamId, new Map());
                            }
                            viewerPeerConnections.get(message_1.streamId).set(message_1.viewerId, ws);
                            // If broadcaster is already ready, notify viewer
                            var broadcasterWs = broadcasterClients.get(message_1.streamId);
                            if (broadcasterWs && broadcasterWs.readyState === ws_1.WebSocket.OPEN) {
                                broadcasterWs.send(JSON.stringify({
                                    type: 'viewer-connected',
                                    viewerId: message_1.viewerId,
                                    streamId: message_1.streamId
                                }));
                            }
                        }
                        break;
                    case 'offer':
                        // Relay offer from broadcaster to specific viewer
                        if (message_1.streamId && message_1.viewerId && message_1.offer) {
                            var viewers = viewerPeerConnections.get(message_1.streamId);
                            if (viewers) {
                                var viewerWs = viewers.get(message_1.viewerId);
                                if (viewerWs && viewerWs.readyState === ws_1.WebSocket.OPEN) {
                                    viewerWs.send(JSON.stringify({
                                        type: 'offer',
                                        offer: message_1.offer,
                                        streamId: message_1.streamId
                                    }));
                                }
                            }
                        }
                        break;
                    case 'answer':
                        // Relay answer from viewer to broadcaster
                        if (message_1.streamId && message_1.viewerId && message_1.answer) {
                            var broadcasterWs = broadcasterClients.get(message_1.streamId);
                            if (broadcasterWs && broadcasterWs.readyState === ws_1.WebSocket.OPEN) {
                                broadcasterWs.send(JSON.stringify({
                                    type: 'answer',
                                    answer: message_1.answer,
                                    streamId: message_1.streamId,
                                    viewerId: message_1.viewerId
                                }));
                            }
                        }
                        break;
                    case 'ice-candidate':
                        // Relay ICE candidate. Distinguish direction by whether sender is the registered broadcaster.
                        if (message_1.streamId && message_1.candidate) {
                            var bcWs = broadcasterClients.get(message_1.streamId);
                            var isFromBroadcaster = bcWs === ws;
                            if (isFromBroadcaster && message_1.viewerId) {
                                // Broadcaster -> specific viewer
                                var viewers = viewerPeerConnections.get(message_1.streamId);
                                if (viewers) {
                                    var viewerWs = viewers.get(message_1.viewerId);
                                    if (viewerWs && viewerWs.readyState === ws_1.WebSocket.OPEN) {
                                        viewerWs.send(JSON.stringify({
                                            type: 'ice-candidate',
                                            candidate: message_1.candidate,
                                            streamId: message_1.streamId
                                        }));
                                    }
                                }
                            }
                            else if (message_1.viewerId) {
                                // Viewer -> broadcaster
                                if (bcWs && bcWs.readyState === ws_1.WebSocket.OPEN) {
                                    bcWs.send(JSON.stringify({
                                        type: 'ice-candidate',
                                        candidate: message_1.candidate,
                                        streamId: message_1.streamId,
                                        viewerId: message_1.viewerId
                                    }));
                                }
                            }
                        }
                        break;
                    case 'heart':
                        // Broadcast heart to all viewers of the stream
                        if (message_1.streamId) {
                            var viewers = viewerPeerConnections.get(message_1.streamId);
                            if (viewers) {
                                var heartMsg_1 = {
                                    type: 'heart',
                                    streamId: message_1.streamId,
                                    timestamp: new Date().toISOString()
                                };
                                viewers.forEach(function (viewerWs) {
                                    if (viewerWs.readyState === ws_1.WebSocket.OPEN) {
                                        viewerWs.send(JSON.stringify(heartMsg_1));
                                    }
                                });
                            }
                        }
                        break;
                }
            }
            catch (e) {
                console.error('WS error:', e);
            }
        });
    });
    ws.on('close', function () {
        var _a, _b, _c, _d;
        if (streamId && streamClients.has(streamId)) {
            (_a = streamClients.get(streamId)) === null || _a === void 0 ? void 0 : _a.delete(ws);
            if (((_b = streamClients.get(streamId)) === null || _b === void 0 ? void 0 : _b.size) === 0)
                streamClients.delete(streamId);
        }
        if (reactionTarget && reactionClients.has(reactionTarget)) {
            (_c = reactionClients.get(reactionTarget)) === null || _c === void 0 ? void 0 : _c.delete(ws);
            if (((_d = reactionClients.get(reactionTarget)) === null || _d === void 0 ? void 0 : _d.size) === 0)
                reactionClients.delete(reactionTarget);
        }
        // Clean up WebRTC tracking
        // Check if this was a broadcaster
        broadcasterClients.forEach(function (broadcasterWs, sid) {
            if (broadcasterWs === ws) {
                broadcasterClients.delete(sid);
                // Notify viewers stream ended
                var viewers = viewerPeerConnections.get(sid);
                if (viewers) {
                    viewers.forEach(function (viewerWs) {
                        if (viewerWs.readyState === ws_1.WebSocket.OPEN) {
                            viewerWs.send(JSON.stringify({ type: 'stream-ended', streamId: sid }));
                        }
                    });
                    viewerPeerConnections.delete(sid);
                }
                break;
            }
        });
        // Check if this was a viewer
        for (var _i = 0, _e = viewerPeerConnections.entries(); _i < _e.length; _i++) {
            var _f = _e[_i], sid = _f[0], viewers = _f[1];
            for (var _g = 0, _h = viewers.entries(); _g < _h.length; _g++) {
                var _j = _h[_g], viewerId = _j[0], viewerWs = _j[1];
                if (viewerWs === ws) {
                    viewers.delete(viewerId);
                    // Notify broadcaster viewer disconnected
                    var broadcasterWs = broadcasterClients.get(sid);
                    if (broadcasterWs && broadcasterWs.readyState === ws_1.WebSocket.OPEN) {
                        broadcasterWs.send(JSON.stringify({
                            type: 'viewer-disconnected',
                            viewerId: viewerId,
                            streamId: sid
                        }));
                    }
                    if (viewers.size === 0) {
                        viewerPeerConnections.delete(sid);
                    }
                    break;
                }
            }
        }
    });
}
;
// ── SMOOCHES CREATOR API (8030) ────────────────────────────────────────────
// /identity, /video (3-5min+radio), /live (+gifting), /ambassador (monetization+Prime+podcast)
// Creator-first: 85% revenue, no exploitation. Strict upward to /source/ingest (see DISPATCH.md).
app.get("/smooches/health", function (_req, res) {
    res.json({ status: "healthy", port: 8030, timestamp: new Date().toISOString() });
});
app.post("/api/ai/title", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, clipContent, _c, showName, _d, duration, title;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _a = req.body || {}, _b = _a.clipContent, clipContent = _b === void 0 ? "" : _b, _c = _a.showName, showName = _c === void 0 ? "" : _c, _d = _a.duration, duration = _d === void 0 ? 60 : _d;
                return [4 /*yield*/, (0, openai_1.generateClipTitle)(clipContent, showName, Number(duration))];
            case 1:
                title = _e.sent();
                res.json({ title: title });
                return [2 /*return*/];
        }
    });
}); });
app.post("/api/ai/desc", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, clipContent, _c, showName, description;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = req.body || {}, _b = _a.clipContent, clipContent = _b === void 0 ? "" : _b, _c = _a.showName, showName = _c === void 0 ? "" : _c;
                return [4 /*yield*/, (0, openai_1.generateClipDescription)(clipContent, showName)];
            case 1:
                description = _d.sent();
                res.json({ description: description });
                return [2 /*return*/];
        }
    });
}); });
app.get("/api/search", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var q, allV, videos, clips, stations;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                q = String(req.query.q || "").toLowerCase().trim();
                if (!q)
                    return [2 /*return*/, res.json({ videos: [], clips: [], stations: [] })];
                return [4 /*yield*/, storage_1.storage.getVideos()];
            case 1:
                allV = _c.sent();
                videos = allV.filter(function (v) { return (v.title || "").toLowerCase().includes(q) || (v.description || "").toLowerCase().includes(q); });
                return [4 /*yield*/, ((_a = storage_1.storage.getClips) === null || _a === void 0 ? void 0 : _a.call(storage_1.storage))];
            case 2:
                clips = ((_c.sent()) || []).filter(function (c) { return (c.title || "").toLowerCase().includes(q) || (c.showName || "").toLowerCase().includes(q); });
                return [4 /*yield*/, ((_b = storage_1.storage.getRadioStations) === null || _b === void 0 ? void 0 : _b.call(storage_1.storage))];
            case 3:
                stations = ((_c.sent()) || []).filter(function (s) { return (s.name || "").toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q); });
                res.json({ videos: videos.slice(0, 20), clips: clips.slice(0, 20), stations: stations.slice(0, 20) });
                return [2 /*return*/];
        }
    });
}); });
function forwardToIngest(payload_1) {
    return __awaiter(this, arguments, void 0, function (payload, retries) {
        var _loop_1, attempt, state_1;
        if (retries === void 0) { retries = 2; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _loop_1 = function (attempt) {
                        var _b, err_1;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 2, , 4]);
                                    _b = {};
                                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                                            var data = JSON.stringify(payload);
                                            var reqHttp = http_2.default.request({
                                                hostname: '127.0.0.1',
                                                port: 8000,
                                                path: '/source/ingest',
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
                                            }, function (res) {
                                                var body = '';
                                                res.on('data', function (c) { return body += c; });
                                                res.on('end', function () {
                                                    if (res.statusCode && res.statusCode >= 400) {
                                                        return reject(new Error("ingest ".concat(res.statusCode, ": ").concat(body)));
                                                    }
                                                    try {
                                                        resolve(JSON.parse(body || '{}'));
                                                    }
                                                    catch (_a) {
                                                        resolve({});
                                                    }
                                                });
                                            });
                                            reqHttp.on('error', function (e) { reject(e); });
                                            reqHttp.write(data);
                                            reqHttp.end();
                                        })];
                                case 1: return [2 /*return*/, (_b.value = _c.sent(), _b)];
                                case 2:
                                    err_1 = _c.sent();
                                    if (attempt === retries)
                                        throw err_1;
                                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 300 * (attempt + 1)); })];
                                case 3:
                                    _c.sent();
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 0;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= retries)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function makeTraceId() {
    return "smooches-".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2, 10));
}
// Basic S3 upload helper (uses existing @aws-sdk/client-s3). Falls back to local if no S3_BUCKET.
// Cleans up local temp file after S3 upload for prod hygiene.
var s3 = process.env.S3_BUCKET ? new client_s3_1.S3Client({}) : null;
function uploadMedia(file, keyPrefix) {
    return __awaiter(this, void 0, void 0, function () {
        var key, body, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    key = "".concat(keyPrefix, "/").concat(file.filename);
                    if (!(s3 && process.env.S3_BUCKET)) return [3 /*break*/, 7];
                    return [4 /*yield*/, fsp.readFile(file.path)];
                case 1:
                    body = _b.sent();
                    return [4 /*yield*/, s3.send(new client_s3_1.PutObjectCommand({
                            Bucket: process.env.S3_BUCKET,
                            Key: key,
                            Body: body,
                            ContentType: file.mimetype,
                        }))];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, fsp.unlink(file.path)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/, "https://".concat(process.env.S3_BUCKET, ".s3.amazonaws.com/").concat(key)];
                case 7: 
                // Dev fallback (keep local)
                return [2 /*return*/, "/uploads/videos/".concat(file.filename)];
            }
        });
    });
}
app.get("/smooches/identity", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user, earnings, total, subsCount, pUser, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                if (!userId)
                    return [2 /*return*/, res.status(401).json({ error: "Not authenticated" })];
                return [4 /*yield*/, storage_1.storage.getUser(userId)];
            case 1:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                return [4 /*yield*/, storage_1.storage.getEarnings(userId)];
            case 2:
                earnings = _a.sent();
                total = earnings.reduce(function (s, e) { return s + parseFloat(e.amount || '0'); }, 0);
                return [4 /*yield*/, storage_1.storage.getSubscribers(userId)];
            case 3:
                subsCount = (_a.sent()).length;
                pUser = req.user;
                res.json({
                    id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar,
                    role: user.role, ambassador: (user.role === 'creator') || !!(pUser && pUser.role === 'creator'),
                    earningsTotal: total, subscriberCount: subsCount,
                    monetizationEnabled: true, creatorCutPercent: 85,
                    platform: "Smooches - creator monetization forward"
                });
                return [3 /*break*/, 5];
            case 4:
                e_1 = _a.sent();
                res.status(500).json({ error: "Identity failed" });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// POST /smooches/video (3-5min + radio) — detect/extract/verify/post then upward dispatch.
app.post("/smooches/video", simple_auth_1.requireAuth, uploadAudio.fields([{ name: 'video', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, files, file, _a, title, description, _b, contentType, duration, sourceUrl, detectedType, url, _c, extractedDuration, record, trace_id, dispatch, ingest, e_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 8, , 9]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                files = req.files || {};
                file = (files.video && files.video[0]) || (files.audio && files.audio[0]);
                _a = req.body, title = _a.title, description = _a.description, _b = _a.contentType, contentType = _b === void 0 ? (files.audio ? 'radio' : 'video') : _b, duration = _a.duration, sourceUrl = _a.sourceUrl;
                if (!title)
                    return [2 /*return*/, res.status(400).json({ error: "Title required" })];
                if (!file && !sourceUrl)
                    return [2 /*return*/, res.status(400).json({ error: "No media file (use field video or audio)" })];
                detectedType = contentType;
                _c = sourceUrl;
                if (_c) return [3 /*break*/, 2];
                return [4 /*yield*/, uploadMedia(file, 'smooches')];
            case 1:
                _c = (_d.sent());
                _d.label = 2;
            case 2:
                url = _c;
                extractedDuration = duration ? Number(duration) : null;
                if (detectedType === 'video' && extractedDuration != null && (extractedDuration < 180 || extractedDuration > 300)) {
                    console.log("[verify] video duration ".concat(extractedDuration, "s outside 180-300s focus (still accepted)"));
                }
                record = void 0;
                if (!(detectedType === 'radio')) return [3 /*break*/, 4];
                return [4 /*yield*/, storage_1.storage.createRadioStation({ name: title, description: description || null, streamUrl: url, coverImage: null, isActive: true, userId: userId })];
            case 3:
                record = _d.sent();
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, storage_1.storage.createVideo({ userId: userId, title: title, description: description || null, videoUrl: url, thumbnail: null, isLive: false })];
            case 5:
                record = _d.sent();
                _d.label = 6;
            case 6:
                trace_id = makeTraceId();
                dispatch = {
                    trace_id: trace_id,
                    from: "smooches",
                    type: detectedType,
                    source: {
                        sourceUrl: url,
                        title: title,
                        userId: userId,
                        duration: extractedDuration,
                        meta: { radio: detectedType === 'radio' }
                    },
                    result: {
                        success: true,
                        record: record
                    },
                    metadata: {
                        action: "video",
                        creatorCutPercent: 85,
                        timestamp: new Date().toISOString(),
                        platform: "Smooches"
                    },
                    status: "processed"
                };
                return [4 /*yield*/, forwardToIngest(dispatch)];
            case 7:
                ingest = _d.sent();
                res.status(201).json({ success: true, record: record, ingest: ingest, creatorRevenueShare: "85%", note: "3-5min videos + radio supported", trace_id: trace_id });
                return [3 /*break*/, 9];
            case 8:
                e_2 = _d.sent();
                res.status(500).json({ error: e_2.message || "video failed" });
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
// Live streaming + gifting entrypoint. Creates live marker, enables gifting via existing tx.
// Core work then exact upward dispatch per DISPATCH.md.
app.post("/smooches/live", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, title, description, streamKey, detectedType, liveUrl, live, trace_id, dispatch, ingest, e_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                _a = req.body, title = _a.title, description = _a.description, streamKey = _a.streamKey;
                if (!title)
                    return [2 /*return*/, res.status(400).json({ error: "title required" })];
                detectedType = 'live';
                liveUrl = streamKey ? "live:".concat(streamKey) : 'live:ws';
                return [4 /*yield*/, storage_1.storage.createVideo({ userId: userId, title: title, description: description || null, videoUrl: liveUrl, thumbnail: null, isLive: true })];
            case 1:
                live = _b.sent();
                trace_id = makeTraceId();
                dispatch = {
                    trace_id: trace_id,
                    from: "smooches",
                    type: detectedType,
                    source: {
                        sourceUrl: live.videoUrl,
                        title: title,
                        userId: userId,
                        meta: { gifting: true, realtime: 'ws' }
                    },
                    result: {
                        success: true,
                        live: live
                    },
                    metadata: {
                        action: "live",
                        creatorCutPercent: 85,
                        timestamp: new Date().toISOString(),
                        platform: "Smooches"
                    },
                    status: "processed"
                };
                return [4 /*yield*/, forwardToIngest(dispatch)];
            case 2:
                ingest = _b.sent();
                res.status(201).json({ success: true, live: live, ingest: ingest, ws: '/ws', gifting: 'POST /api/transactions type=gift', creatorCut: '85% + Ambassador uplift', trace_id: trace_id });
                return [3 /*break*/, 4];
            case 3:
                e_3 = _b.sent();
                res.status(500).json({ error: "live failed" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Ambassador Program flow: enroll, subscriptions, earnings. Amazon Prime + podcast integration flags.
// Enforces creator-friendly economics (85%+ to creator), transparent.
// Core work then exact upward dispatch per DISPATCH.md.
app.post("/smooches/ambassador", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, _b, action, _c, tier, _d, amount, _e, amazonPrime, _f, podcast, subscriptionDetails, referralCode, user, detectedType, results, flags, updated, subPayload, _g, bonus, month, month, creatorShare, _h, trace_id, dispatch, ingest, e_4;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                _j.trys.push([0, 10, , 11]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                _a = req.body, _b = _a.action, action = _b === void 0 ? 'enroll' : _b, _c = _a.tier, tier = _c === void 0 ? 'silver' : _c, _d = _a.amount, amount = _d === void 0 ? '9.99' : _d, _e = _a.amazonPrime, amazonPrime = _e === void 0 ? false : _e, _f = _a.podcast, podcast = _f === void 0 ? false : _f, subscriptionDetails = _a.subscriptionDetails, referralCode = _a.referralCode;
                return [4 /*yield*/, storage_1.storage.getUser(userId)];
            case 1:
                user = _j.sent();
                if (!user)
                    return [2 /*return*/, res.status(404).json({ error: "no user" })];
                detectedType = 'ambassador';
                results = {};
                flags = { amazonPrime: !!amazonPrime, podcast: !!podcast, tier: tier, referralCode: referralCode || null };
                if (!(action === 'enroll')) return [3 /*break*/, 3];
                return [4 /*yield*/, storage_1.storage.updateUser(userId, { role: 'creator' })];
            case 2:
                updated = _j.sent();
                results.user = __assign(__assign({}, updated), { password: undefined });
                results.ambassador = {
                    status: 'enrolled',
                    amazonPrimeFeatured: flags.amazonPrime,
                    podcastDistribution: flags.podcast,
                    creatorRevenueShare: 85,
                    platformFee: 15,
                    perks: 'Priority ingest, Prime placement, podcast syndication, boosted discovery',
                    referralCode: "SM-".concat(userId.toString().padStart(4, '0'), "-").concat(Date.now().toString(36).slice(-4).toUpperCase())
                };
                _j.label = 3;
            case 3:
                if (!(action === 'subscription' || subscriptionDetails)) return [3 /*break*/, 6];
                subPayload = {
                    userId: (subscriptionDetails === null || subscriptionDetails === void 0 ? void 0 : subscriptionDetails.subscriberId) || userId,
                    creatorId: userId,
                    status: 'active',
                    amount: String(amount),
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 86400000),
                };
                _g = results;
                return [4 /*yield*/, storage_1.storage.createSubscription(subPayload)];
            case 4:
                _g.subscription = _j.sent();
                if (!(referralCode && amount)) return [3 /*break*/, 6];
                bonus = (parseFloat(String(amount)) * 0.05).toFixed(2);
                month = new Date().toISOString().slice(0, 7);
                return [4 /*yield*/, storage_1.storage.createEarnings({ userId: userId, amount: bonus, type: 'referral', month: month })];
            case 5:
                _j.sent();
                results.referralBonus = bonus;
                _j.label = 6;
            case 6:
                if (!(action === 'earnings' || amount)) return [3 /*break*/, 8];
                month = new Date().toISOString().slice(0, 7);
                creatorShare = (parseFloat(String(amount)) * 0.85).toFixed(2);
                _h = results;
                return [4 /*yield*/, storage_1.storage.createEarnings({ userId: userId, amount: creatorShare, type: 'subscription', month: month })];
            case 7:
                _h.earnings = _j.sent();
                results.payoutNote = "Immediate 85% credit to earnings; Ambassador Prime/podcast bonuses extra.";
                _j.label = 8;
            case 8:
                trace_id = makeTraceId();
                dispatch = {
                    trace_id: trace_id,
                    from: "smooches",
                    type: detectedType,
                    source: {
                        sourceUrl: 'ambassador-enroll',
                        title: action,
                        userId: userId,
                        meta: flags
                    },
                    result: __assign({ success: true }, results),
                    metadata: {
                        action: "ambassador",
                        creatorCutPercent: 85,
                        timestamp: new Date().toISOString(),
                        platform: "Smooches"
                    },
                    status: "processed"
                };
                return [4 /*yield*/, forwardToIngest(dispatch)];
            case 9:
                ingest = _j.sent();
                res.json(__assign(__assign({ success: true }, results), { message: "Smooches Ambassador: fair monetization, no exploitation.", trace_id: trace_id, ingest: ingest }));
                return [3 /*break*/, 11];
            case 10:
                e_4 = _j.sent();
                res.status(500).json({ error: "ambassador failed: " + e_4.message });
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); });
// ── USERS ──────────────────────────────────────────────────────────────────
app.get("/api/users/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, password, safe, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, storage_1.storage.getUser(parseInt(req.params.id))];
            case 1:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                password = user.password, safe = __rest(user, ["password"]);
                res.json(safe);
                return [3 /*break*/, 3];
            case 2:
                e_5 = _a.sent();
                res.status(500).json({ message: "Failed to fetch user" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.patch("/api/users/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, currentUserId, _a, displayName, bio, location_1, website, avatar, updated, password, safe, e_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = parseInt(req.params.id);
                currentUserId = (0, simple_auth_1.getCurrentUserId)(req);
                if (!currentUserId || currentUserId !== userId)
                    return [2 /*return*/, res.status(403).json({ message: "Unauthorized" })];
                _a = req.body, displayName = _a.displayName, bio = _a.bio, location_1 = _a.location, website = _a.website, avatar = _a.avatar;
                if (!displayName)
                    return [2 /*return*/, res.status(400).json({ message: "Display name is required" })];
                return [4 /*yield*/, storage_1.storage.updateUser(userId, { displayName: displayName, bio: bio || null, location: location_1 || null, website: website || null, avatar: avatar || null })];
            case 1:
                updated = _b.sent();
                password = updated.password, safe = __rest(updated, ["password"]);
                res.json(safe);
                return [3 /*break*/, 3];
            case 2:
                e_6 = _b.sent();
                res.status(500).json({ message: "Failed to update profile" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Upload avatar as file
app.post("/api/users/:id/avatar", simple_auth_1.requireAuth, uploadAvatar.single('avatar'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, currentUserId, avatarUrl, updated, password, safe, e_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = parseInt(req.params.id);
                currentUserId = (0, simple_auth_1.getCurrentUserId)(req);
                if (!currentUserId || currentUserId !== userId)
                    return [2 /*return*/, res.status(403).json({ message: "Unauthorized" })];
                if (!req.file)
                    return [2 /*return*/, res.status(400).json({ message: "No file uploaded" })];
                avatarUrl = "/uploads/avatars/".concat(req.file.filename);
                return [4 /*yield*/, storage_1.storage.updateUser(userId, { avatar: avatarUrl })];
            case 1:
                updated = _a.sent();
                password = updated.password, safe = __rest(updated, ["password"]);
                res.json(safe);
                return [3 /*break*/, 3];
            case 2:
                e_7 = _a.sent();
                res.status(500).json({ message: "Failed to upload avatar" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Settings (stored client-side, but route must exist)
app.patch("/api/users/:id/settings", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, currentUserId;
    return __generator(this, function (_a) {
        try {
            userId = parseInt(req.params.id);
            currentUserId = (0, simple_auth_1.getCurrentUserId)(req);
            if (!currentUserId || currentUserId !== userId)
                return [2 /*return*/, res.status(403).json({ message: "Unauthorized" })];
            // Settings are client-side preferences; acknowledge save
            res.json({ success: true, settings: req.body });
        }
        catch (e) {
            res.status(500).json({ message: "Failed to save settings" });
        }
        return [2 /*return*/];
    });
}); });
// Upgrade role to creator
app.post("/api/users/:id/upgrade", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, currentUserId, updated, password, safe, e_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = parseInt(req.params.id);
                currentUserId = (0, simple_auth_1.getCurrentUserId)(req);
                if (!currentUserId || currentUserId !== userId)
                    return [2 /*return*/, res.status(403).json({ message: "Unauthorized" })];
                return [4 /*yield*/, storage_1.storage.updateUser(userId, { role: "creator" })];
            case 1:
                updated = _a.sent();
                password = updated.password, safe = __rest(updated, ["password"]);
                res.json(safe);
                return [3 /*break*/, 3];
            case 2:
                e_8 = _a.sent();
                res.status(500).json({ message: "Failed to upgrade account" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get("/api/users/:id/videos", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var videos, e_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, storage_1.storage.getUserVideos(parseInt(req.params.id))];
            case 1:
                videos = _a.sent();
                res.json(videos);
                return [3 /*break*/, 3];
            case 2:
                e_9 = _a.sent();
                res.status(500).json({ message: "Failed to fetch videos" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get("/api/users/:id/followers", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var followers;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getFollowers(parseInt(req.params.id))];
            case 1:
                followers = _a.sent();
                res.json(followers);
                return [2 /*return*/];
        }
    });
}); });
app.get("/api/users/:id/following", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var following;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getFollowing(parseInt(req.params.id))];
            case 1:
                following = _a.sent();
                res.json(following);
                return [2 /*return*/];
        }
    });
}); });
app.get("/api/users/:id/clips", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var clips;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getUserClips(parseInt(req.params.id))];
            case 1:
                clips = _a.sent();
                res.json(clips);
                return [2 /*return*/];
        }
    });
}); });
// ── VIDEOS ─────────────────────────────────────────────────────────────────
app.get("/api/videos", function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var videos;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getVideos()];
            case 1:
                videos = _a.sent();
                res.json(videos);
                return [2 /*return*/];
        }
    });
}); });
app.get("/api/videos/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var video;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getVideo(parseInt(req.params.id))];
            case 1:
                video = _a.sent();
                if (!video)
                    return [2 /*return*/, res.status(404).json({ message: "Video not found" })];
                res.json(video);
                return [2 /*return*/];
        }
    });
}); });
// Upload video with file
app.post("/api/videos", simple_auth_1.requireAuth, uploadVideo.single('video'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, title, description, videoUrl, video, e_10;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                if (!userId)
                    return [2 /*return*/, res.status(401).json({ message: "Not authenticated" })];
                if (!req.file)
                    return [2 /*return*/, res.status(400).json({ message: "No video file uploaded" })];
                _a = req.body, title = _a.title, description = _a.description;
                if (!title)
                    return [2 /*return*/, res.status(400).json({ message: "Title is required" })];
                videoUrl = "/uploads/videos/".concat(req.file.filename);
                return [4 /*yield*/, storage_1.storage.createVideo({
                        userId: userId,
                        title: title,
                        description: description || null,
                        videoUrl: videoUrl,
                        thumbnail: null,
                        isLive: false,
                    })];
            case 1:
                video = _b.sent();
                res.status(201).json(video);
                return [3 /*break*/, 3];
            case 2:
                e_10 = _b.sent();
                console.error('Video upload error:', e_10);
                res.status(500).json({ message: e_10.message || "Upload failed" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Like a video (toggle)
app.post("/api/videos/:id/like", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var videoId, video, newLikes, e_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                videoId = parseInt(req.params.id);
                return [4 /*yield*/, storage_1.storage.getVideo(videoId)];
            case 1:
                video = _a.sent();
                if (!video)
                    return [2 /*return*/, res.status(404).json({ message: "Video not found" })];
                newLikes = (video.likes || 0) + 1;
                // We store likes on the video directly
                return [4 /*yield*/, storage_1.storage.updateVideoLikes(videoId, newLikes)];
            case 2:
                // We store likes on the video directly
                _a.sent();
                res.json({ likes: newLikes });
                return [3 /*break*/, 4];
            case 3:
                e_11 = _a.sent();
                res.status(500).json({ message: "Failed to like video" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// ── COMMENTS ───────────────────────────────────────────────────────────────
app.get("/api/videos/:id/comments", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var comments;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getComments(parseInt(req.params.id))];
            case 1:
                comments = _a.sent();
                res.json(comments);
                return [2 /*return*/];
        }
    });
}); });
app.post("/api/comments", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, result, comment, e_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                result = schema_1.insertCommentSchema.safeParse(__assign(__assign({}, req.body), { userId: userId }));
                if (!result.success)
                    return [2 /*return*/, res.status(400).json({ message: "Invalid comment data" })];
                return [4 /*yield*/, storage_1.storage.createComment(result.data)];
            case 1:
                comment = _a.sent();
                res.status(201).json(comment);
                return [3 /*break*/, 3];
            case 2:
                e_12 = _a.sent();
                res.status(500).json({ message: "Failed to post comment" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── FOLLOWS ────────────────────────────────────────────────────────────────
app.post("/api/follows", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var followerId, result, follow, e_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                followerId = (0, simple_auth_1.getCurrentUserId)(req);
                result = schema_1.insertFollowSchema.safeParse(__assign(__assign({}, req.body), { followerId: followerId }));
                if (!result.success)
                    return [2 /*return*/, res.status(400).json({ message: "Invalid follow data" })];
                return [4 /*yield*/, storage_1.storage.createFollow(result.data)];
            case 1:
                follow = _a.sent();
                res.status(201).json(follow);
                return [3 /*break*/, 3];
            case 2:
                e_13 = _a.sent();
                res.status(500).json({ message: "Failed to follow" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.delete("/api/follows/:followerId/:followingId", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var currentUserId, followerId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                currentUserId = (0, simple_auth_1.getCurrentUserId)(req);
                followerId = parseInt(req.params.followerId);
                if (!currentUserId || currentUserId !== followerId)
                    return [2 /*return*/, res.status(403).json({ message: "Unauthorized" })];
                return [4 /*yield*/, storage_1.storage.deleteFollow(followerId, parseInt(req.params.followingId))];
            case 1:
                _a.sent();
                res.status(204).send();
                return [2 /*return*/];
        }
    });
}); });
// ── RADIO STATIONS ─────────────────────────────────────────────────────────
app.get("/api/radio-stations", function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stations;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getRadioStations()];
            case 1:
                stations = _a.sent();
                res.json(stations);
                return [2 /*return*/];
        }
    });
}); });
app.get("/api/radio-stations/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var station;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getRadioStation(parseInt(req.params.id))];
            case 1:
                station = _a.sent();
                if (!station)
                    return [2 /*return*/, res.status(404).json({ message: "Station not found" })];
                res.json(station);
                return [2 /*return*/];
        }
    });
}); });
app.post("/api/radio-stations", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, result, station, e_14;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                result = schema_1.insertRadioStationSchema.safeParse(__assign(__assign({}, req.body), { userId: userId }));
                if (!result.success)
                    return [2 /*return*/, res.status(400).json({ message: "Invalid station data", errors: result.error.flatten() })];
                return [4 /*yield*/, storage_1.storage.createRadioStation(result.data)];
            case 1:
                station = _a.sent();
                res.status(201).json(station);
                return [3 /*break*/, 3];
            case 2:
                e_14 = _a.sent();
                res.status(500).json({ message: "Failed to create station" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get("/api/radio-stations/:id/schedule", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var schedules;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getStationSchedules(parseInt(req.params.id))];
            case 1:
                schedules = _a.sent();
                res.json(schedules);
                return [2 /*return*/];
        }
    });
}); });
app.get("/api/radio-stations/:id/current-show", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var show;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getCurrentSchedule(parseInt(req.params.id))];
            case 1:
                show = _a.sent();
                if (!show)
                    return [2 /*return*/, res.status(404).json({ message: "No show currently playing" })];
                res.json(show);
                return [2 /*return*/];
        }
    });
}); });
app.post("/api/radio-schedules", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, schedule, e_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                result = schema_1.insertRadioScheduleSchema.safeParse(req.body);
                if (!result.success)
                    return [2 /*return*/, res.status(400).json({ message: "Invalid schedule data" })];
                return [4 /*yield*/, storage_1.storage.createRadioSchedule(result.data)];
            case 1:
                schedule = _a.sent();
                res.status(201).json(schedule);
                return [3 /*break*/, 3];
            case 2:
                e_15 = _a.sent();
                res.status(500).json({ message: "Failed to create schedule" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── REACTIONS ──────────────────────────────────────────────────────────────
app.post("/api/reactions", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, result, reaction, e_16;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                result = schema_1.insertReactionSchema.safeParse(__assign(__assign({}, req.body), { userId: userId }));
                if (!result.success)
                    return [2 /*return*/, res.status(400).json({ message: "Invalid reaction data" })];
                return [4 /*yield*/, storage_1.storage.createReaction(result.data)];
            case 1:
                reaction = _a.sent();
                res.status(201).json(reaction);
                return [3 /*break*/, 3];
            case 2:
                e_16 = _a.sent();
                res.status(500).json({ message: "Failed to create reaction" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get("/api/reactions/:targetType/:targetId", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var reactions;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getReactions(req.params.targetType, parseInt(req.params.targetId))];
            case 1:
                reactions = _a.sent();
                res.json(reactions);
                return [2 /*return*/];
        }
    });
}); });
// ── TRANSACTIONS ───────────────────────────────────────────────────────────
app.post("/api/transactions", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, result, bodyVideoId, txData, transaction, vid, amt, share, month, e_17;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                result = schema_1.insertTransactionSchema.safeParse(__assign(__assign({}, req.body), { userId: userId }));
                if (!result.success)
                    return [2 /*return*/, res.status(400).json({ message: "Invalid transaction data" })];
                bodyVideoId = req.body.videoId ? parseInt(req.body.videoId) : undefined;
                txData = __assign(__assign({}, result.data), { videoId: bodyVideoId, targetUserId: req.body.targetUserId ? parseInt(req.body.targetUserId) : undefined });
                return [4 /*yield*/, storage_1.storage.createTransaction(txData)];
            case 1:
                transaction = _a.sent();
                if (!(result.data.type === 'gift' && bodyVideoId)) return [3 /*break*/, 4];
                return [4 /*yield*/, storage_1.storage.getVideo(bodyVideoId)];
            case 2:
                vid = _a.sent();
                if (!(vid && vid.userId)) return [3 /*break*/, 4];
                amt = parseFloat(String(result.data.amount || '0'));
                share = (amt * 0.85).toFixed(2);
                month = new Date().toISOString().slice(0, 7);
                return [4 /*yield*/, storage_1.storage.createEarnings({ userId: vid.userId, amount: share, type: 'tip', month: month })];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                res.status(201).json(transaction);
                return [3 /*break*/, 6];
            case 5:
                e_17 = _a.sent();
                res.status(500).json({ message: "Failed to create transaction" });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.get("/api/transactions", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, transactions, e_18;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                return [4 /*yield*/, storage_1.storage.getTransactions(userId)];
            case 1:
                transactions = _a.sent();
                res.json(transactions);
                return [3 /*break*/, 3];
            case 2:
                e_18 = _a.sent();
                res.status(500).json({ message: "Failed to fetch transactions" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── SUBSCRIPTIONS ──────────────────────────────────────────────────────────
app.post("/api/subscriptions", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, result, subscription, e_19;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                result = schema_1.insertSubscriptionSchema.safeParse(__assign(__assign({}, req.body), { userId: userId }));
                if (!result.success)
                    return [2 /*return*/, res.status(400).json({ message: "Invalid subscription data" })];
                return [4 /*yield*/, storage_1.storage.createSubscription(result.data)];
            case 1:
                subscription = _a.sent();
                res.status(201).json(subscription);
                return [3 /*break*/, 3];
            case 2:
                e_19 = _a.sent();
                res.status(500).json({ message: "Failed to create subscription" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get("/api/subscriptions", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, subscriptions, e_20;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                return [4 /*yield*/, storage_1.storage.getSubscriptions(userId)];
            case 1:
                subscriptions = _a.sent();
                res.json(subscriptions);
                return [3 /*break*/, 3];
            case 2:
                e_20 = _a.sent();
                res.status(500).json({ message: "Failed to fetch subscriptions" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get("/api/subscriptions/subscribers", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, subscribers, e_21;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                return [4 /*yield*/, storage_1.storage.getSubscribers(userId)];
            case 1:
                subscribers = _a.sent();
                res.json(subscribers);
                return [3 /*break*/, 3];
            case 2:
                e_21 = _a.sent();
                res.status(500).json({ message: "Failed to fetch subscribers" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── EARNINGS ───────────────────────────────────────────────────────────────
app.get("/api/earnings", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, earnings, e_22;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                return [4 /*yield*/, storage_1.storage.getEarnings(userId)];
            case 1:
                earnings = _a.sent();
                res.json(earnings);
                return [3 /*break*/, 3];
            case 2:
                e_22 = _a.sent();
                res.status(500).json({ message: "Failed to fetch earnings" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post("/api/earnings", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, result, earnings, e_23;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = (0, simple_auth_1.getCurrentUserId)(req);
                result = schema_1.insertEarningsSchema.safeParse(__assign(__assign({}, req.body), { userId: userId }));
                if (!result.success)
                    return [2 /*return*/, res.status(400).json({ message: "Invalid earnings data" })];
                return [4 /*yield*/, storage_1.storage.createEarnings(result.data)];
            case 1:
                earnings = _a.sent();
                res.status(201).json(earnings);
                return [3 /*break*/, 3];
            case 2:
                e_23 = _a.sent();
                res.status(500).json({ message: "Failed to create earnings record" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// ── CLIPS ──────────────────────────────────────────────────────────────────
app.get("/api/clips", function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var clips;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getClips()];
            case 1:
                clips = _a.sent();
                res.json(clips);
                return [2 /*return*/];
        }
    });
}); });
app.get("/api/clips/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var clip;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getClip(parseInt(req.params.id))];
            case 1:
                clip = _a.sent();
                if (!clip)
                    return [2 /*return*/, res.status(404).json({ message: "Clip not found" })];
                res.json(clip);
                return [2 /*return*/];
        }
    });
}); });
app.get("/api/radio-stations/:id/clips", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var clips;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, storage_1.storage.getStationClips(parseInt(req.params.id))];
            case 1:
                clips = _a.sent();
                res.json(clips);
                return [2 /*return*/];
        }
    });
}); });
app.post("/api/clips", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, clip, e_24;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                result = schema_1.insertClipSchema.safeParse(req.body);
                if (!result.success)
                    return [2 /*return*/, res.status(400).json({ message: "Invalid clip data" })];
                return [4 /*yield*/, storage_1.storage.createClip(result.data)];
            case 1:
                clip = _a.sent();
                res.status(201).json(clip);
                return [3 /*break*/, 3];
            case 2:
                e_24 = _a.sent();
                res.status(500).json({ message: "Failed to create clip" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post("/api/clips/generate", simple_auth_1.requireAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var result, _a, audioUrl, startTime, endTime, showName, canvas, ctx, gradient, i, height, duration, thumbnailUrl;
    return __generator(this, function (_b) {
        result = clipRequestSchema.safeParse(req.body);
        if (!result.success)
            return [2 /*return*/, res.status(400).json({ message: "Invalid clip data" })];
        try {
            _a = result.data, audioUrl = _a.audioUrl, startTime = _a.startTime, endTime = _a.endTime, showName = _a.showName;
            canvas = (0, canvas_1.createCanvas)(1200, 630);
            ctx = canvas.getContext('2d');
            gradient = ctx.createLinearGradient(0, 0, 1200, 630);
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(1, '#333333');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1200, 630);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (i = 0; i < 1200; i += 10) {
                height = Math.random() * 100 + 265;
                ctx.moveTo(i, height);
                ctx.lineTo(i, 630 - height);
            }
            ctx.stroke();
            ctx.font = 'bold 60px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(showName, 600, 200);
            ctx.font = '40px Arial';
            duration = Math.round(endTime - startTime);
            ctx.fillText("".concat(duration, " second clip"), 600, 280);
            thumbnailUrl = canvas.toDataURL();
            res.json({ clipUrl: audioUrl, thumbnailUrl: thumbnailUrl, duration: duration });
        }
        catch (e) {
            console.error('Clip generation error:', e);
            res.status(500).json({ message: "Failed to generate clip" });
        }
        return [2 /*return*/];
    });
}); });
return httpServer;
