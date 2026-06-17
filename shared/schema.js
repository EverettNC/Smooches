"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertClipSchema = exports.insertEarningsSchema = exports.insertSubscriptionSchema = exports.insertTransactionSchema = exports.insertReactionSchema = exports.insertRadioScheduleSchema = exports.insertRadioStationSchema = exports.insertFollowSchema = exports.insertCommentSchema = exports.insertVideoSchema = exports.insertUserSchema = exports.clips = exports.earnings = exports.subscriptions = exports.transactions = exports.reactions = exports.radioSchedules = exports.radioStations = exports.follows = exports.comments = exports.videos = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    displayName: (0, pg_core_1.text)("display_name").notNull(),
    avatar: (0, pg_core_1.text)("avatar"),
    bio: (0, pg_core_1.text)("bio"),
    location: (0, pg_core_1.text)("location"),
    website: (0, pg_core_1.text)("website"),
    role: (0, pg_core_1.text)("role").notNull().default("listener"), // "listener", "creator", "admin"
    isEmailVerified: (0, pg_core_1.boolean)("is_email_verified").default(false),
    verificationToken: (0, pg_core_1.text)("verification_token"),
    resetPasswordToken: (0, pg_core_1.text)("reset_password_token"),
    resetPasswordExpires: (0, pg_core_1.timestamp)("reset_password_expires"),
    googleId: (0, pg_core_1.text)("google_id").unique(),
    facebookId: (0, pg_core_1.text)("facebook_id").unique(),
    twitterId: (0, pg_core_1.text)("twitter_id").unique(),
    followers: (0, pg_core_1.integer)("followers").default(0),
    following: (0, pg_core_1.integer)("following").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.videos = (0, pg_core_1.pgTable)("videos", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    videoUrl: (0, pg_core_1.text)("video_url").notNull(),
    thumbnail: (0, pg_core_1.text)("thumbnail"),
    likes: (0, pg_core_1.integer)("likes").default(0),
    comments: (0, pg_core_1.integer)("comments").default(0),
    isLive: (0, pg_core_1.boolean)("is_live").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.comments = (0, pg_core_1.pgTable)("comments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }),
    videoId: (0, pg_core_1.integer)("video_id").references(function () { return exports.videos.id; }),
    content: (0, pg_core_1.text)("content").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.follows = (0, pg_core_1.pgTable)("follows", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    followerId: (0, pg_core_1.integer)("follower_id").references(function () { return exports.users.id; }),
    followingId: (0, pg_core_1.integer)("following_id").references(function () { return exports.users.id; }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.radioStations = (0, pg_core_1.pgTable)("radio_stations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    streamUrl: (0, pg_core_1.text)("stream_url").notNull(),
    coverImage: (0, pg_core_1.text)("cover_image"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }),
});
exports.radioSchedules = (0, pg_core_1.pgTable)("radio_schedules", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    stationId: (0, pg_core_1.integer)("station_id").references(function () { return exports.radioStations.id; }),
    showName: (0, pg_core_1.text)("show_name").notNull(),
    description: (0, pg_core_1.text)("description"),
    startTime: (0, pg_core_1.timestamp)("start_time").notNull(),
    endTime: (0, pg_core_1.timestamp)("end_time").notNull(),
    isRecurring: (0, pg_core_1.boolean)("is_recurring").default(false),
    recurringDays: (0, pg_core_1.text)("recurring_days").array(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.reactions = (0, pg_core_1.pgTable)("reactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }),
    emoji: (0, pg_core_1.text)("emoji").notNull(),
    targetType: (0, pg_core_1.text)("target_type").notNull(),
    targetId: (0, pg_core_1.integer)("target_id").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.transactions = (0, pg_core_1.pgTable)("transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }),
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    type: (0, pg_core_1.text)("type").notNull(),
    status: (0, pg_core_1.text)("status").notNull(),
    fromUserId: (0, pg_core_1.integer)("from_user_id").references(function () { return exports.users.id; }),
    videoId: (0, pg_core_1.integer)("video_id").references(function () { return exports.videos.id; }),
    targetUserId: (0, pg_core_1.integer)("target_user_id").references(function () { return exports.users.id; }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.subscriptions = (0, pg_core_1.pgTable)("subscriptions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }),
    creatorId: (0, pg_core_1.integer)("creator_id").references(function () { return exports.users.id; }),
    status: (0, pg_core_1.text)("status").notNull(), // 'active', 'cancelled', 'expired'
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    startDate: (0, pg_core_1.timestamp)("start_date").notNull(),
    endDate: (0, pg_core_1.timestamp)("end_date").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.earnings = (0, pg_core_1.pgTable)("earnings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }),
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // 'subscription', 'donation', 'tip'
    month: (0, pg_core_1.text)("month").notNull(), // YYYY-MM format
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.clips = (0, pg_core_1.pgTable)("clips", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }),
    stationId: (0, pg_core_1.integer)("station_id").references(function () { return exports.radioStations.id; }),
    showName: (0, pg_core_1.text)("show_name").notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    clipUrl: (0, pg_core_1.text)("clip_url").notNull(),
    thumbnailUrl: (0, pg_core_1.text)("thumbnail_url").notNull(),
    duration: (0, pg_core_1.integer)("duration").notNull(), // duration in seconds
    startTime: (0, pg_core_1.integer)("start_time").notNull(), // start time in seconds
    endTime: (0, pg_core_1.integer)("end_time").notNull(), // end time in seconds
    sourceUrl: (0, pg_core_1.text)("source_url").notNull(), // original audio source
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Sessions table is created manually in auth.ts with the schema expected by connect-pg-simple
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    email: true,
    password: true,
    displayName: true,
    avatar: true,
    bio: true,
    role: true,
    isEmailVerified: true,
    verificationToken: true,
    resetPasswordToken: true,
    resetPasswordExpires: true,
    googleId: true,
    facebookId: true,
    twitterId: true,
});
exports.insertVideoSchema = (0, drizzle_zod_1.createInsertSchema)(exports.videos).pick({
    userId: true,
    title: true,
    description: true,
    videoUrl: true,
    thumbnail: true,
    isLive: true,
});
exports.insertCommentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.comments).pick({
    userId: true,
    videoId: true,
    content: true,
});
exports.insertFollowSchema = (0, drizzle_zod_1.createInsertSchema)(exports.follows).pick({
    followerId: true,
    followingId: true,
});
exports.insertRadioStationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.radioStations).pick({
    name: true,
    description: true,
    streamUrl: true,
    coverImage: true,
    isActive: true,
    userId: true,
});
exports.insertRadioScheduleSchema = (0, drizzle_zod_1.createInsertSchema)(exports.radioSchedules).pick({
    stationId: true,
    showName: true,
    description: true,
    startTime: true,
    endTime: true,
    isRecurring: true,
    recurringDays: true,
});
exports.insertReactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.reactions).pick({
    userId: true,
    emoji: true,
    targetType: true,
    targetId: true,
});
exports.insertTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transactions).pick({
    userId: true,
    amount: true,
    type: true,
    status: true,
    fromUserId: true,
});
exports.insertSubscriptionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.subscriptions).pick({
    userId: true,
    creatorId: true,
    status: true,
    amount: true,
    startDate: true,
    endDate: true,
});
exports.insertEarningsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.earnings).pick({
    userId: true,
    amount: true,
    type: true,
    month: true,
});
exports.insertClipSchema = (0, drizzle_zod_1.createInsertSchema)(exports.clips).pick({
    userId: true,
    stationId: true,
    showName: true,
    title: true,
    description: true,
    clipUrl: true,
    thumbnailUrl: true,
    duration: true,
    startTime: true,
    endTime: true,
    sourceUrl: true,
});
