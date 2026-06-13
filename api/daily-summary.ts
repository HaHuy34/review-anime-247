import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Bảo vệ endpoint, chỉ Vercel Cron mới gọi được
  const authHeader = req.headers["authorization"];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  // Lấy số liệu hôm qua (vì cron chạy 23:59 hoặc 00:00)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = yesterday.toISOString().slice(0, 10);

  const visits = (await kv.get<number>(`stats:visit:${date}`)) || 0;
  const clicks = (await kv.get<number>(`stats:click:${date}`)) || 0;

  const webhookUrl = process.env.DISCORD_WEBHOOK_SUMMARY;
  if (!webhookUrl) {
    return res.status(200).json({ ok: false, error: "Missing webhook" });
  }

  const embed = {
    title: "📊 BÁO CÁO NGÀY " + date,
    color: 0x5865f2,
    fields: [
      { name: "👀 Lượt truy cập", value: `**${visits}** lượt`, inline: true },
      {
        name: "🛍️ Lượt click sản phẩm",
        value: `**${clicks}** lượt`,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });

  return res.status(200).json({ ok: true, date, visits, clicks });
}
