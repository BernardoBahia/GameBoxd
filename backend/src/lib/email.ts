import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string,
): Promise<void> {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? '"GameBoxd" <no-reply@gameboxd.com>',
    to,
    subject: "Redefinição de senha — GameBoxd",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#18181b;color:#fafafa;border-radius:12px">
        <h2 style="margin:0 0 8px;font-size:20px">Redefinição de senha</h2>
        <p style="color:#a1a1aa;margin:0 0 24px;font-size:14px">
          Recebemos uma solicitação para redefinir a senha da sua conta no GameBoxd.
        </p>
        <a
          href="${resetLink}"
          style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600"
        >
          Redefinir senha
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#71717a">
          Este link expira em <strong>15 minutos</strong>. Se você não solicitou a troca de senha, ignore este e-mail.
        </p>
        <p style="margin:8px 0 0;font-size:12px;color:#52525b">
          Ou acesse: <a href="${resetLink}" style="color:#7c3aed">${resetLink}</a>
        </p>
      </div>
    `,
    text: `Redefinição de senha — GameBoxd\n\nAcesse o link abaixo para redefinir sua senha (expira em 15 minutos):\n\n${resetLink}\n\nSe você não solicitou, ignore este e-mail.`,
  });
}