import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
  const secure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : port === 465;
  const service = process.env.SMTP_SERVICE || (host.includes('gmail') ? 'gmail' : undefined);

  if (!user || !pass) {
    console.warn(
      '[mailer] SMTP_USER/GMAIL_USER or SMTP_PASS/GMAIL_APP_PASSWORD not set. Email sending is disabled.'
    );
    return null;
  }

  const transportConfig = service
    ? {
        service,
        auth: { user, pass },
      }
    : {
        host,
        port,
        secure,
        auth: { user, pass },
      };

  transporter = nodemailer.createTransport(transportConfig);
  return transporter;
}

function getLogoAttachment() {
  const logoPath = path.join(process.cwd(), 'public', 'lanka-logo.png');
  if (fs.existsSync(logoPath)) {
    return {
      filename: 'lanka-logo.png',
      path: logoPath,
      cid: 'lanka-logo',
    };
  }
  return null;
}

export async function sendPasswordResetEmail(to, resetUrl) {
  const t = getTransporter();

  const fullUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${resetUrl}`;

  if (!t) {
    console.log(
      `[mailer] Email disabled — would have sent reset link to ${to}:\n${fullUrl}`
    );
    return;
  }

  const logo = getLogoAttachment();
  const logoHtml = logo
    ? '<img src="cid:lanka-logo" alt="Lanka Tool Hire" width="44" height="44" style="display:block;margin:0 auto 10px;border-radius:8px;" />'
    : '';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#ecf0f1;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ecf0f1;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#34495e,#2c3e50);padding:28px 32px;text-align:center;">
              ${logoHtml}
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                Lanka Tool Hire
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 12px;color:#34495e;font-size:20px;font-weight:700;">
                Reset Your Password
              </h2>
              <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6;">
                We received a request to reset the password for your Lanka Tool Hire account. 
                Click the button below to choose a new password.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="border-radius:6px;background:#3498db;">
                    <a href="${fullUrl}" 
                       style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:6px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#888;font-size:12px;line-height:1.5;">
                This link expires in <strong>30 minutes</strong>. If you didn't request this, you can safely ignore this email.
              </p>
              <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
              <p style="margin:0;color:#aaa;font-size:11px;line-height:1.5;">
                If the button doesn't work, copy and paste this URL into your browser:<br/>
                <a href="${fullUrl}" style="color:#3498db;word-break:break-all;">${fullUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:16px 32px;text-align:center;border-top:1px solid #eee;">
              <p style="margin:0;color:#999;font-size:11px;">
                &copy; ${new Date().getFullYear()} Lanka Tool Hire (Pvt) Ltd. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const fromAddress = process.env.EMAIL_FROM || `"Lanka Tool Hire" <${user}>`;

  const mailOptions = {
    from: fromAddress,
    to,
    subject: 'Reset your Lanka Tool Hire password',
    text: `We received a request to reset your password.\n\nClick the link below to choose a new password. This link expires in 30 minutes.\n\n${fullUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    html,
  };

  if (logo) {
    mailOptions.attachments = [logo];
  }

  await t.sendMail(mailOptions);
}