export async function onRequestGet() {
  return new Response("Waitlist endpoint is live. POST only.", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}

async function sendEmail(message) {
  const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(message),
  });

  return response;
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
    const [email = ""] = [(body?.email || "").toString().trim().toLowerCase()];

    if (!email || !email.includes("@") || email.length > 254) {
      return jsonResponse({ ok: false, error: "invalid_email" }, 400);
    }

    const [ua = "Unknown"] = [request.headers.get("User-Agent") || "Unknown"];
    const [to = "", from = ""] = [env.WAITLIST_TO, env.WAITLIST_FROM];

    if (!to || !from) {
      return jsonResponse({ ok: false, error: "env_not_set" }, 500);
    }

    const [timestamp = new Date().toISOString()] = [new Date().toISOString()];

    const [ownerMessage = {
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
    }] = [{
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
    }];

    const [confirmationMessage = {
      personalizations: [
        {
          to: [{ email }],
        },
      ],
      from: {
        email: from,
        name: "Can Crush",
      },
      subject: "You’re on the Can Crush waitlist",
      content: [
        {
          type: "text/plain",
          value:
            `You’re in.\n\n` +
            `Thanks for joining the Can Crush waitlist.\n\n` +
            `We’ll keep you posted as we get closer to launch.\n\n` +
            `Can Crush\n` +
            `https://cancrush.ai\n` +
            `support@cancrush.ai`,
        },
      ],
    }] = [{
      personalizations: [
        {
          to: [{ email }],
        },
      ],
      from: {
        email: from,
        name: "Can Crush",
      },
      subject: "You’re on the Can Crush waitlist",
      content: [
        {
          type: "text/plain",
          value:
            `You’re in.\n\n` +
            `Thanks for joining the Can Crush waitlist.\n\n` +
            `We’ll keep you posted as we get closer to launch.\n\n` +
            `Can Crush\n` +
            `https://cancrush.ai\n` +
            `support@cancrush.ai`,
        },
      ],
    }];

    const [ownerResponse, confirmationResponse] = await Promise.all([
      sendEmail(ownerMessage),
      sendEmail(confirmationMessage),
    ]);

    if (!ownerResponse.ok || !confirmationResponse.ok) {
      const [ownerErrorText, confirmationErrorText] = await Promise.all([
        ownerResponse.text(),
        confirmationResponse.text(),
      ]);

      return jsonResponse(
        {
          ok: false,
          error: "email_failed",
          ownerEmailStatus: ownerResponse.status,
          confirmationEmailStatus: confirmationResponse.status,
          ownerEmailResponse: ownerErrorText,
          confirmationEmailResponse: confirmationErrorText,
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
