import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const getBrowser = (ua: string) => {
  if (/FB_IAB|FBAV/i.test(ua)) return "Facebook In-App Browser";
  if (/EdgA?/i.test(ua)) return "Edge";
  if (/Chrome/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua)) return "Safari";
  if (/Firefox/i.test(ua)) return "Firefox";
  return "Unknown Browser";
};

const getOS = (ua: string) => {
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad/i.test(ua)) return "iOS";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Mac/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "Unknown OS";
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const forwarded = req.headers["x-forwarded-for"];
    const ipRaw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const ip =
      ipRaw?.split(",")[0].trim() ||
      (req.headers["x-real-ip"] as string) ||
      req.socket?.remoteAddress ||
      "unknown";

    const normalizedIp = ip.replace(/^::ffff:/, "");

    const adminIps =
      process.env.ADMIN_IPS?.split(",").map((ip) => ip.trim()) || [];

    if (adminIps.includes(normalizedIp)) {
      return res.status(200).json({ ok: true, admin: true });
    }

    // ✅ Dedup theo IP + ngày
    const today = new Date().toISOString().slice(0, 10);
    const dedupKey = `visit:${normalizedIp}:${today}`;

    const alreadySent = await kv.get(dedupKey);
    if (alreadySent) {
      return res
        .status(200)
        .json({ ok: true, skipped: true, reason: "Already notified today" });
    }

    const userAgent = (req.headers["user-agent"] as string) || "unknown";

    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const deviceType = isMobile ? "📱 Mobile" : "🖥️ Desktop";
    const deviceInfo = `${deviceType} · ${getOS(userAgent)} · ${getBrowser(userAgent)}`;
    await kv.set(dedupKey, isMobile ? "mobile" : "desktop", { ex: 86400 });
    await kv.incr(`stats:visit:${today}`);

    let geo: any = null;

    try {
      const res1 = await fetch(`https://ipwho.is/${ip}`);
      const data1 = await res1.json();
      if (data1 && data1.success) {
        geo = {
          country: data1.country || "Unknown",
          region: data1.region || "",
          city: data1.city || "",
          isp: data1.connection?.isp || "Unknown ISP",
          lat: data1.latitude || null,
          lon: data1.longitude || null,
        };
      }
    } catch (e) {
      console.error("ipwho.is lỗi", e);
    }

    if (!geo) {
      try {
        const res2 = await fetch(`https://ipapi.co/${ip}/json/`);
        const data2 = await res2.json();
        geo = {
          country: data2.country_name || "Unknown",
          region: data2.region || "",
          city: data2.city || "",
          isp: data2.org || "Unknown ISP",
          lat: data2.latitude || null,
          lon: data2.longitude || null,
        };
      } catch (e) {
        geo = {
          country: "Unknown",
          region: "",
          city: "",
          isp: "Unknown",
          lat: null,
          lon: null,
        };
      }
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    const coordsStr =
      geo.lat && geo.lon
        ? `📍 Bản đồ: [Google Maps](https://www.google.com/maps?q=${geo.lat},${geo.lon})`
        : "";

    const embed = {
      title: "🔥 PHÁT HIỆN LƯỢT TRUY CẬP WEBSITE",
      color: 16742912,
      fields: [
        { name: "🌍 Quốc gia", value: geo.country || "Không rõ", inline: true },
        { name: "🏙️ Thành phố", value: geo.city || "Không rõ", inline: true },
        {
          name: "📍 Khu vực / Tỉnh",
          value: geo.region || "Không rõ",
          inline: true,
        },
        {
          name: "📡 Nhà mạng / ISP",
          value: geo.isp || "Không rõ",
          inline: false,
        },
        { name: "🌐 Địa chỉ IP", value: `\`${ip}\``, inline: true },
        {
          name: "📱 Thiết bị (User Agent)",
          value: deviceInfo,
          inline: false,
        },
      ],
      description: coordsStr || undefined,
      timestamp: new Date().toISOString(),
    };

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [embed] }),
      });
    }

    return res.status(200).json({ ok: true, ip, geo });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Internal Server Error" });
  }
}
