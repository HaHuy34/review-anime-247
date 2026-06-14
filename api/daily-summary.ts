import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers["authorization"];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const nowUTC = new Date();
  const hourUTC = nowUTC.getUTCHours();

  // 00:00 UTC = 7h sáng VN → lấy hôm qua
  // 16:00 UTC = 11h tối VN → lấy hôm nay
  const isMorning = hourUTC === 0;

  const target = new Date();
  if (isMorning) target.setDate(target.getDate() - 1);
  const date = target.toISOString().slice(0, 10);

  const label = isMorning
    ? "📊 BÁO CÁO HÔM QUA"
    : "📊 BÁO CÁO HÔM NAY (CẬP NHẬT)";

  const visits = (await kv.get<number>(`stats:visit:${date}`)) || 0;
  const clicks = (await kv.get<number>(`stats:click:${date}`)) || 0;
  console.log(clicks, "click");

  const webhookUrl = process.env.DISCORD_WEBHOOK_SUMMARY;
  if (!webhookUrl) {
    return res.status(200).json({ ok: false, error: "Missing webhook" });
  }

  const embed = {
    title: `${label} ${date}`,
    color: isMorning ? 0xfaa61a : 0x5865f2,
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
