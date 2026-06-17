"use strict";
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
exports.setupSimpleAuth = setupSimpleAuth;
exports.requireAuth = requireAuth;
exports.getCurrentUserId = getCurrentUserId;
var express_session_1 = require("express-session");
var crypto_1 = require("crypto");
var util_1 = require("util");
var storage_1 = require("./storage");
var scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    salt = (0, crypto_1.randomBytes)(16).toString("hex");
                    return [4 /*yield*/, scryptAsync(password, salt, 64)];
                case 1:
                    buf = (_a.sent());
                    return [2 /*return*/, "".concat(buf.toString("hex"), ".").concat(salt)];
            }
        });
    });
}
function comparePasswords(supplied, stored) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, hashed, salt, hashedBuf, suppliedBuf, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!stored || !stored.includes('.'))
                        return [2 /*return*/, false];
                    _a = stored.split("."), hashed = _a[0], salt = _a[1];
                    if (!hashed || !salt)
                        return [2 /*return*/, false];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    hashedBuf = Buffer.from(hashed, "hex");
                    return [4 /*yield*/, scryptAsync(supplied, salt, 64)];
                case 2:
                    suppliedBuf = (_c.sent());
                    return [2 /*return*/, (0, crypto_1.timingSafeEqual)(hashedBuf, suppliedBuf)];
                case 3:
                    _b = _c.sent();
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function setupSimpleAuth(app) {
    var _this = this;
    app.use((0, express_session_1.default)({
        secret: process.env.SESSION_SECRET || "smooches-secret-2024",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }
    }));
    // Login endpoint
    app.post("/api/auth/login", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, username, password, user, validPassword, _, safeUser, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    _a = req.body, username = _a.username, password = _a.password;
                    if (!username || !password) {
                        return [2 /*return*/, res.status(400).json({ error: "Username and password required" })];
                    }
                    return [4 /*yield*/, storage_1.storage.getUserByUsername(username)];
                case 1:
                    user = _b.sent();
                    if (!user) {
                        return [2 /*return*/, res.status(401).json({ error: "Invalid username or password" })];
                    }
                    return [4 /*yield*/, comparePasswords(password, user.password)];
                case 2:
                    validPassword = _b.sent();
                    if (!validPassword) {
                        return [2 /*return*/, res.status(401).json({ error: "Invalid username or password" })];
                    }
                    req.session.userId = user.id;
                    _ = user.password, safeUser = __rest(user, ["password"]);
                    res.json(safeUser);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.error("Login error:", error_1);
                    res.status(500).json({ error: "Login failed" });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Register endpoint
    app.post("/api/auth/register", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, username, email, password, displayName, existingUser, emailUser, hashedPassword, newUser, _, safeUser, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    _a = req.body, username = _a.username, email = _a.email, password = _a.password, displayName = _a.displayName;
                    if (!username || !email || !password || !displayName) {
                        return [2 /*return*/, res.status(400).json({ error: "All fields required" })];
                    }
                    return [4 /*yield*/, storage_1.storage.getUserByUsername(username)];
                case 1:
                    existingUser = _b.sent();
                    if (existingUser) {
                        return [2 /*return*/, res.status(400).json({ error: "Username already taken" })];
                    }
                    return [4 /*yield*/, storage_1.storage.getUserByEmail(email)];
                case 2:
                    emailUser = _b.sent();
                    if (emailUser) {
                        return [2 /*return*/, res.status(400).json({ error: "Email already registered" })];
                    }
                    return [4 /*yield*/, hashPassword(password)];
                case 3:
                    hashedPassword = _b.sent();
                    return [4 /*yield*/, storage_1.storage.createUser({
                            username: username,
                            email: email,
                            password: hashedPassword,
                            displayName: displayName,
                            role: "listener"
                        })];
                case 4:
                    newUser = _b.sent();
                    req.session.userId = newUser.id;
                    _ = newUser.password, safeUser = __rest(newUser, ["password"]);
                    res.status(201).json(safeUser);
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _b.sent();
                    console.error("Registration error:", error_2);
                    res.status(500).json({ error: "Registration failed" });
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    // Get current user
    app.get("/api/auth/user", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var user, _, safeUser, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!req.session.userId) {
                        return [2 /*return*/, res.status(401).json({ error: "Not authenticated" })];
                    }
                    return [4 /*yield*/, storage_1.storage.getUser(req.session.userId)];
                case 1:
                    user = _a.sent();
                    if (!user) {
                        req.session.userId = undefined;
                        return [2 /*return*/, res.status(401).json({ error: "User not found" })];
                    }
                    _ = user.password, safeUser = __rest(user, ["password"]);
                    res.json(safeUser);
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error("Auth check error:", error_3);
                    res.status(500).json({ error: "Authentication check failed" });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Logout endpoint
    app.post("/api/auth/logout", function (req, res) {
        req.session.destroy(function (err) {
            if (err) {
                console.error("Logout error:", err);
                return res.status(500).json({ error: "Logout failed" });
            }
            res.clearCookie('connect.sid');
            res.json({ message: "Logged out successfully" });
        });
    });
}
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Authentication required" });
    }
    next();
}
function getCurrentUserId(req) {
    return req.session.userId;
}
