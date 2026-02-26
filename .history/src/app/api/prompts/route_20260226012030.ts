import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

function authOk(req: Request) {
  const token = req.headers.get("x-admin-token") || "";
  return token && token === process.env.ADMIN_TOKEN;
}

export async function GET(req: Request) {
  if (!authOk(req)) return new Response("Unauthorized", { status: 401 });

  const promptNo = (await redis.get<string>("prompt:no")) || "";
  const promptEn = (await redis.get<string>("prompt:en")) || "";

  return Response.json({ promptNo, promptEn });
}

export async function POST(req: Request) {
  if (!authOk(req)) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const promptNo = String(body.promptNo || "");
  const promptEn = String(body.promptEn || "");

  await redis.set("prompt:no", promptNo);
  await redis.set("prompt:en", promptEn);
  await redis.set("prompt:updatedAt", new Date().toISOString());

  return Response.json({ ok: true });
}