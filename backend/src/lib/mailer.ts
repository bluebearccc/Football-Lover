import { env, isProd } from '../config/env';

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

/**
 * Email sender abstraction.
 * - When SMTP is configured (SMTP_HOST set), wire a real transport here (e.g. nodemailer).
 * - In development without SMTP, the message is logged so the reset flow is testable.
 * Credentials are read from env (server-side only).
 */
export const mailer = {
  async send(mail: Mail): Promise<void> {
    if (!env.mail.host) {
      // Dev fallback: no SMTP configured.
      // eslint-disable-next-line no-console
      console.log(`[mailer:dev] To=${mail.to} | ${mail.subject}\n${mail.text}`);
      if (isProd) {
        throw new Error('SMTP is not configured in production');
      }
      return;
    }
    // TODO: integrate nodemailer/transactional provider using env.mail.* when SMTP_HOST is set.
    // eslint-disable-next-line no-console
    console.log(`[mailer] (SMTP configured) sending to ${mail.to}: ${mail.subject}`);
  },
};
