import nodemailer from "nodemailer";

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASSWORD || "",
    },
  };
}

function isSmtpConfigured() {
  const { host, auth } = getSmtpConfig();
  return Boolean(host && auth.user && auth.pass);
}

function createTransporter() {
  return nodemailer.createTransport(getSmtpConfig());
}

function getFromAddress() {
  return (
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    "Maple & Kiwi Beauty <infomaplekiwibeauty@gmail.com>"
  );
}

function formatLkr(value) {
  return `LKR ${Number(value || 0).toLocaleString("en-LK")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const ORDER_STATUS_COPY = {
  CONFIRMED: {
    subject: (id) => `Order #${id} confirmed — Maple & Kiwi Beauty`,
    headline: "Your order is confirmed",
    intro:
      "Great news — we have confirmed your order and will begin preparing it for delivery.",
  },
  SHIPPED: {
    subject: (id) => `Order #${id} is on the way — Maple & Kiwi Beauty`,
    headline: "Your order has been shipped",
    intro:
      "Your order is on its way. Please keep your phone nearby so our delivery partner can reach you.",
  },
  DELIVERED: {
    subject: (id) => `Order #${id} delivered — Maple & Kiwi Beauty`,
    headline: "Your order has been delivered",
    intro:
      "Your order has been marked as delivered. We hope you love your Maple & Kiwi Beauty products.",
  },
  CANCELLED: {
    subject: (id) => `Order #${id} cancelled — Maple & Kiwi Beauty`,
    headline: "Your order has been cancelled",
    intro:
      "Your order has been cancelled. If this was unexpected or you need help placing a new order, reply to this email and we will assist you.",
  },
};

/**
 * Send a sign-up OTP email from the no-reply address.
 * In development without SMTP credentials, logs the OTP to the server console.
 */
export async function sendSignupOtpEmail({ to, name, otpCode }) {
  const from = getFromAddress();
  const subject = "Your Maple & Kiwi Beauty verification code";
  const text =
    `Hi ${name},\n\n` +
    `Your verification code is: ${otpCode}\n\n` +
    `This code expires in 10 minutes. If you did not request this, you can ignore this email.\n\n` +
    `— Maple & Kiwi Beauty`;
  const html = `
    <div style="font-family: Georgia, serif; color: #2B2421; max-width: 480px; margin: 0 auto;">
      <p style="font-size: 14px;">Hi ${escapeHtml(name)},</p>
      <p style="font-size: 14px;">Use this code to verify your email and complete your sign-up:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #B95C65; margin: 24px 0;">${otpCode}</p>
      <p style="font-size: 12px; color: #666;">This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
      <p style="font-size: 12px; color: #999; margin-top: 32px;">Maple &amp; Kiwi Beauty</p>
    </div>
  `;

  if (!isSmtpConfigured()) {
    console.warn(
      `[email] SMTP not configured — OTP for ${to}: ${otpCode} (dev fallback)`
    );
    return { devMode: true };
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({ from, to, subject, text, html });
    return { devMode: false };
  } catch (err) {
    console.error("[email] Error sending OTP email via SMTP:", err);
    throw new Error("Email service is not configured or failed to connect to mail server. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in Vercel.");
  }
}

/**
 * Notify a customer when an admin changes their order status
 * (CONFIRMED / SHIPPED / DELIVERED / CANCELLED — not PENDING).
 */
