import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { config } from '../config.js';

let transporter: Transporter | null = null;

function getTransporter() {
  if (!config.mail.enabled || !config.mail.host) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.secure,
      auth: config.mail.user
        ? {
            user: config.mail.user,
            pass: config.mail.pass,
          }
        : undefined,
    });
  }

  return transporter;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendEmail(input: SendEmailInput) {
  const transport = getTransporter();

  if (!transport) {
    console.info('[email:skipped]', {
      to: input.to,
      subject: input.subject,
      reason: 'SMTP not configured (set SMTP_HOST / SMTP_ENABLED=true)',
    });
    return { sent: false as const, skipped: true as const };
  }

  try {
    await transport.sendMail({
      from: config.mail.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    return { sent: true as const, skipped: false as const };
  } catch (error) {
    console.error('[email:failed]', input.to, input.subject, error);
    return { sent: false as const, skipped: false as const, error };
  }
}

/** Fire-and-forget so API responses stay fast. */
export function queueEmail(input: SendEmailInput) {
  void sendEmail(input);
}
