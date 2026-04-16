import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  role: text("role").notNull().default("listener"), // "listener", "creator", "admin"
  isEmailVerified: boolean("is_email_verified").default(false),
  verificationToken: text("verification_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  googleId: text("google_id").unique(),
  facebookId: text("facebook_id").unique(),
  twitterId: text("twitter_id").unique(),
  followers: integer("followers").default(0),
  following: integer("following").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnail: text("thumbnail"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  isLive: boolean("is_live").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  videoId: integer("video_id").references(() => videos.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").references(() => users.id),
  followingId: integer("following_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const radioStations = pgTable("radio_stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  streamUrl: text("stream_url").notNull(),
  coverImage: text("cover_image"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const radioSchedules = pgTable("radio_schedules", {
  id: serial("id").primaryKey(),
  stationId: integer("station_id").references(() => radioStations.id),
  showName: text("show_name").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isRecurring: boolean("is_recurring").default(false),
  recurringDays: text("recurring_days").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  emoji: text("emoji").notNull(),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'donation', 'subscription', 'tip'
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  fromUserId: integer("from_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  creatorId: integer("creator_id").references(() => users.id),
  status: text("status").notNull(), // 'active', 'cancelled', 'expired'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const earnings = pgTable("earnings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'subscription', 'donation', 'tip'
  month: text("month").notNull(), // YYYY-MM format
  createdAt: timestamp("created_at").defaultNow(),
});

export const clips = pgTable("clips", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  stationId: integer("station_id").references(() => radioStations.id),
  showName: text("show_name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  clipUrl: text("clip_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  duration: integer("duration").notNull(), // duration in seconds
  startTime: integer("start_time").notNull(), // start time in seconds
  endTime: integer("end_time").notNull(), // end time in seconds
  sourceUrl: text("source_url").notNull(), // original audio source
  createdAt: timestamp("created_at").defaultNow(),
});

// Sessions table is created manually in auth.ts with the schema expected by connect-pg-simple

export const insertUserSchema = createInsertSchema(users).pick({
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

export const insertVideoSchema = createInsertSchema(videos).pick({
  userId: true,
  title: true,
  description: true,
  videoUrl: true,
  thumbnail: true,
  isLive: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  userId: true,
  videoId: true,
  content: true,
});

export const insertFollowSchema = createInsertSchema(follows).pick({
  followerId: true,
  followingId: true,
});

export const insertRadioStationSchema = createInsertSchema(radioStations).pick({
  name: true,
  description: true,
  streamUrl: true,
  coverImage: true,
  isActive: true,
  userId: true,
});

export const insertRadioScheduleSchema = createInsertSchema(radioSchedules).pick({
  stationId: true,
  showName: true,
  description: true,
  startTime: true,
  endTime: true,
  isRecurring: true,
  recurringDays: true,
});

export const insertReactionSchema = createInsertSchema(reactions).pick({
  userId: true,
  emoji: true,
  targetType: true,
  targetId: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  type: true,
  status: true,
  fromUserId: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  creatorId: true,
  status: true,
  amount: true,
  startDate: true,
  endDate: true,
});

export const insertEarningsSchema = createInsertSchema(earnings).pick({
  userId: true,
  amount: true,
  type: true,
  month: true,
});

export const insertClipSchema = createInsertSchema(clips).pick({
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type InsertRadioStation = z.infer<typeof insertRadioStationSchema>;
export type InsertRadioSchedule = z.infer<typeof insertRadioScheduleSchema>;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertEarnings = z.infer<typeof insertEarningsSchema>;
export type InsertClip = z.infer<typeof insertClipSchema>;

export type User = typeof users.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type RadioStation = typeof radioStations.$inferSelect;
export type RadioSchedule = typeof radioSchedules.$inferSelect;
export type Reaction = typeof reactions.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Earnings = typeof earnings.$inferSelect;
export type Clip = typeof clips.$inferSelect;