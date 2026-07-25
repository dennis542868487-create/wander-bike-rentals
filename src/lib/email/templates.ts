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

function formatCad(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

function contentForTemplate(templateKey: string, payload: UnknownRecord) {
  const trackingPin = value(payload, "tracking_pin");
  const returnNumber = value(payload, "return_number");
  const returnStatus = value(payload, "return_status").replaceAll("_", " ");
  const refundAmount = Number(payload.refund_amount_cents);

  switch (templateKey) {
    case "order_confirmation":
      return {
        heading: "Payment received",
        body: "Thanks for your order. We have received your payment and reserved your items.",
      };
    case "payment_failed":
      return {
        heading: "Payment was not completed",
        body: "Your payment did not complete and the reserved inventory has been released. No successful charge was recorded for this order.",
      };
    case "order_preparing":
      return {
        heading: "Your order is being prepared",
        body: "Our Steveston team is preparing your items. We will send another update when the order is ready.",
      };
    case "order_ready_for_pickup":
      return {
        heading: "Your order is ready for pickup",
        body: "Your order is ready at Wander Bike, 12071 First Ave #101, Richmond, BC V7E 3M1. Please bring your order number.",
      };
    case "order_ready_to_ship":
      return {
        heading: "Your order is ready to ship",
        body: "Your items are packed and awaiting carrier handoff.",
      };
    case "tracking_created":
      return {
        heading: "Tracking is ready",
        body: trackingPin
          ? `A shipping label has been created. Your tracking number is ${trackingPin}.`
          : "A shipping label has been created. Tracking details will appear on your order page.",
      };
    case "order_shipped":
      return {
        heading: "Your order has shipped",
        body: trackingPin
          ? `Your order is with the carrier. Your tracking number is ${trackingPin}.`
          : "Your order is with the carrier. Open your order page for the latest delivery details.",
      };
    case "order_delivered":
      return {
        heading: "Your order was delivered",
        body: "The carrier marked your order as delivered. Please contact Wander Bike if anything does not look right.",
      };
    case "order_picked_up":
      return {
        heading: "Pickup completed",
        body: "Your order has been marked as picked up. Thank you for visiting Wander Bike.",
      };
    case "order_cancelled":
      return {
        heading: "Order cancelled",
        body: "This order has been cancelled. Any separate refund will be confirmed in its own email.",
      };
    case "refund_partial":
      return {
        heading: "Partial refund issued",
        body: Number.isFinite(refundAmount)
          ? `A ${formatCad(refundAmount)} refund was issued to your original payment method.`
          : "A partial refund was issued to your original payment method.",
      };
    case "refund_full":
      return {
        heading: "Full refund issued",
        body: Number.isFinite(refundAmount)
          ? `A ${formatCad(refundAmount)} refund was issued to your original payment method.`
          : "A full refund was issued to your original payment method.",
      };
    case "return_status_updated":
      return {
        heading: returnNumber
          ? `Return ${returnNumber} updated`
          : "Return updated",
        body: returnStatus
          ? `The return status is now ${returnStatus}.`
          : "There is an update to your return.",
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
  const orderNumber = value(input.payload, "order_number") || "Wander Bike order";
  const publicId = value(input.payload, "public_id");
  const trackingUrl = value(input.payload, "tracking_url");
  const resolution = value(input.payload, "resolution");
  const content = contentForTemplate(input.templateKey, input.payload);
  const orderUrl = publicId
    ? new URL(`/orders/${encodeURIComponent(publicId)}`, input.siteUrl).toString()
    : input.siteUrl;
  const primaryUrl =
    trackingUrl.startsWith("https://") &&
    ["tracking_created", "order_shipped"].includes(input.templateKey)
      ? trackingUrl
      : orderUrl;
  const primaryLabel = primaryUrl === trackingUrl ? "Track shipment" : "View order";
  const safeHeading = escapeHtml(content.heading);
  const safeBody = escapeHtml(content.body);
  const safeOrderNumber = escapeHtml(orderNumber);
  const safePrimaryUrl = escapeHtml(primaryUrl);
  const safeResolution = escapeHtml(resolution);

  return {
    subject: `${content.heading} · ${orderNumber}`,
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f1f5f9;color:#0f172a;font-family:Arial,Helvetica,sans-serif">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:28px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden">
            <tr>
              <td style="background:#0f766e;padding:22px 28px;color:#ffffff">
                <div style="font-size:22px;font-weight:700">Wander Bike</div>
                <div style="margin-top:4px;font-size:13px;opacity:.85">Steveston · Richmond, BC</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px">
                <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0f766e">${safeOrderNumber}</div>
                <h1 style="margin:10px 0 12px;font-size:28px;line-height:1.2">${safeHeading}</h1>
                <p style="margin:0;font-size:16px;line-height:1.65;color:#475569">${safeBody}</p>
                ${
                  resolution
                    ? `<p style="margin:18px 0 0;padding:14px;border-radius:12px;background:#f8fafc;font-size:14px;line-height:1.6;color:#475569">${safeResolution}</p>`
                    : ""
                }
                <a href="${safePrimaryUrl}" style="display:inline-block;margin-top:24px;border-radius:999px;background:#0f172a;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 20px">${primaryLabel}</a>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e2e8f0;padding:20px 28px;font-size:12px;line-height:1.6;color:#64748b">
                Wander Bike · 12071 First Ave #101, Richmond, BC V7E 3M1 · +1 778 952 1389
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
      orderNumber,
      "",
      content.heading,
      content.body,
      resolution ? `Resolution: ${resolution}` : "",
      "",
      `${primaryLabel}: ${primaryUrl}`,
      "",
      "12071 First Ave #101, Richmond, BC V7E 3M1",
      "+1 778 952 1389",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
