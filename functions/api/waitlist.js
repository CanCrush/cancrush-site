export async function onRequestGet() {
  return new Response("Waitlist endpoint is live. POST only.", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const email = (body?.email || "").toString().trim().toLowerCase();

    if (!email || !email.includes("@") || email.length > 254) {
      return new Response(JSON.stringify({ ok: false, error: "invalid_email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      debug: {
        email,
        hasWaitlistTo: Boolean(env.WAITLIST_TO),
        hasWaitlistFrom: Boolean(env.WAITLIST_FROM)
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "server_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
