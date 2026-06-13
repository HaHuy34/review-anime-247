import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

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

  // ✅ Lấy danh sách IP visit và click hôm nay
  const [visitKeys, clickKeys] = await Promise.all([
    kv.keys(`visit:*:${today}`),
    kv.keys(`click:*:${today}`),
  ]);

  // Tách IP từ key "visit:IP:date" → IP
  const visitIps = visitKeys.map((k) => k.split(":")[1]);
  const clickIps = clickKeys.map((k) => k.split(":")[1]);

  return res.status(200).json({
    ok: true,
    today,
    visits: visits || 0,
    clicks: clicks || 0,
    yesterday: dateYesterday,
    visitsYesterday: visitsYesterday || 0,
    clicksYesterday: clicksYesterday || 0,
    visitIps, // danh sách IP đã vào web hôm nay
    clickIps, // danh sách IP đã click sản phẩm hôm nay
  });
}
