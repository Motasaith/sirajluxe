import nodemailer from "nodemailer";

// ──────────────────────────────────────────────
// Brevo/Resend SMTP transporter
// ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.resend.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY || process.env.SMTP_PASS,
  },
});

const FROM = `"${process.env.EMAIL_FROM_NAME || "Siraj Luxe"}" <${process.env.EMAIL_FROM || "noreply@sirajluxe.com"}>`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sirajluxe.com";

// ──────────────────────────────────────────────
// HTML escape helper (XSS prevention)
// ──────────────────────────────────────────────
function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ──────────────────────────────────────────────
// Shared email wrapper
// ──────────────────────────────────────────────
function baseTemplate(title: string, body: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111118;border-radius:16px;overflow:hidden;border:1px solid #1e1e2e;">
        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid #1e1e2e;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="display:inline-block;width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);text-align:center;line-height:36px;color:#fff;font-weight:bold;font-size:16px;margin-right:12px;vertical-align:middle;">S</div>
                  <span style="font-size:20px;font-weight:700;color:#e1e2e6;vertical-align:middle;letter-spacing:0.5px;">SIRAJ <span style="color:#8b5cf6;">LUXE</span></span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px 32px;border-top:1px solid #1e1e2e;">
            <p style="margin:0 0 8px;font-size:12px;color:#6b6b80;text-align:center;">
              Siraj Luxe &middot; UK Premium E-Commerce
            </p>
            <p style="margin:0;font-size:11px;color:#4a4a5a;text-align:center;">
              <a href="${SITE_URL}/privacy" style="color:#6b6b80;text-decoration:underline;">Privacy</a> &nbsp;&middot;&nbsp;
              <a href="${SITE_URL}/terms" style="color:#6b6b80;text-decoration:underline;">Terms</a> &nbsp;&middot;&nbsp;
              <a href="${SITE_URL}/contact" style="color:#6b6b80;text-decoration:underline;">Contact</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function currency(amount: number) {
  return `£${amount.toFixed(2)}`;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

// ──────────────────────────────────────────────
// 1. Order Confirmation Email
// ──────────────────────────────────────────────
export function renderOrderConfirmation({
  customerName,
  orderNumber,
  items,
  subtotal,
  shipping,
  total,
  shippingAddress,
}: {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress?: ShippingAddress;
}) {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;color:#c4c4d0;font-size:14px;border-bottom:1px solid #1e1e2e;">${escapeHtml(item.name)}</td>
          <td style="padding:8px 0;color:#9090a0;font-size:14px;text-align:center;border-bottom:1px solid #1e1e2e;">${item.quantity}</td>
          <td style="padding:8px 0;color:#c4c4d0;font-size:14px;text-align:right;border-bottom:1px solid #1e1e2e;">${currency(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const addressHtml = shippingAddress?.line1
    ? `
      <div style="margin-top:24px;padding:16px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;">
        <p style="margin:0 0 8px;font-size:12px;color:#6b6b80;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Shipping to</p>
        <p style="margin:0;color:#c4c4d0;font-size:14px;line-height:1.6;">
          ${escapeHtml(shippingAddress.line1 || "")}${shippingAddress.line2 ? `<br/>${escapeHtml(shippingAddress.line2)}` : ""}<br/>
          ${escapeHtml(shippingAddress.city || "")}${shippingAddress.postalCode ? `, ${escapeHtml(shippingAddress.postalCode)}` : ""}<br/>
          ${escapeHtml(shippingAddress.country || "GB")}
        </p>
      </div>`
    : "";

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#e1e2e6;">Order Confirmed ✓</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#9090a0;line-height:1.6;">
      Hi ${escapeHtml(customerName) || "there"}, thanks for shopping with us! Your order <strong style="color:#8b5cf6;">${escapeHtml(orderNumber)}</strong> has been received and is being processed.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr style="border-bottom:2px solid #1e1e2e;">
        <td style="padding:8px 0;font-size:11px;color:#6b6b80;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Item</td>
        <td style="padding:8px 0;font-size:11px;color:#6b6b80;font-weight:600;text-transform:uppercase;letter-spacing:1px;text-align:center;">Qty</td>
        <td style="padding:8px 0;font-size:11px;color:#6b6b80;font-weight:600;text-transform:uppercase;letter-spacing:1px;text-align:right;">Total</td>
      </tr>
      ${itemRows}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#9090a0;">Subtotal</td>
        <td style="padding:6px 0;font-size:14px;color:#c4c4d0;text-align:right;">${currency(subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#9090a0;">Shipping</td>
        <td style="padding:6px 0;font-size:14px;color:#c4c4d0;text-align:right;">${shipping === 0 ? '<span style="color:#8b5cf6;">FREE</span>' : currency(shipping)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;font-size:18px;font-weight:700;color:#e1e2e6;border-top:2px solid #1e1e2e;">Total</td>
        <td style="padding:10px 0 0;font-size:18px;font-weight:700;color:#e1e2e6;text-align:right;border-top:2px solid #1e1e2e;">${currency(total)}</td>
      </tr>
    </table>

    ${addressHtml}

    <div style="margin-top:28px;padding:20px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;">
      <p style="margin:0 0 16px;font-size:13px;color:#8b5cf6;font-weight:700;text-transform:uppercase;letter-spacing:1px;">What Happens Next</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;width:24px;">
            <div style="width:22px;height:22px;border-radius:50%;background:#8b5cf620;text-align:center;line-height:22px;color:#8b5cf6;font-size:11px;font-weight:700;">1</div>
          </td>
          <td style="padding:8px 0;">
            <p style="margin:0;color:#c4c4d0;font-size:13px;"><strong>Processing</strong> — We're preparing your items (1–2 business days)</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;">
            <div style="width:22px;height:22px;border-radius:50%;background:#3b82f620;text-align:center;line-height:22px;color:#3b82f6;font-size:11px;font-weight:700;">2</div>
          </td>
          <td style="padding:8px 0;">
            <p style="margin:0;color:#c4c4d0;font-size:13px;"><strong>Tracking ID</strong> — You'll receive a tracking number by email once shipped</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 12px 8px 0;vertical-align:top;">
            <div style="width:22px;height:22px;border-radius:50%;background:#10b98120;text-align:center;line-height:22px;color:#10b981;font-size:11px;font-weight:700;">3</div>
          </td>
          <td style="padding:8px 0;">
            <p style="margin:0;color:#c4c4d0;font-size:13px;"><strong>Delivery</strong> — Estimated 3–5 business days to your door</p>
          </td>
        </tr>
      </table>
      <p style="margin:12px 0 0;font-size:12px;color:#6b6b80;line-height:1.5;">
        💡 You can check your order status anytime from your <a href="${SITE_URL}/orders" style="color:#8b5cf6;text-decoration:underline;">Orders page</a>. Your tracking number will appear there once assigned.
      </p>
    </div>

    <div style="margin-top:24px;text-align:center;">
      <a href="${SITE_URL}/orders" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">View Your Orders</a>
    </div>
  `;

  return {
    subject: `Order Confirmed — ${orderNumber} | Siraj Luxe`,
    html: baseTemplate("Order Confirmed", body),
  };
}

export async function sendOrderConfirmation(params: Parameters<typeof renderOrderConfirmation>[0] & { to: string }) {
  const { subject, html } = renderOrderConfirmation(params);
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  await transporter.sendMail({ from: FROM, to: params.to, subject, html });
}

// ──────────────────────────────────────────────
// 2. Order Shipped Email
// ──────────────────────────────────────────────
export function renderOrderShipped({
  customerName,
  orderNumber,
  trackingNumber,
  trackingCarrier,
  trackingUrl,
}: {
  customerName: string;
  orderNumber: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  trackingUrl?: string;
}) {
  const carrierName = trackingCarrier ? escapeHtml(trackingCarrier) : "your delivery carrier";

  let trackingHtml = "";
  if (trackingNumber) {
    trackingHtml = `
    <div style="padding:16px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:12px;color:#6b6b80;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Tracking ID</p>
      <p style="margin:0;font-size:18px;font-weight:700;color:#e1e2e6;letter-spacing:0.5px;">${escapeHtml(trackingNumber)}</p>
    </div>
    <p style="margin:0 0 16px;font-size:14px;color:#9090a0;line-height:1.6;">
      Please track your parcel on <strong style="color:#e1e2e6;">${carrierName}</strong>${trackingUrl ? `: <a href="${encodeURI(trackingUrl)}" style="color:#8b5cf6;text-decoration:underline;">${escapeHtml(trackingUrl)}</a>` : ""}
    </p>`;
  }

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#e1e2e6;">Your Order is On Its Way! 📦</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#9090a0;line-height:1.6;">
      Hi ${escapeHtml(customerName) || "there"}, great news — your order <strong style="color:#8b5cf6;">${escapeHtml(orderNumber)}</strong> has been dispatched and is on its way to you.
    </p>
    ${trackingHtml}
    <div style="padding:16px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#9090a0;line-height:1.6;">
        📍 Estimated delivery: <strong style="color:#c4c4d0;">3–5 business days</strong><br/>
        📬 Shipping via <strong style="color:#c4c4d0;">${carrierName}</strong>
      </p>
    </div>
    <div style="text-align:center;">
      <a href="${trackingUrl || `${SITE_URL}/orders`}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">Track Your Order</a>
    </div>
  `;

  return {
    subject: `Order Shipped — ${orderNumber} | Siraj Luxe`,
    html: baseTemplate("Order Shipped", body),
  };
}

export async function sendOrderShipped(params: Parameters<typeof renderOrderShipped>[0] & { to: string }) {
  const { subject, html } = renderOrderShipped(params);
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  await transporter.sendMail({ from: FROM, to: params.to, subject, html });
}

// ──────────────────────────────────────────────
// 2b. Tracking Update Email
// ──────────────────────────────────────────────
export function renderTrackingUpdate({
  customerName,
  orderNumber,
  trackingNumber,
  trackingCarrier,
  trackingUrl,
}: {
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  trackingCarrier?: string;
  trackingUrl?: string;
}) {
  const carrierName = trackingCarrier ? escapeHtml(trackingCarrier) : "your delivery carrier";

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#e1e2e6;">Tracking Update 🚚</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#9090a0;line-height:1.6;">
      Hi ${escapeHtml(customerName) || "there"}, a tracking number has been added to your order <strong style="color:#8b5cf6;">${escapeHtml(orderNumber)}</strong>.
    </p>
    <div style="padding:16px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:12px;color:#6b6b80;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Your Tracking ID</p>
      <p style="margin:0;font-size:18px;font-weight:700;color:#e1e2e6;letter-spacing:0.5px;">${escapeHtml(trackingNumber)}</p>
    </div>
    <p style="margin:0 0 24px;font-size:14px;color:#9090a0;line-height:1.6;">
      Please track your parcel on <strong style="color:#e1e2e6;">${carrierName}</strong>${trackingUrl ? `: <a href="${encodeURI(trackingUrl)}" style="color:#8b5cf6;text-decoration:underline;">${escapeHtml(trackingUrl)}</a>` : ""}.<br/>
      Estimated delivery is <strong style="color:#c4c4d0;">3–5 business days</strong>.
    </p>
    <div style="text-align:center;">
      <a href="${trackingUrl || `${SITE_URL}/orders`}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">Track on ${carrierName}</a>
    </div>
  `;

  return {
    subject: `Tracking Update — ${orderNumber} | Siraj Luxe`,
    html: baseTemplate("Tracking Update", body),
  };
}

export async function sendTrackingUpdate(params: Parameters<typeof renderTrackingUpdate>[0] & { to: string }) {
  const { subject, html } = renderTrackingUpdate(params);
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  await transporter.sendMail({ from: FROM, to: params.to, subject, html });
}

// ──────────────────────────────────────────────
// 3. Order Delivered Email
// ──────────────────────────────────────────────
export function renderOrderDelivered({
  customerName,
  orderNumber,
}: {
  customerName: string;
  orderNumber: string;
}) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#e1e2e6;">Order Delivered ✨</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#9090a0;line-height:1.6;">
      Hi ${escapeHtml(customerName) || "there"}, your order <strong style="color:#8b5cf6;">${escapeHtml(orderNumber)}</strong> has been delivered. We hope you love your new items!
    </p>
    <div style="padding:16px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#9090a0;line-height:1.6;">
        Not happy with your order? No worries — you have <strong style="color:#c4c4d0;">30 days</strong> to return any items.
        See our <a href="${SITE_URL}/returns" style="color:#8b5cf6;text-decoration:underline;">Returns Policy</a>.
      </p>
    </div>
    <div style="text-align:center;">
      <a href="${SITE_URL}/shop" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">Shop Again</a>
    </div>
  `;

  return {
    subject: `Order Delivered — ${orderNumber} | Siraj Luxe`,
    html: baseTemplate("Order Delivered", body),
  };
}

export async function sendOrderDelivered(params: Parameters<typeof renderOrderDelivered>[0] & { to: string }) {
  const { subject, html } = renderOrderDelivered(params);
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  await transporter.sendMail({ from: FROM, to: params.to, subject, html });
}

// ──────────────────────────────────────────────
// 4. Welcome Email (new customer)
// ──────────────────────────────────────────────
export function renderWelcomeEmail({
  customerName,
}: {
  customerName: string;
}) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#e1e2e6;">Welcome to Siraj Luxe ✦</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#9090a0;line-height:1.6;">
      Hi ${escapeHtml(customerName) || "there"}, welcome aboard! We're thrilled to have you.
    </p>
    <div style="padding:20px;background:linear-gradient(135deg,#8b5cf620,#7c3aed10);border-radius:10px;border:1px solid #8b5cf630;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:13px;color:#8b5cf6;font-weight:600;text-transform:uppercase;letter-spacing:1px;">New Customer Offer</p>
      <p style="margin:0;font-size:20px;font-weight:700;color:#e1e2e6;">Spend £10+ and get <span style="color:#8b5cf6;">FREE shipping</span></p>
      <p style="margin:4px 0 0;font-size:12px;color:#6b6b80;">Applied automatically at checkout on your first order</p>
    </div>
    <div style="text-align:center;">
      <a href="${SITE_URL}/shop" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">Start Shopping</a>
    </div>
  `;

  return {
    subject: `Welcome to Siraj Luxe — Your £10 Free Shipping Offer Awaits`,
    html: baseTemplate("Welcome to Siraj Luxe", body),
  };
}

export async function sendWelcomeEmail(params: Parameters<typeof renderWelcomeEmail>[0] & { to: string }) {
  const { subject, html } = renderWelcomeEmail(params);
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  await transporter.sendMail({ from: FROM, to: params.to, subject, html });
}

// ──────────────────────────────────────────────
// 5. Order Cancelled / Refund Email
// ──────────────────────────────────────────────
export function renderOrderCancelled({
  customerName,
  orderNumber,
  total,
}: {
  customerName: string;
  orderNumber: string;
  total: number;
}) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#e1e2e6;">Order Cancelled &amp; Refunded</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#9090a0;line-height:1.6;">
      Hi ${escapeHtml(customerName) || "there"}, your order <strong style="color:#8b5cf6;">${escapeHtml(orderNumber)}</strong> has been cancelled and a refund of <strong style="color:#e1e2e6;">${currency(total)}</strong> has been initiated.
    </p>

    <div style="padding:16px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#9090a0;line-height:1.6;">
        💳 Your refund will typically appear within <strong style="color:#c4c4d0;">5–10 business days</strong> depending on your bank or card issuer.<br/><br/>
        If you have any questions about your refund, please don&rsquo;t hesitate to <a href="${SITE_URL}/contact" style="color:#8b5cf6;text-decoration:underline;">contact us</a>.
      </p>
    </div>

    <div style="text-align:center;">
      <a href="${SITE_URL}/shop" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">Continue Shopping</a>
    </div>
  `;

  return {
    subject: `Order Cancelled — ${orderNumber} | Siraj Luxe`,
    html: baseTemplate("Order Cancelled", body),
  };
}

export async function sendOrderCancelled(params: Parameters<typeof renderOrderCancelled>[0] & { to: string }) {
  const { subject, html } = renderOrderCancelled(params);
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  await transporter.sendMail({ from: FROM, to: params.to, subject, html });
}

// ──────────────────────────────────────────────
// 6. Return Request Notification (to Admin)
// ──────────────────────────────────────────────
export function renderReturnRequest({
  orderNumber,
  customerName,
  customerEmail,
  reason,
  total,
}: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  total: number;
}) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#e1e2e6;">Return Request Received</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#9090a0;line-height:1.6;">
      A customer has requested a return for order <strong style="color:#8b5cf6;">${escapeHtml(orderNumber)}</strong>.
    </p>

    <div style="padding:16px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;margin-bottom:24px;">
      <table style="width:100%;font-size:14px;color:#9090a0;line-height:1.8;">
        <tr><td style="padding:4px 8px;font-weight:600;color:#c4c4d0;">Customer</td><td style="padding:4px 8px;">${escapeHtml(customerName)}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;color:#c4c4d0;">Email</td><td style="padding:4px 8px;">${escapeHtml(customerEmail)}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;color:#c4c4d0;">Order Total</td><td style="padding:4px 8px;">${currency(total)}</td></tr>
        <tr><td style="padding:4px 8px;font-weight:600;color:#c4c4d0;">Reason</td><td style="padding:4px 8px;">${escapeHtml(reason)}</td></tr>
      </table>
    </div>

    <div style="text-align:center;">
      <a href="${SITE_URL}/admin/orders" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">View in Admin</a>
    </div>
  `;

  return {
    subject: `Return Request — ${orderNumber} | Siraj Luxe`,
    html: baseTemplate("Return Request", body),
  };
}

export async function sendReturnRequest(params: Parameters<typeof renderReturnRequest>[0]) {
  const { subject, html } = renderReturnRequest(params);
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || "noreply@sirajluxe.com";
  
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  await transporter.sendMail({
    from: FROM,
    to: adminEmail,
    replyTo: params.customerEmail,
    subject,
    html,
  });
}

// ──────────────────────────────────────────────
// 7. Return Approved Email (to Customer)
// ──────────────────────────────────────────────
export function renderReturnApproved({
  customerName,
  orderNumber,
  total,
  returnShippingAddress,
  returnCarrier,
  returnInstructions,
}: {
  customerName: string;
  orderNumber: string;
  total: number;
  returnShippingAddress?: string;
  returnCarrier?: string;
  returnInstructions?: string;
}) {
  const returnDetailsHtml = returnShippingAddress
    ? `
    <div style="padding:16px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#e1e2e6;text-transform:uppercase;letter-spacing:0.05em;">Return Shipping Details</p>
      ${returnShippingAddress ? `<p style="margin:0 0 8px;font-size:14px;color:#9090a0;"><strong style="color:#c4c4d0;">Send to:</strong><br/>${escapeHtml(returnShippingAddress).replace(/\n/g, "<br/>")}</p>` : ""}
      ${returnCarrier ? `<p style="margin:0 0 8px;font-size:14px;color:#9090a0;"><strong style="color:#c4c4d0;">Courier:</strong> ${escapeHtml(returnCarrier)}</p>` : ""}
      ${returnInstructions ? `<p style="margin:0;font-size:14px;color:#9090a0;"><strong style="color:#c4c4d0;">Instructions:</strong><br/>${escapeHtml(returnInstructions).replace(/\n/g, "<br/>")}</p>` : ""}
    </div>`
    : `<div style="padding:16px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#9090a0;line-height:1.6;">
        📦 Please ensure the item is in its original packaging. Our team will contact you separately with the return address and courier details within 1 business day.
      </p>
    </div>`;

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#e1e2e6;">Return Approved ✓</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#9090a0;line-height:1.6;">
      Hi ${escapeHtml(customerName) || "there"}, great news — your return request for order <strong style="color:#8b5cf6;">${escapeHtml(orderNumber)}</strong> has been approved.
    </p>

    ${returnDetailsHtml}

    <div style="padding:16px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#9090a0;line-height:1.6;">
        💳 Once we receive the item, a refund of <strong style="color:#e1e2e6;">${currency(total)}</strong> will be processed within <strong style="color:#c4c4d0;">5–10 business days</strong> back to your original payment method.<br/><br/>
        ⚠️ Please ensure the item is returned within <strong style="color:#c4c4d0;">7 days</strong> of receiving this email.
      </p>
    </div>

    <div style="text-align:center;">
      <a href="${SITE_URL}/orders" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">View Your Orders</a>
    </div>
  `;

  return {
    subject: `Return Approved — ${orderNumber} | Siraj Luxe`,
    html: baseTemplate("Return Approved", body),
  };
}

export async function sendReturnApproved(params: Parameters<typeof renderReturnApproved>[0] & { to: string }) {
  const { subject, html } = renderReturnApproved(params);
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  await transporter.sendMail({ from: FROM, to: params.to, subject, html });
}

// ──────────────────────────────────────────────
// 8. Return Denied Email (to Customer)
// ──────────────────────────────────────────────
export function renderReturnDenied({
  customerName,
  orderNumber,
}: {
  customerName: string;
  orderNumber: string;
}) {
  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#e1e2e6;">Return Request Update</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#9090a0;line-height:1.6;">
      Hi ${escapeHtml(customerName) || "there"}, unfortunately your return request for order <strong style="color:#8b5cf6;">${escapeHtml(orderNumber)}</strong> has been declined.
    </p>

    <div style="padding:16px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#9090a0;line-height:1.6;">
        This may be because the return request didn&rsquo;t meet our <a href="${SITE_URL}/returns" style="color:#8b5cf6;text-decoration:underline;">return policy</a> requirements.<br/><br/>
        If you believe this was an error, please <a href="${SITE_URL}/contact" style="color:#8b5cf6;text-decoration:underline;">contact our support team</a> and we&rsquo;ll be happy to help.
      </p>
    </div>

    <div style="text-align:center;">
      <a href="${SITE_URL}/contact" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">Contact Support</a>
    </div>
  `;

  return {
    subject: `Return Request Update — ${orderNumber} | Siraj Luxe`,
    html: baseTemplate("Return Request Update", body),
  };
}

export async function sendReturnDenied(params: Parameters<typeof renderReturnDenied>[0] & { to: string }) {
  const { subject, html } = renderReturnDenied(params);
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  await transporter.sendMail({ from: FROM, to: params.to, subject, html });
}

// ──────────────────────────────────────────────
// Abandoned Cart Email
// ──────────────────────────────────────────────
export function renderAbandonedCartEmail({
  customerName,
  items,
}: {
  customerName: string;
  items: { name: string; price: number; quantity: number; image?: string; color?: string; size?: string }[];
}) {
  const safeName = escapeHtml(customerName || "there");
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #1e1e2e;">
        <p style="margin:0;font-size:14px;color:#e1e2e6;font-weight:600;">${escapeHtml(item.name)}</p>
        ${item.color || item.size ? `<p style="margin:4px 0 0;font-size:12px;color:#6b6b80;">${[item.color, item.size].filter(Boolean).join(" / ")}</p>` : ""}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #1e1e2e;text-align:center;color:#a0a0b0;font-size:14px;">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #1e1e2e;text-align:right;color:#e1e2e6;font-size:14px;font-weight:600;">£${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join("");

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#e1e2e6;">You left something behind!</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#a0a0b0;">Hi ${safeName}, it looks like you added some great items to your cart but didn't finish checking out. They're still waiting for you!</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <th style="padding:8px 0;border-bottom:1px solid #2a2a3a;text-align:left;font-size:12px;color:#6b6b80;font-weight:600;text-transform:uppercase;">Item</th>
        <th style="padding:8px 0;border-bottom:1px solid #2a2a3a;text-align:center;font-size:12px;color:#6b6b80;font-weight:600;text-transform:uppercase;">Qty</th>
        <th style="padding:8px 0;border-bottom:1px solid #2a2a3a;text-align:right;font-size:12px;color:#6b6b80;font-weight:600;text-transform:uppercase;">Total</th>
      </tr>
      ${itemRows}
    </table>

    <div style="background:#1a1a2e;border-radius:12px;padding:16px 20px;margin-bottom:28px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:14px;color:#a0a0b0;">Cart Total</td>
          <td style="text-align:right;font-size:18px;font-weight:700;color:#8b5cf6;">£${total.toFixed(2)}</td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;margin-bottom:16px;">
      <a href="${SITE_URL}/checkout" style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:50px;">Complete Your Order</a>
    </div>
    <p style="margin:0;font-size:12px;color:#4a4a5a;text-align:center;">Your items may sell out — don't miss them!</p>
  `;

  return {
    subject: "You left items in your cart! — Siraj Luxe",
    html: baseTemplate("Your Cart Awaits", body),
  };
}

export async function sendAbandonedCartEmail(params: Parameters<typeof renderAbandonedCartEmail>[0] & { to: string }) {
  const { subject, html } = renderAbandonedCartEmail(params);
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  await transporter.sendMail({ from: FROM, to: params.to, subject, html });
}

// ──────────────────────────────────────────────
// 10. Admin-to-Customer Direct Message
// ──────────────────────────────────────────────
export function renderAdminMessage({
  customerName,
  subject,
  message,
}: {
  customerName: string;
  subject: string;
  message: string;
}) {
  const safeName = escapeHtml(customerName || "there");
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:#9090a0;line-height:1.6;">Hi ${safeName},</p>
    <div style="padding:20px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;margin-bottom:24px;white-space:pre-line;">
      <p style="margin:0;font-size:14px;color:#c4c4d0;line-height:1.8;">${safeMessage}</p>
    </div>
    <p style="margin:0 0 24px;font-size:13px;color:#6b6b80;line-height:1.5;">
      Reply to this email to get in touch with our support team.
    </p>
    <div style="text-align:center;">
      <a href="${SITE_URL}/contact" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">Contact Us</a>
    </div>
  `;

  return {
    subject: `${escapeHtml(subject)} | Siraj Luxe`,
    html: baseTemplate(subject, body),
  };
}

export async function sendAdminMessage(params: Parameters<typeof renderAdminMessage>[0] & { to: string, replyTo?: string }) {
  const { subject, html } = renderAdminMessage(params);
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  await transporter.sendMail({
    from: FROM,
    to: params.to,
    subject,
    html,
    ...(params.replyTo ? { replyTo: params.replyTo } : {}),
  });
}

// ──────────────────────────────────────────────
// 11. Low Stock Alert (to Admin)
// ──────────────────────────────────────────────
export function renderLowStockAlert({
  products,
}: {
  products: { name: string; inventory: number; slug: string }[];
}) {
  const rows = products
    .map(
      (p) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;color:#c4c4d0;font-size:14px;">${escapeHtml(p.name)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;text-align:center;">
        <span style="color:${p.inventory === 0 ? "#f87171" : "#fbbf24"};font-weight:700;font-size:14px;">${p.inventory === 0 ? "OUT" : p.inventory}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #1e1e2e;text-align:right;">
        <a href="${SITE_URL}/admin/products" style="color:#8b5cf6;font-size:13px;text-decoration:underline;">Edit</a>
      </td>
    </tr>`
    )
    .join("");

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#e1e2e6;">Low Stock Alert ⚠️</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#9090a0;line-height:1.6;">
      ${products.length} product${products.length !== 1 ? "s" : ""} need restocking.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <th style="padding:8px 0;border-bottom:2px solid #1e1e2e;text-align:left;font-size:11px;color:#6b6b80;text-transform:uppercase;letter-spacing:1px;">Product</th>
        <th style="padding:8px 0;border-bottom:2px solid #1e1e2e;text-align:center;font-size:11px;color:#6b6b80;text-transform:uppercase;letter-spacing:1px;">Stock</th>
        <th style="padding:8px 0;border-bottom:2px solid #1e1e2e;text-align:right;font-size:11px;color:#6b6b80;text-transform:uppercase;letter-spacing:1px;">Action</th>
      </tr>
      ${rows}
    </table>
    <div style="text-align:center;">
      <a href="${SITE_URL}/admin/products" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">Manage Products</a>
    </div>
  `;

  return {
    subject: `Low Stock Alert — ${products.length} products need restocking | Siraj Luxe`,
    html: baseTemplate("Low Stock Alert", body),
  };
}

export async function sendLowStockAlert(params: Parameters<typeof renderLowStockAlert>[0]) {
  const { subject, html } = renderLowStockAlert(params);
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || "noreply@sirajluxe.com";
  if (!process.env.SMTP_USER) { console.log("SMTP not configured"); return; }
  await transporter.sendMail({
    from: FROM,
    to: adminEmail,
    subject,
    html,
  });
}
