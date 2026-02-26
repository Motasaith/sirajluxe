import nodemailer from "nodemailer";

// ──────────────────────────────────────────────
// Brevo SMTP transporter
// ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
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
export async function sendOrderConfirmation({
  to,
  customerName,
  orderNumber,
  items,
  subtotal,
  shipping,
  total,
  shippingAddress,
}: {
  to: string;
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

    <div style="margin-top:28px;text-align:center;">
      <a href="${SITE_URL}/orders" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">View Your Orders</a>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Order Confirmed — ${orderNumber} | Siraj Luxe`,
    html: baseTemplate("Order Confirmed", body),
  });
}

// ──────────────────────────────────────────────
// 2. Order Shipped Email
// ──────────────────────────────────────────────
export async function sendOrderShipped({
  to,
  customerName,
  orderNumber,
  trackingNumber,
}: {
  to: string;
  customerName: string;
  orderNumber: string;
  trackingNumber?: string;
}) {
  const trackingHtml = trackingNumber
    ? `<p style="margin:0 0 24px;font-size:14px;color:#9090a0;">Tracking number: <strong style="color:#e1e2e6;">${escapeHtml(trackingNumber)}</strong></p>`
    : "";

  const body = `
    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#e1e2e6;">Your Order is On Its Way! 📦</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#9090a0;line-height:1.6;">
      Hi ${escapeHtml(customerName) || "there"}, great news — your order <strong style="color:#8b5cf6;">${escapeHtml(orderNumber)}</strong> has been dispatched and is on its way to you.
    </p>
    ${trackingHtml}
    <div style="padding:16px;background-color:#0a0a0f;border-radius:10px;border:1px solid #1e1e2e;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#9090a0;line-height:1.6;">
        📍 Estimated delivery: <strong style="color:#c4c4d0;">3–5 business days</strong><br/>
        📬 Shipping to the UK via standard delivery
      </p>
    </div>
    <div style="text-align:center;">
      <a href="${SITE_URL}/orders" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#8b5cf6,#7c3aed);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:50px;">Track Your Order</a>
    </div>
  `;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Order Shipped — ${orderNumber} | Siraj Luxe`,
    html: baseTemplate("Order Shipped", body),
  });
}

// ──────────────────────────────────────────────
// 3. Order Delivered Email
// ──────────────────────────────────────────────
export async function sendOrderDelivered({
  to,
  customerName,
  orderNumber,
}: {
  to: string;
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

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Order Delivered — ${orderNumber} | Siraj Luxe`,
    html: baseTemplate("Order Delivered", body),
  });
}

// ──────────────────────────────────────────────
// 4. Welcome Email (new customer)
// ──────────────────────────────────────────────
export async function sendWelcomeEmail({
  to,
  customerName,
}: {
  to: string;
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

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Welcome to Siraj Luxe — Your £10 Free Shipping Offer Awaits`,
    html: baseTemplate("Welcome to Siraj Luxe", body),
  });
}
