// Payments: the Stripe key lives in the AWS vault, never in a file and never on screen.
// Everett pastes it once into the Payments box (admin only); the app checks it with Stripe,
// then stores it. Nothing here logs or returns the key.
import type { Express, Request, Response, NextFunction } from "express";
import { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { storage } from "./storage";

const SECRET_ID = process.env.STRIPE_SECRET_ID;
const KEY_SHAPE = /^(sk|rk)_(live|test)_[A-Za-z0-9]{20,}$/;
const vault = SECRET_ID ? new SecretsManagerClient({}) : null;

let cached: { key: string | null; at: number } = { key: null, at: 0 };

export async function stripeKey(): Promise<string | null> {
  if (!vault || !SECRET_ID) return null;
  if (Date.now() - cached.at < 5 * 60 * 1000) return cached.key;
  const out = await vault.send(new GetSecretValueCommand({ SecretId: SECRET_ID }));
  let key: string | null = null;
  try {
    const value = JSON.parse(out.SecretString || "{}");
    key = typeof value.key === "string" && KEY_SHAPE.test(value.key) ? value.key : null;
  } catch {
    key = null;
  }
  cached = { key, at: Date.now() };
  return key;
}

function describe(key: string | null) {
  if (!key) return { configured: false };
  return { configured: true, mode: key.includes("_live_") ? "live" : "test", keyEnd: key.slice(-4) };
}

// Ask Stripe whether the key works, using the one read the key is allowed (Balance: Read).
async function stripeAccepts(key: string): Promise<{ ok: boolean; reason?: string }> {
  try {
    const response = await fetch("https://api.stripe.com/v1/balance", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    });
    if (response.ok) return { ok: true };
    if (response.status === 401) return { ok: false, reason: "Stripe did not accept that key." };
    if (response.status === 403) return { ok: false, reason: "That key works, but it is missing the Balance: Read permission." };
    return { ok: false, reason: `Stripe answered with error ${response.status}.` };
  } catch {
    return { ok: false, reason: "Stripe could not be reached. Please try again." };
  }
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: "Not authenticated" });
  const user = await storage.getUser(userId);
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Only the Smooches owner can do this" });
  next();
}

export function registerPaymentRoutes(app: Express) {
  app.get("/api/admin/payments", requireAdmin, async (_req, res) => {
    try {
      if (!vault) return res.json({ configured: false, vault: false });
      res.json({ ...describe(await stripeKey()), vault: true });
    } catch (e) {
      console.error("payments status: vault read failed");
      res.status(500).json({ error: "Could not read the payments setup" });
    }
  });

  app.post("/api/admin/payments/key", requireAdmin, async (req, res) => {
    const key = typeof req.body?.key === "string" ? req.body.key.trim() : "";
    if (!vault || !SECRET_ID) return res.status(503).json({ error: "The key vault is not set up on this server" });
    if (!KEY_SHAPE.test(key)) {
      return res.status(400).json({ error: "That doesn't look like a Stripe secret or restricted key (it starts with rk_live_ or sk_live_)." });
    }
    const check = await stripeAccepts(key);
    if (!check.ok) return res.status(400).json({ error: check.reason });
    try {
      await vault.send(new PutSecretValueCommand({ SecretId: SECRET_ID, SecretString: JSON.stringify({ key }) }));
      cached = { key, at: Date.now() };
      res.json(describe(key));
    } catch {
      console.error("payments key: vault write failed");
      res.status(500).json({ error: "Stripe accepted the key, but it could not be saved. Please try again." });
    }
  });
}
