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
  const isMorning = hourUTC === 0;

  // Ngày hôm nay và hôm qua
  const today = new Date();
  if (isMorning) today.setDate(today.getDate() - 1);
  const date = today.toISOString().slice(0, 10);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateYesterday = yesterday.toISOString().slice(0, 10);

  // Lấy số liệu
  const visits = (await kv.get<number>(`stats:visit:${date}`)) || 0;
  const clicks = (await kv.get<number>(`stats:click:${date}`)) || 0;
  const visitsYesterday =
    (await kv.get<number>(`stats:visit:${dateYesterday}`)) || 0;
  const clicksYesterday =
    (await kv.get<number>(`stats:click:${dateYesterday}`)) || 0;

  // Tính % thay đổi
  function calcPercent(today: number, yesterday: number): string {
    if (yesterday === 0) return today > 0 ? "🆕 Mới có data" : "—";
    const diff = ((today - yesterday) / yesterday) * 100;
    const rounded = Math.abs(diff).toFixed(1);
    return diff >= 0 ? `📈 +${rounded}%` : `📉 -${rounded}%`;
  }

  const visitTrend = calcPercent(visits, visitsYesterday);
  const clickTrend = calcPercent(clicks, clicksYesterday);

  const label = isMorning
    ? "📊 BÁO CÁO HÔM QUA"
    : "📊 BÁO CÁO HÔM NAY (CẬP NHẬT)";

  const webhookUrl = process.env.DISCORD_WEBHOOK_SUMMARY;
  if (!webhookUrl) {
    return res.status(200).json({ ok: false, error: "Missing webhook" });
  }

  const embed = {
    title: `${label} ${date}`,
    color: isMorning ? 0xfaa61a : 0x5865f2,
    fields: [
      {
        name: "👀 Lượt truy cập",
        value: `**${visits}** lượt\n${visitTrend} so với hôm qua (${visitsYesterday} lượt)`,
        inline: true,
      },
      {
        name: "🛍️ Lượt click sản phẩm",
        value: `**${clicks}** lượt\n${clickTrend} so với hôm qua (${clicksYesterday} lượt)`,
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

  return res
    .status(200)
    .json({ ok: true, date, visits, clicks, visitsYesterday, clicksYesterday });
}
