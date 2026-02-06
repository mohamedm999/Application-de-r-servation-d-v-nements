import { Attachment } from 'nodemailer/lib/mailer';

export interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
}
