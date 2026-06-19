export async function POST(req: Request) {
  const { password } = await req.json();
  if (password === process.env.ADMIN_PASSWORD) {
    return Response.json({ ok: true });
  }
  return Response.json({ ok: false }, { status: 401 });
}
