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
exports.setupAuth = setupAuth;
exports.isAuthenticated = isAuthenticated;
exports.getCurrentUserId = getCurrentUserId;
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
var passport_1 = require("passport");
var passport_local_1 = require("passport-local");
var passport_google_oauth20_1 = require("passport-google-oauth20");
var passport_facebook_1 = require("passport-facebook");
var express_session_1 = require("express-session");
var connect_pg_simple_1 = require("connect-pg-simple");
var crypto_1 = require("crypto");
var util_1 = require("util");
var storage_1 = require("./storage");
var db_1 = require("./db");
// For password hashing and verification
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
        var _a, hashed, salt, hashedBuf, suppliedBuf, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Handle case where stored password might be undefined or invalid format
                    if (!stored || !stored.includes('.')) {
                        return [2 /*return*/, false];
                    }
                    _a = stored.split("."), hashed = _a[0], salt = _a[1];
                    // Ensure both parts are present
                    if (!hashed || !salt) {
                        return [2 /*return*/, false];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    hashedBuf = Buffer.from(hashed, "hex");
                    return [4 /*yield*/, scryptAsync(supplied, salt, 64)];
                case 2:
                    suppliedBuf = (_b.sent());
                    return [2 /*return*/, (0, crypto_1.timingSafeEqual)(hashedBuf, suppliedBuf)];
                case 3:
                    error_1 = _b.sent();
                    console.error("Password comparison error:", error_1);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function setupAuth(app) {
    var _this = this;
    // Generate a secure random secret for sessions
    var SESSION_SECRET = process.env.SESSION_SECRET || (0, crypto_1.randomBytes)(32).toString("hex");
    // Set up session store with PostgreSQL
    var PgSession = (0, connect_pg_simple_1.default)(express_session_1.default);
    // Create the sessions table manually with the correct schema if needed
    db_1.pool.query("\n    CREATE TABLE IF NOT EXISTS \"session\" (\n      \"sid\" varchar NOT NULL COLLATE \"default\",\n      \"sess\" json NOT NULL,\n      \"expire\" timestamp(6) NOT NULL,\n      CONSTRAINT \"session_pkey\" PRIMARY KEY (\"sid\")\n    )\n  ").catch(function (err) { return console.error('Error creating session table:', err); });
    var sessionStore = new PgSession({
        pool: db_1.pool,
        tableName: 'session', // use "session" not "sessions"
    });
    var sessionSettings = {
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
        }
    };
    app.set("trust proxy", 1);
    app.use((0, express_session_1.default)(sessionSettings));
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    // Configure local strategy for username/password authentication
    passport_1.default.use(new passport_local_1.Strategy({
        usernameField: "username", // Default
        passwordField: "password", // Default
    }, function (username, password, done) { return __awaiter(_this, void 0, void 0, function () {
        var user, _a, _b, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, storage_1.storage.getUserByUsername(username)];
                case 1:
                    _a = (_c.sent());
                    if (_a) return [3 /*break*/, 3];
                    return [4 /*yield*/, storage_1.storage.getUserByEmail(username)];
                case 2:
                    _a = (_c.sent());
                    _c.label = 3;
                case 3:
                    user = _a;
                    _b = !user;
                    if (_b) return [3 /*break*/, 5];
                    return [4 /*yield*/, comparePasswords(password, user.password)];
                case 4:
                    _b = !(_c.sent());
                    _c.label = 5;
                case 5:
                    if (_b) {
                        return [2 /*return*/, done(null, false, { message: "Invalid username or password" })];
                    }
                    return [2 /*return*/, done(null, user)];
                case 6:
                    error_2 = _c.sent();
                    return [2 /*return*/, done(error_2)];
                case 7: return [2 /*return*/];
            }
        });
    }); }));
    // Only set up Google OAuth if credentials are provided
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport_1.default.use(new passport_google_oauth20_1.Strategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
            scope: ["profile", "email"],
        }, function (accessToken, refreshToken, profile, done) { return __awaiter(_this, void 0, void 0, function () {
            var email, user, username, displayName, avatar, _a, _b, error_3;
            var _c;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 8, , 9]);
                        email = profile.emails && ((_d = profile.emails[0]) === null || _d === void 0 ? void 0 : _d.value);
                        if (!email) {
                            return [2 /*return*/, done(new Error("No email found from Google profile"))];
                        }
                        return [4 /*yield*/, storage_1.storage.getUserByGoogleId(profile.id)];
                    case 1:
                        user = _f.sent();
                        if (!!user) return [3 /*break*/, 7];
                        return [4 /*yield*/, storage_1.storage.getUserByEmail(email)];
                    case 2:
                        // Check if user exists with this email
                        user = _f.sent();
                        if (!user) return [3 /*break*/, 4];
                        return [4 /*yield*/, storage_1.storage.updateUser(user.id, {
                                googleId: profile.id,
                            })];
                    case 3:
                        // Link Google ID to existing account
                        user = _f.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        username = "google_".concat(profile.id);
                        displayName = profile.displayName || username;
                        avatar = profile.photos && ((_e = profile.photos[0]) === null || _e === void 0 ? void 0 : _e.value);
                        _b = (_a = storage_1.storage).createUser;
                        _c = {
                            username: username,
                            email: email
                        };
                        return [4 /*yield*/, hashPassword((0, crypto_1.randomBytes)(16).toString("hex"))];
                    case 5: return [4 /*yield*/, _b.apply(_a, [(_c.password = _f.sent(),
                                _c.displayName = displayName,
                                _c.googleId = profile.id,
                                _c.avatar = avatar,
                                _c.isEmailVerified = true,
                                _c)])];
                    case 6:
                        user = _f.sent();
                        _f.label = 7;
                    case 7: return [2 /*return*/, done(null, user)];
                    case 8:
                        error_3 = _f.sent();
                        return [2 /*return*/, done(error_3)];
                    case 9: return [2 /*return*/];
                }
            });
        }); }));
    }
    // Only set up Facebook OAuth if credentials are provided
    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
        passport_1.default.use(new passport_facebook_1.Strategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: "/api/auth/facebook/callback",
            profileFields: ["id", "displayName", "photos", "email"],
        }, function (accessToken, refreshToken, profile, done) { return __awaiter(_this, void 0, void 0, function () {
            var email, user, username, displayName, avatar, _a, _b, error_4;
            var _c;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 8, , 9]);
                        email = profile.emails && ((_d = profile.emails[0]) === null || _d === void 0 ? void 0 : _d.value);
                        if (!email) {
                            return [2 /*return*/, done(new Error("No email found from Facebook profile"))];
                        }
                        return [4 /*yield*/, storage_1.storage.getUserByFacebookId(profile.id)];
                    case 1:
                        user = _f.sent();
                        if (!!user) return [3 /*break*/, 7];
                        return [4 /*yield*/, storage_1.storage.getUserByEmail(email)];
                    case 2:
                        // Check if user exists with this email
                        user = _f.sent();
                        if (!user) return [3 /*break*/, 4];
                        return [4 /*yield*/, storage_1.storage.updateUser(user.id, {
                                facebookId: profile.id,
                            })];
                    case 3:
                        // Link Facebook ID to existing account
                        user = _f.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        username = "facebook_".concat(profile.id);
                        displayName = profile.displayName || username;
                        avatar = profile.photos && ((_e = profile.photos[0]) === null || _e === void 0 ? void 0 : _e.value);
                        _b = (_a = storage_1.storage).createUser;
                        _c = {
                            username: username,
                            email: email
                        };
                        return [4 /*yield*/, hashPassword((0, crypto_1.randomBytes)(16).toString("hex"))];
                    case 5: return [4 /*yield*/, _b.apply(_a, [(_c.password = _f.sent(),
                                _c.displayName = displayName,
                                _c.facebookId = profile.id,
                                _c.avatar = avatar,
                                _c.isEmailVerified = true,
                                _c)])];
                    case 6:
                        user = _f.sent();
                        _f.label = 7;
                    case 7: return [2 /*return*/, done(null, user)];
                    case 8:
                        error_4 = _f.sent();
                        return [2 /*return*/, done(error_4)];
                    case 9: return [2 /*return*/];
                }
            });
        }); }));
    }
    // Serialize and deserialize user for session management
    passport_1.default.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(function (id, done) { return __awaiter(_this, void 0, void 0, function () {
        var user, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_1.storage.getUser(id)];
                case 1:
                    user = _a.sent();
                    if (!user) {
                        return [2 /*return*/, done(new Error("User not found"))];
                    }
                    done(null, user);
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    done(error_5);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Authentication routes
    app.post("/api/auth/register", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var existingUsername, existingEmail, hashedPassword, user_1, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, storage_1.storage.getUserByUsername(req.body.username)];
                case 1:
                    existingUsername = _a.sent();
                    if (existingUsername) {
                        return [2 /*return*/, res.status(400).json({ error: "Username already taken" })];
                    }
                    return [4 /*yield*/, storage_1.storage.getUserByEmail(req.body.email)];
                case 2:
                    existingEmail = _a.sent();
                    if (existingEmail) {
                        return [2 /*return*/, res.status(400).json({ error: "Email already registered" })];
                    }
                    return [4 /*yield*/, hashPassword(req.body.password)];
                case 3:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, storage_1.storage.createUser(__assign(__assign({}, req.body), { password: hashedPassword }))];
                case 4:
                    user_1 = _a.sent();
                    // Log the user in automatically after registration
                    req.login(user_1, function (err) {
                        if (err)
                            return next(err);
                        // Return user data without password
                        var password = user_1.password, userWithoutPassword = __rest(user_1, ["password"]);
                        res.status(201).json(userWithoutPassword);
                    });
                    return [3 /*break*/, 6];
                case 5:
                    error_6 = _a.sent();
                    next(error_6);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    app.post("/api/auth/login", function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            passport_1.default.authenticate("local", function (err, user, info) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return res.status(401).json({ error: (info === null || info === void 0 ? void 0 : info.message) || "Invalid username or password" });
                }
                req.login(user, function (loginErr) {
                    if (loginErr) {
                        return next(loginErr);
                    }
                    var password = user.password, userWithoutPassword = __rest(user, ["password"]);
                    return res.json(userWithoutPassword);
                });
            })(req, res, next);
            return [2 /*return*/];
        });
    }); });
    app.post("/api/auth/logout", function (req, res, next) {
        req.logout(function (err) {
            if (err)
                return next(err);
            res.status(200).json({ message: "Logged out successfully" });
        });
    });
    app.get("/api/auth/user", function (req, res) {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        var _a = req.user, password = _a.password, userWithoutPassword = __rest(_a, ["password"]);
        res.json(userWithoutPassword);
    });
    // Google OAuth routes
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        app.get("/api/auth/google", passport_1.default.authenticate("google"));
        app.get("/api/auth/google/callback", passport_1.default.authenticate("google", {
            failureRedirect: "/auth",
            successRedirect: "/",
        }));
    }
    // Facebook OAuth routes
    if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
        app.get("/api/auth/facebook", passport_1.default.authenticate("facebook", { scope: ["email"] }));
        app.get("/api/auth/facebook/callback", passport_1.default.authenticate("facebook", {
            failureRedirect: "/auth",
            successRedirect: "/",
        }));
    }
    // Route middleware to check if user is authenticated
    app.use("/api/protected", function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.status(401).json({ error: "Unauthorized" });
    });
    // Role-based middleware
    app.use("/api/admin", function (req, res, next) {
        if (req.isAuthenticated() && req.user.role === "admin") {
            return next();
        }
        res.status(403).json({ error: "Forbidden" });
    });
    app.use("/api/creator", function (req, res, next) {
        if (req.isAuthenticated() &&
            (req.user.role === "creator" || req.user.role === "admin")) {
            return next();
        }
        res.status(403).json({ error: "Forbidden" });
    });
}
// Helper function to export for use in other parts of the app
function isAuthenticated(req) {
    return req.isAuthenticated();
}
// Helper to get current user id safely
function getCurrentUserId(req) {
    return req.isAuthenticated() ? req.user.id : undefined;
}
