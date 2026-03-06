function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export async function onRequestGet() {
  return new Response("Waitlist endpoint is live. POST only.", {
    status: 200,
    headers: {
      "Content-Type": "text/plain"
    }
  });
}

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json();
    const email = (body?.email || "").toString().trim().toLowerCase();

    if (!email || !email.includes("@") || email.length > 254) {
      return jsonResponse({ ok: false, error: "invalid_email" }, 400);
    }

    return jsonResponse({
      ok: true,
      message: "waitlist_signup_captured",
      email
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: "server_error"
      },
      500
    );
  }
}
