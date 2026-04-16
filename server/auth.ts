import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy, Profile as GoogleProfile, VerifyCallback as GoogleVerifyCallback } from "passport-google-oauth20";
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from "passport-facebook";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { pool } from "./db";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// For password hashing and verification
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // Handle case where stored password might be undefined or invalid format
  if (!stored || !stored.includes('.')) {
    return false;
  }
  
  const [hashed, salt] = stored.split(".");
  
  // Ensure both parts are present
  if (!hashed || !salt) {
    return false;
  }
  
  try {
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Generate a secure random secret for sessions
  const SESSION_SECRET = process.env.SESSION_SECRET || randomBytes(32).toString("hex");
  
  // Set up session store with PostgreSQL
  const PgSession = connectPgSimple(session);
  
  // Create the sessions table manually with the correct schema if needed
  pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    )
  `).catch(err => console.error('Error creating session table:', err));
  
  const sessionStore = new PgSession({
    pool,
    tableName: 'session', // use "session" not "sessions"
  });

  const sessionSettings: session.SessionOptions = {
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
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure local strategy for username/password authentication
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username", // Default
        passwordField: "password", // Default
      },
      async (username, password, done) => {
        try {
          // Find user by username or email
          const user = await storage.getUserByUsername(username) || 
                      await storage.getUserByEmail(username);
          
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Invalid username or password" });
          }
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Only set up Google OAuth if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
          scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails && profile.emails[0]?.value;
            if (!email) {
              return done(new Error("No email found from Google profile"));
            }

            // Check if user exists with this Google ID
            let user = await storage.getUserByGoogleId(profile.id);
            
            if (!user) {
              // Check if user exists with this email
              user = await storage.getUserByEmail(email);
              
              if (user) {
                // Link Google ID to existing account
                user = await storage.updateUser(user.id, {
                  googleId: profile.id,
                });
              } else {
                // Create a new user
                const username = `google_${profile.id}`;
                const displayName = profile.displayName || username;
                const avatar = profile.photos && profile.photos[0]?.value;
                
                user = await storage.createUser({
                  username,
                  email,
                  password: await hashPassword(randomBytes(16).toString("hex")),
                  displayName,
                  googleId: profile.id,
                  avatar,
                  isEmailVerified: true,
                });
              }
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // Only set up Facebook OAuth if credentials are provided
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: "/api/auth/facebook/callback",
          profileFields: ["id", "displayName", "photos", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails && profile.emails[0]?.value;
            if (!email) {
              return done(new Error("No email found from Facebook profile"));
            }

            // Check if user exists with this Facebook ID
            let user = await storage.getUserByFacebookId(profile.id);
            
            if (!user) {
              // Check if user exists with this email
              user = await storage.getUserByEmail(email);
              
              if (user) {
                // Link Facebook ID to existing account
                user = await storage.updateUser(user.id, {
                  facebookId: profile.id,
                });
              } else {
                // Create a new user
                const username = `facebook_${profile.id}`;
                const displayName = profile.displayName || username;
                const avatar = profile.photos && profile.photos[0]?.value;
                
                user = await storage.createUser({
                  username,
                  email,
                  password: await hashPassword(randomBytes(16).toString("hex")),
                  displayName,
                  facebookId: profile.id,
                  avatar,
                  isEmailVerified: true,
                });
              }
            }
            
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // Serialize and deserialize user for session management
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(new Error("User not found"));
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash the password
      const hashedPassword = await hashPassword(req.body.password);

      // Create the user with hashed password
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // Log the user in automatically after registration
      req.login(user, (err) => {
        if (err) return next(err);
        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: SelectUser | false, info: { message: string } | undefined) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid username or password" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });

  // Google OAuth routes
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    app.get("/api/auth/google", passport.authenticate("google"));
    
    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", {
        failureRedirect: "/auth",
        successRedirect: "/",
      })
    );
  }

  // Facebook OAuth routes
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    app.get("/api/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
    
    app.get(
      "/api/auth/facebook/callback",
      passport.authenticate("facebook", {
        failureRedirect: "/auth",
        successRedirect: "/",
      })
    );
  }

  // Route middleware to check if user is authenticated
  app.use("/api/protected", (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Unauthorized" });
  });

  // Role-based middleware
  app.use("/api/admin", (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    }
    res.status(403).json({ error: "Forbidden" });
  });

  app.use("/api/creator", (req, res, next) => {
    if (req.isAuthenticated() && 
        (req.user.role === "creator" || req.user.role === "admin")) {
      return next();
    }
    res.status(403).json({ error: "Forbidden" });
  });
}

// Helper function to export for use in other parts of the app
export function isAuthenticated(req: Express.Request) {
  return req.isAuthenticated();
}

// Helper to get current user id safely
export function getCurrentUserId(req: Express.Request): number | undefined {
  return req.isAuthenticated() ? req.user.id : undefined;
}

// Utility functions for password handling
export { hashPassword, comparePasswords };