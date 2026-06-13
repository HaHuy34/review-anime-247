import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Bảo vệ bằng password đơn giản
  const { password } = req.query;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateYesterday = yesterday.toISOString().slice(0, 10);

  const [visits, clicks, visitsYesterday, clicksYesterday] = await Promise.all([
    kv.get<number>(`stats:visit:${today}`),
    kv.get<number>(`stats:click:${today}`),
    kv.get<number>(`stats:visit:${dateYesterday}`),
    kv.get<number>(`stats:click:${dateYesterday}`),
  ]);

  return res.status(200).json({
    ok: true,
    today,
    visits: visits || 0,
    clicks: clicks || 0,
    yesterday: dateYesterday,
    visitsYesterday: visitsYesterday || 0,
    clicksYesterday: clicksYesterday || 0,
  });
}
