import { Express, Request, Response } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  if (!stored || !stored.includes('.')) return false;
  
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  
  try {
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch {
    return false;
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export function setupSimpleAuth(app: Express) {
  // On AWS the load balancer ends HTTPS, so Express must trust it to know the
  // visitor came in securely; without this the secure login cookie is never set.
  app.set("trust proxy", 1);
  // Sessions live in the database, so a deploy or restart does not log everyone out.
  const PgSession = connectPgSimple(session);
  app.use(session({
    store: new PgSession({ pool, tableName: "session", createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET || "smooches-secret-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }
  }));

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const validPassword = await comparePasswords(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      req.session.userId = user.id;
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Register endpoint
  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId;
      if (!userId) return res.status(401).json({ error: "Not authenticated" });
      const { currentPassword, newPassword } = req.body ?? {};
      if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
        return res.status(400).json({ error: "Current and new password are required" });
      }
      if (newPassword.length < 10) return res.status(400).json({ error: "The new password needs at least 10 characters" });
      if (newPassword === currentPassword) return res.status(400).json({ error: "The new password must be different" });
      const user = await storage.getUser(userId);
      if (!user || !(await comparePasswords(currentPassword, user.password))) {
        return res.status(401).json({ error: "Current password is wrong" });
      }
      await storage.updateUser(userId, { password: await hashPassword(newPassword), updatedAt: new Date() });
      // Anyone else signed in to this account (on another phone or computer) is signed out.
      await pool.query(
        `delete from "session" where sid <> $1 and (sess->>'userId') = $2`,
        [req.sessionID, String(userId)]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Password was not changed" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, email, password, displayName } = req.body;
      
      if (!username || !email || !password || !displayName) {
        return res.status(400).json({ error: "All fields required" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const emailUser = await storage.getUserByEmail(email);
      if (emailUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        displayName,
        role: "listener"
      });

      req.session.userId = newUser.id;
      const { password: _, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.userId = undefined;
        return res.status(401).json({ error: "User not found" });
      }

      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Auth check error:", error);
      res.status(500).json({ error: "Authentication check failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });
}

export function requireAuth(req: Request, res: Response, next: any) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function getCurrentUserId(req: Request): number | undefined {
  return req.session.userId;
}