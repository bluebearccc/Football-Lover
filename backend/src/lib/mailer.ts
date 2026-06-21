import { createTransport, type Transporter } from 'nodemailer';
import { env, isProd } from '../config/env';

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

let transporter: Transporter | null = null;

if (env.mail.host) {
  transporter = createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465,
    auth: { user: env.mail.user, pass: env.mail.pass },
  });
}

export const mailer = {
  async send(mail: Mail): Promise<void> {
    if (!transporter) {
      if (isProd) {
        throw new Error('SMTP is not configured in production');
      }
      // eslint-disable-next-line no-console
      console.log(`[mailer:dev] To=${mail.to} | ${mail.subject}\n${mail.text}`);
      return;
    }
    await transporter.sendMail({
      from: env.mail.from,
      to: mail.to,
      subject: mail.subject,
      text: mail.text,
    });
  },
};
