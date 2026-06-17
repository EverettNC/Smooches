"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
var schema_1 = require("@shared/schema");
var db_1 = require("./db");
var drizzle_orm_1 = require("drizzle-orm");
var DatabaseStorage = /** @class */ (function () {
    function DatabaseStorage() {
    }
    DatabaseStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByGoogleId = function (googleId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.googleId, googleId))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByFacebookId = function (facebookId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.facebookId, facebookId))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserByTwitterId = function (twitterId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.twitterId, twitterId))];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.createUser = function (insertUser) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.users).values(insertUser).returning()];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateUser = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .update(schema_1.users)
                            .set(updates)
                            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                            .returning()];
                    case 1:
                        updatedUser = (_a.sent())[0];
                        return [2 /*return*/, updatedUser];
                }
            });
        });
    };
    DatabaseStorage.prototype.getVideo = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var video;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.videos).where((0, drizzle_orm_1.eq)(schema_1.videos.id, id))];
                    case 1:
                        video = (_a.sent())[0];
                        return [2 /*return*/, video];
                }
            });
        });
    };
    DatabaseStorage.prototype.getVideos = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.videos)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserVideos = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.videos).where((0, drizzle_orm_1.eq)(schema_1.videos.userId, userId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createVideo = function (insertVideo) {
        return __awaiter(this, void 0, void 0, function () {
            var video;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.videos).values(insertVideo).returning()];
                    case 1:
                        video = (_a.sent())[0];
                        return [2 /*return*/, video];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateVideoLikes = function (id, likes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.update(schema_1.videos).set({ likes: likes }).where((0, drizzle_orm_1.eq)(schema_1.videos.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.updateVideoComments = function (id, count) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.update(schema_1.videos).set({ comments: count }).where((0, drizzle_orm_1.eq)(schema_1.videos.id, id))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getComments = function (videoId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.comments).where((0, drizzle_orm_1.eq)(schema_1.comments.videoId, videoId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createComment = function (insertComment) {
        return __awaiter(this, void 0, void 0, function () {
            var comment, commentCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.comments).values(insertComment).returning()];
                    case 1:
                        comment = (_a.sent())[0];
                        if (!comment.videoId) return [3 /*break*/, 4];
                        return [4 /*yield*/, db_1.db
                                .select({ count: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                                .from(schema_1.comments)
                                .where((0, drizzle_orm_1.eq)(schema_1.comments.videoId, comment.videoId))];
                    case 2:
                        commentCount = _a.sent();
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.videos)
                                .set({ comments: commentCount[0].count })
                                .where((0, drizzle_orm_1.eq)(schema_1.videos.id, comment.videoId))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, comment];
                }
            });
        });
    };
    DatabaseStorage.prototype.createFollow = function (insertFollow) {
        return __awaiter(this, void 0, void 0, function () {
            var follow, followingCount, followerCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.follows).values(insertFollow).returning()];
                    case 1:
                        follow = (_a.sent())[0];
                        if (!(follow.followerId && follow.followingId)) return [3 /*break*/, 6];
                        return [4 /*yield*/, db_1.db
                                .select({ count: (0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                                .from(schema_1.follows)
                                .where((0, drizzle_orm_1.eq)(schema_1.follows.followerId, follow.followerId))];
                    case 2:
                        followingCount = _a.sent();
                        return [4 /*yield*/, db_1.db
                                .select({ count: (0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                                .from(schema_1.follows)
                                .where((0, drizzle_orm_1.eq)(schema_1.follows.followingId, follow.followingId))];
                    case 3:
                        followerCount = _a.sent();
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.users)
                                .set({ following: followingCount[0].count })
                                .where((0, drizzle_orm_1.eq)(schema_1.users.id, follow.followerId))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.users)
                                .set({ followers: followerCount[0].count })
                                .where((0, drizzle_orm_1.eq)(schema_1.users.id, follow.followingId))];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, follow];
                }
            });
        });
    };
    DatabaseStorage.prototype.deleteFollow = function (followerId, followingId) {
        return __awaiter(this, void 0, void 0, function () {
            var followingCount, followerCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.delete(schema_1.follows)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.follows.followerId, followerId), (0, drizzle_orm_1.eq)(schema_1.follows.followingId, followingId)))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, db_1.db
                                .select({ count: (0, drizzle_orm_1.sql)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                                .from(schema_1.follows)
                                .where((0, drizzle_orm_1.eq)(schema_1.follows.followerId, followerId))];
                    case 2:
                        followingCount = _a.sent();
                        return [4 /*yield*/, db_1.db
                                .select({ count: (0, drizzle_orm_1.sql)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                                .from(schema_1.follows)
                                .where((0, drizzle_orm_1.eq)(schema_1.follows.followingId, followingId))];
                    case 3:
                        followerCount = _a.sent();
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.users)
                                .set({ following: followingCount[0].count })
                                .where((0, drizzle_orm_1.eq)(schema_1.users.id, followerId))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.users)
                                .set({ followers: followerCount[0].count })
                                .where((0, drizzle_orm_1.eq)(schema_1.users.id, followingId))];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatabaseStorage.prototype.getFollowers = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select({ user: schema_1.users })
                            .from(schema_1.follows)
                            .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.id, schema_1.follows.followerId))
                            .where((0, drizzle_orm_1.eq)(schema_1.follows.followingId, userId))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(function (r) { return r.user; })];
                }
            });
        });
    };
    DatabaseStorage.prototype.getFollowing = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select({ user: schema_1.users })
                            .from(schema_1.follows)
                            .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.id, schema_1.follows.followingId))
                            .where((0, drizzle_orm_1.eq)(schema_1.follows.followerId, userId))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(function (r) { return r.user; })];
                }
            });
        });
    };
    DatabaseStorage.prototype.getRadioStation = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var station;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.radioStations)
                            .where((0, drizzle_orm_1.eq)(schema_1.radioStations.id, id))];
                    case 1:
                        station = (_a.sent())[0];
                        return [2 /*return*/, station];
                }
            });
        });
    };
    DatabaseStorage.prototype.getRadioStations = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.radioStations)
                            .where((0, drizzle_orm_1.eq)(schema_1.radioStations.isActive, true))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createRadioStation = function (station) {
        return __awaiter(this, void 0, void 0, function () {
            var newStation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .insert(schema_1.radioStations)
                            .values(station)
                            .returning()];
                    case 1:
                        newStation = (_a.sent())[0];
                        return [2 /*return*/, newStation];
                }
            });
        });
    };
    DatabaseStorage.prototype.getRadioSchedule = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var schedule;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.radioSchedules)
                            .where((0, drizzle_orm_1.eq)(schema_1.radioSchedules.id, id))];
                    case 1:
                        schedule = (_a.sent())[0];
                        return [2 /*return*/, schedule];
                }
            });
        });
    };
    DatabaseStorage.prototype.getStationSchedules = function (stationId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.radioSchedules)
                            .where((0, drizzle_orm_1.eq)(schema_1.radioSchedules.stationId, stationId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createRadioSchedule = function (schedule) {
        return __awaiter(this, void 0, void 0, function () {
            var newSchedule;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .insert(schema_1.radioSchedules)
                            .values(schedule)
                            .returning()];
                    case 1:
                        newSchedule = (_a.sent())[0];
                        return [2 /*return*/, newSchedule];
                }
            });
        });
    };
    DatabaseStorage.prototype.getCurrentSchedule = function (stationId) {
        return __awaiter(this, void 0, void 0, function () {
            var now, currentShow;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        return [4 /*yield*/, db_1.db
                                .select()
                                .from(schema_1.radioSchedules)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.radioSchedules.stationId, stationId), (0, drizzle_orm_1.lte)(schema_1.radioSchedules.startTime, now), (0, drizzle_orm_1.gte)(schema_1.radioSchedules.endTime, now)))];
                    case 1:
                        currentShow = (_a.sent())[0];
                        return [2 /*return*/, currentShow];
                }
            });
        });
    };
    DatabaseStorage.prototype.createReaction = function (reaction) {
        return __awaiter(this, void 0, void 0, function () {
            var newReaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .insert(schema_1.reactions)
                            .values(reaction)
                            .returning()];
                    case 1:
                        newReaction = (_a.sent())[0];
                        return [2 /*return*/, newReaction];
                }
            });
        });
    };
    DatabaseStorage.prototype.getReactions = function (targetType, targetId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.reactions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.reactions.targetType, targetType), (0, drizzle_orm_1.eq)(schema_1.reactions.targetId, targetId)))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getTransactions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.transactions)
                            .where((0, drizzle_orm_1.eq)(schema_1.transactions.userId, userId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var newTransaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .insert(schema_1.transactions)
                            .values(transaction)
                            .returning()];
                    case 1:
                        newTransaction = (_a.sent())[0];
                        return [2 /*return*/, newTransaction];
                }
            });
        });
    };
    DatabaseStorage.prototype.getGiftsReceived = function (creatorId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.transactions)
                            .where((0, drizzle_orm_1.eq)(schema_1.transactions.targetUserId, creatorId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getSubscriptions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.subscriptions)
                            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.userId, userId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getSubscribers = function (creatorId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.subscriptions)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.subscriptions.creatorId, creatorId), (0, drizzle_orm_1.eq)(schema_1.subscriptions.status, 'active')))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createSubscription = function (subscription) {
        return __awaiter(this, void 0, void 0, function () {
            var newSubscription;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .insert(schema_1.subscriptions)
                            .values(subscription)
                            .returning()];
                    case 1:
                        newSubscription = (_a.sent())[0];
                        return [2 /*return*/, newSubscription];
                }
            });
        });
    };
    DatabaseStorage.prototype.getEarnings = function (userId, month) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!month) return [3 /*break*/, 2];
                        return [4 /*yield*/, db_1.db.select()
                                .from(schema_1.earnings)
                                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.earnings.userId, userId), (0, drizzle_orm_1.eq)(schema_1.earnings.month, month)))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, db_1.db.select()
                            .from(schema_1.earnings)
                            .where((0, drizzle_orm_1.eq)(schema_1.earnings.userId, userId))];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createEarnings = function (earning) {
        return __awaiter(this, void 0, void 0, function () {
            var newEarning;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .insert(schema_1.earnings)
                            .values(earning)
                            .returning()];
                    case 1:
                        newEarning = (_a.sent())[0];
                        return [2 /*return*/, newEarning];
                }
            });
        });
    };
    DatabaseStorage.prototype.getClip = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var clip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.clips)
                            .where((0, drizzle_orm_1.eq)(schema_1.clips.id, id))];
                    case 1:
                        clip = (_a.sent())[0];
                        return [2 /*return*/, clip];
                }
            });
        });
    };
    DatabaseStorage.prototype.getClips = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.clips)
                            .orderBy((0, drizzle_orm_1.sql)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["", " DESC"], ["", " DESC"])), schema_1.clips.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getUserClips = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.clips)
                            .where((0, drizzle_orm_1.eq)(schema_1.clips.userId, userId))
                            .orderBy((0, drizzle_orm_1.sql)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["", " DESC"], ["", " DESC"])), schema_1.clips.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.getStationClips = function (stationId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.clips)
                            .where((0, drizzle_orm_1.eq)(schema_1.clips.stationId, stationId))
                            .orderBy((0, drizzle_orm_1.sql)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["", " DESC"], ["", " DESC"])), schema_1.clips.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DatabaseStorage.prototype.createClip = function (clip) {
        return __awaiter(this, void 0, void 0, function () {
            var newClip;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .insert(schema_1.clips)
                            .values(clip)
                            .returning()];
                    case 1:
                        newClip = (_a.sent())[0];
                        return [2 /*return*/, newClip];
                }
            });
        });
    };
    return DatabaseStorage;
}());
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8;
