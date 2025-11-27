import nodemailer from "nodemailer";

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    const err = new Error("SMTP_CONFIG_MISSING");
    err.statusCode = 500;
    throw err;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465는 TLS, 그 외는 STARTTLS
    auth: { user, pass },
  });
};

let cachedTransporter = null;

export const sendMail = async ({ to, subject, text, html }) => {
  if (!cachedTransporter) {
    cachedTransporter = createTransporter();
  }

  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  return cachedTransporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};
