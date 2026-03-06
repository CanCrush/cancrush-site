export async function onRequestGet() {
  return new Response("Waitlist endpoint is live. POST only.", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

async function sendEmail(message) {
  return fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
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

    const to = env.WAITLIST_TO;
    const from = env.WAITLIST_FROM;
    const ua = request.headers.get("User-Agent") || "Unknown";
    const timestamp = new Date().toISOString();

    if (!to || !from) {
      return jsonResponse({ ok: false, error: "env_not_set" }, 500);
    }

    const ownerMessage = {
      personalizations: [
        {
          to: [{ email: to }],
        },
      ],
      from: {
        email: from,
        name: "Can Crush Waitlist",
      },
      subject: "New Can Crush waitlist signup",
      content: [
        {
          type: "text/plain",
          value:
            `New waitlist signup:\n\n` +
            `Email: ${email}\n` +
            `Time: ${timestamp}\n` +
            `User-Agent: ${ua}\n`,
        },
      ],
    };

    const ownerResponse = await sendEmail(ownerMessage);

    if (!ownerResponse.ok) {
      const ownerErrorText = await ownerResponse.text();
      return jsonResponse(
        {
          ok: false,
          error: "email_failed",
          ownerEmailStatus: ownerResponse.status,
          ownerEmailResponse: ownerErrorText,
        },
        502
      );
    }

    return jsonResponse({
      ok: true,
      message: "waitlist_signup_complete",
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: "server_error",
        detail: error instanceof Error ? error.message : "unknown_error",
      },
      500
    );
  }
}
