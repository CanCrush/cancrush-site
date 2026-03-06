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

    // Basic anti-spam: small delay + simple header check
    const ua = request.headers.get("User-Agent") || "";
    if (!ua) {
      return new Response(JSON.stringify({ ok: false, error: "missing_ua" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Email the signup to you using MailChannels (simple + free-ish)
    // You must set WAITLIST_TO and WAITLIST_FROM in Pages project settings.
    const to = env.WAITLIST_TO;
    const from = env.WAITLIST_FROM;

    if (!to || !from) {
      return new Response(JSON.stringify({ ok: false, error: "env_not_set" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
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

    if (!resp.ok) {
      return new Response(JSON.stringify({ ok: false, error: "email_failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
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
