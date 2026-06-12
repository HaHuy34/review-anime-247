import type { VercelRequest, VercelResponse } from "@vercel/node";

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

    // IP
    const forwarded = req.headers["x-forwarded-for"];
    const ipRaw = Array.isArray(forwarded) ? forwarded[0] : forwarded;

    const ip =
      ipRaw?.split(",")[0].trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket?.remoteAddress ||
      "unknown";
    const blockedIps =
      process.env.BLOCKED_IPS?.split(",").map((ip) => ip.trim()) || [];

    const normalizedIp = ip.replace(/^::ffff:/, "");

    if (blockedIps.includes(normalizedIp)) {
      return res.status(200).json({
        ok: true,
        skipped: true,
        reason: "Blocked IP",
      });
    }
    const userAgent = (req.headers["user-agent"] as string) || "unknown";

    const embed = {
      title: "🛍️ PRODUCT CLICK",
      color: 0xee4d2d,
      fields: [
        {
          name: "📦 Product",
          value: product?.name || "Unknown",
        },
        {
          name: "🔗 Link",
          value: product?.link || "No link",
        },
        {
          name: "🌐 IP",
          value: `\`${ip}\``,
          inline: true,
        },
        {
          name: "📱 Device",
          value: `\`${userAgent.slice(0, 300)}\``,
          inline: false,
        },
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
    return res.status(500).json({
      ok: false,
      error: err.message || "Server error",
    });
  }
}
