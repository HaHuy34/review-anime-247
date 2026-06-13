import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_CLICK;
    if (!webhookUrl) {
      return res.status(200).json({ ok: false, error: "Missing webhook" });
    }

    const { product } = req.body || {};

    const forwarded = req.headers["x-forwarded-for"];
    const ipRaw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const ip =
      ipRaw?.split(",")[0].trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket?.remoteAddress ||
      "unknown";

    const normalizedIp = ip.replace(/^::ffff:/, "");

    const blockedIps =
      process.env.BLOCKED_IPS?.split(",").map((i) => i.trim()) || [];
    if (blockedIps.includes(normalizedIp)) {
      return res
        .status(200)
        .json({ ok: true, skipped: true, reason: "Blocked IP" });
    }

    // Dedup theo IP + ngày
    const today = new Date().toISOString().slice(0, 10);
    const dedupKey = `click:${normalizedIp}:${today}`;

    const alreadySent = await kv.get(dedupKey);
    if (alreadySent) {
      return res
        .status(200)
        .json({ ok: true, skipped: true, reason: "Already notified today" });
    }

    await kv.set(dedupKey, 1, { ex: 86400 });

    const embed = {
      title: "🛍️ PRODUCT CLICK",
      color: 0xee4d2d,
      image: { url: product?.image },
      fields: [
        { name: "📦 Product", value: product?.name || "Unknown" },
        { name: "🌐 IP", value: `\`${normalizedIp}\``, inline: true },
      ],
      timestamp: new Date().toISOString(),
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err.message || "Server error" });
  }
}
