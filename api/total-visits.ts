import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const total = (await kv.get<number>("stats:visit:total")) || 0;
    return res.status(200).json({ ok: true, total });
  } catch {
    return res.status(200).json({ ok: false, total: 0 });
  }
}
