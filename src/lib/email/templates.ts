import "server-only";

type UnknownRecord = Record<string, unknown>;

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

function value(payload: UnknownRecord, key: string) {
  const candidate = payload[key];
  return candidate === null || candidate === undefined ? "" : String(candidate);
}

function escapeHtml(valueToEscape: string) {
  return valueToEscape.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

function contentForTemplate(templateKey: string, payload: UnknownRecord) {
  const responseNote = value(payload, "response_note");
  const pickupArea = value(payload, "pickup_area");
  const start = value(payload, "starts_at");
  const startText = start
    ? new Intl.DateTimeFormat("en-CA", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "America/Vancouver",
      }).format(new Date(start))
    : "";

  switch (templateKey) {
    case "listing_published":
      return {
        heading: "Your bike listing is live",
        body: "Your listing published immediately. Riders can now find it and send requests.",
        path: `/bikes/${encodeURIComponent(value(payload, "listing_slug"))}`,
        action: "View listing",
      };
    case "safety_flag_created":
      return {
        heading: "A listing has a safety signal",
        body: `Automatic checks flagged ${value(payload, "signal_count") || "one or more"} ${value(payload, "signal_source") || "content"} signal(s). The listing and account remain active until an administrator reviews the signal.`,
        path: "/admin/safety?status=open",
        action: "Open safety signals",
      };
    case "request_received":
      return {
        heading: "You have a new bike request",
        body: "A rider is interested in your bike. Review the dates or message before you accept or decline.",
        path: "/account/requests",
        action: "Review request",
      };
    case "request_sent":
      return {
        heading: "Your request was sent",
        body: "The owner has been notified. This is not confirmed and no payment has been collected.",
        path: "/account/rentals",
        action: "View request",
      };
    case "request_accepted":
      return {
        heading: "Your bike request was accepted",
        body: pickupArea
          ? `The owner accepted your request. Open your dashboard for the pickup details near ${pickupArea}. Payment happens in person.`
          : "The owner accepted your request. Open your dashboard for pickup details. Payment happens in person.",
        path: "/account/rentals",
        action: "View pickup details",
      };
    case "request_declined":
      return {
        heading: "Your bike request was declined",
        body: responseNote
          ? `The owner left this note: ${responseNote}`
          : "The bike owner could not accept this request. You can browse other available bikes anytime.",
        path: "/account/rentals",
        action: "Find another bike",
      };
    case "request_cancelled":
      return {
        heading: "A bike request was cancelled",
        body: "The rider cancelled this request. The bike can remain available for other riders.",
        path: "/account/requests",
        action: "View requests",
      };
    case "pickup_reminder":
      return {
        heading: "Your bike pickup is coming up",
        body: startText
          ? `A reminder for your pickup on ${startText}. Check the agreed details before you leave and pay in person at the exchange.`
          : "Your accepted bike pickup is coming up. Check the agreed details before you leave and pay in person.",
        path: "/account/rentals",
        action: "View pickup details",
      };
    default:
      throw new Error(`Unsupported email template: ${templateKey}`);
  }
}

export function renderTransactionalEmail(input: {
  templateKey: string;
  payload: UnknownRecord;
  siteUrl: string;
}): RenderedEmail {
  const bikeTitle = value(input.payload, "bike_title") || "Bike listing";
  const content = contentForTemplate(input.templateKey, input.payload);
  const destination = new URL(content.path, input.siteUrl).toString();
  const safeHeading = escapeHtml(content.heading);
  const safeBody = escapeHtml(content.body);
  const safeBikeTitle = escapeHtml(bikeTitle);
  const safeDestination = escapeHtml(destination);
  const safeAction = escapeHtml(content.action);

  return {
    subject: `${content.heading} · ${bikeTitle}`,
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f5f7f9;color:#102238;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7f9;padding:28px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #dce3e8;border-radius:14px;overflow:hidden">
            <tr>
              <td style="background:#102238;padding:22px 28px;color:#ffffff">
                <div style="font-size:22px;font-weight:700">Wander Bike</div>
                <div style="margin-top:4px;font-size:13px;color:#b9c7d4">Local bike marketplace · Richmond, BC</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px">
                <div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#08747b">${safeBikeTitle}</div>
                <h1 style="margin:10px 0 12px;font-size:28px;line-height:1.2">${safeHeading}</h1>
                <p style="margin:0;font-size:16px;line-height:1.65;color:#526174">${safeBody}</p>
                <a href="${safeDestination}" style="display:inline-block;margin-top:24px;border-radius:10px;background:#08747b;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 20px">${safeAction}</a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e2e8f0;padding:20px 28px;font-size:12px;line-height:1.6;color:#64748b">
                Wander Bike connects local riders and owners. No online payment or shipping is provided.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
    text: [
      "Wander Bike",
      bikeTitle,
      "",
      content.heading,
      content.body,
      "",
      `${content.action}: ${destination}`,
      "",
      "No online payment or shipping is provided.",
    ].join("\n"),
  };
}