export async function sendOrderStatusEmail(order) {
  const status = String(order?.status || "").toUpperCase();
  const copy = ORDER_STATUS_COPY[status];
  const to = order?.customer_email?.trim();

  if (!copy) {
    return { skipped: true, reason: "status_not_notified" };
  }
  if (!to) {
    console.warn(`[email] Order #${order?.id} has no customer email — status email skipped`);
    return { skipped: true, reason: "missing_email" };
  }

  const name = order.customer_name || "there";
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsText = items
    .map((item) => {
      const label = [item.brand, item.product_name].filter(Boolean).join(" — ") || "Item";
      return `• ${label} × ${item.quantity} — ${formatLkr(item.line_total)}`;
    })
    .join("\n");

  const itemsHtml = items
    .map((item) => {
      const label = escapeHtml(
        [item.brand, item.product_name].filter(Boolean).join(" — ") || "Item"
      );
      return `<tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #EADEC9; font-size: 13px;">${label} × ${Number(item.quantity) || 1}</td>
        <td style="padding: 8px 0; border-bottom: 1px solid #EADEC9; font-size: 13px; text-align: right; white-space: nowrap;">${formatLkr(item.line_total)}</td>
      </tr>`;
    })
    .join("");

  const subject = copy.subject(order.id);
  const text =
    `Hi ${name},\n\n` +
    `${copy.headline}\n` +
    `${copy.intro}\n\n` +
    `Order #${order.id}\n` +
    `Status: ${status}\n\n` +
    `Your details\n` +
    `Name: ${order.customer_name || "—"}\n` +
    `Email: ${to}\n` +
    `Phone: ${order.customer_phone || "—"}\n` +
    `Delivery address: ${order.address || "—"}\n\n` +
    `Products ordered\n` +
    `${itemsText || "• No items listed"}\n\n` +
    `Subtotal: ${formatLkr(order.subtotal)}\n` +
    `Delivery: ${Number(order.shipping) === 0 ? "FREE" : formatLkr(order.shipping)}\n` +
    `Total: ${formatLkr(order.total)}\n\n` +
    `Thank you for shopping with Maple & Kiwi Beauty.`;

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #2B2421; max-width: 560px; margin: 0 auto; background: #FAF7F2; padding: 28px;">
      <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #B95C65; margin: 0 0 8px;">Maple &amp; Kiwi Beauty</p>
      <h1 style="font-size: 24px; margin: 0 0 12px;">${escapeHtml(copy.headline)}</h1>
      <p style="font-size: 14px; line-height: 1.5; margin: 0 0 20px;">Hi ${escapeHtml(name)},</p>
      <p style="font-size: 14px; line-height: 1.5; margin: 0 0 24px;">${escapeHtml(copy.intro)}</p>

      <div style="background: #ffffff; border: 1px solid #EADEC9; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Order</p>
        <p style="margin: 0; font-size: 16px; font-weight: bold;">#${order.id} · ${escapeHtml(status)}</p>
      </div>

      <div style="background: #ffffff; border: 1px solid #EADEC9; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Your details</p>
        <p style="margin: 0 0 6px; font-size: 13px;"><strong>Name:</strong> ${escapeHtml(order.customer_name || "—")}</p>
        <p style="margin: 0 0 6px; font-size: 13px;"><strong>Email:</strong> ${escapeHtml(to)}</p>
        <p style="margin: 0 0 6px; font-size: 13px;"><strong>Phone:</strong> ${escapeHtml(order.customer_phone || "—")}</p>
        <p style="margin: 0; font-size: 13px;"><strong>Delivery address:</strong> ${escapeHtml(order.address || "—")}</p>
      </div>

      <div style="background: #ffffff; border: 1px solid #EADEC9; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Products ordered</p>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml || `<tr><td style="font-size: 13px; color: #666;">No items listed</td></tr>`}
        </table>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
          <tr>
            <td style="padding: 4px 0; font-size: 13px; color: #666;">Subtotal</td>
            <td style="padding: 4px 0; font-size: 13px; text-align: right;">${formatLkr(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 13px; color: #666;">Delivery</td>
            <td style="padding: 4px 0; font-size: 13px; text-align: right;">${Number(order.shipping) === 0 ? "FREE" : formatLkr(order.shipping)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0 0; font-size: 15px; font-weight: bold;">Total</td>
            <td style="padding: 8px 0 0; font-size: 15px; font-weight: bold; text-align: right; color: #B95C65;">${formatLkr(order.total)}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 12px; color: #999; margin: 24px 0 0;">Thank you for shopping with Maple &amp; Kiwi Beauty.</p>
    </div>
  `;

  if (!isSmtpConfigured()) {
    console.warn(
      `[email] SMTP not configured — would send ${status} email for order #${order.id} to ${to}`
    );
    console.warn(`[email] Subject: ${subject}`);
    return { devMode: true, skipped: false };
  }

  const transporter = createTransporter();
  await transporter.sendMail({ from: getFromAddress(), to, subject, text, html });
  return { devMode: false, skipped: false };
}
