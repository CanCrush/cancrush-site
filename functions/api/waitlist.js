export async function onRequestGet() {
  return new Response("Waitlist endpoint is live. POST only.", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const email = (body?.email || "").toString().trim().toLowerCase();

    if (!email || !email.includes("@") || email.length > 254) {
      return jsonResponse({ ok: false, error: "invalid_email" }, 400);
    }

    const ua = request.headers.get("User-Agent") || "";
    if (!ua) {
      return jsonResponse({ ok: false, error: "missing_ua" }, 400);
    }

    const to = env.WAITLIST_TO;
    const from = env.WAITLIST_FROM;

    if (!to || !from) {
      return jsonResponse(
        {
          ok: false,
          error: "env_not_set",
          hasWaitlistTo: Boolean(to),
          hasWaitlistFrom: Boolean(from),
        },
        500
      );
    }

    const msg = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: "Can Crush Waitlist" },
      subject: "New Can Crush waitlist signup",
      content: [
        {
          type: "text/plain",
          value: `New waitlist signup:\n\nEmail: ${email}\nTime: ${new Date().toISOString()}\nUA: ${ua}\n`,
        },
      ],
    };

    const resp = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(msg),
    });

    const respText = await resp.text();

    if (!resp.ok) {
      return jsonResponse(
        {
          ok: false,
          error: "email_failed",
          status: resp.status,
          responseText: respText,
          to,
          from,
        },
        502
      );
    }

    return jsonResponse({
      ok: true,
      message: "waitlist_signup_complete",
      providerStatus: resp.status,
      providerResponse: respText,
    });
  } catch (e) {
    return jsonResponse(
      {
        ok: false,
        error: "server_error",
        detail: e instanceof Error ? e.message : "unknown_error",
      },
      500
    );
  }
}
