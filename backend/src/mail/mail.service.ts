import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { MailOptions } from './interfaces';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get('MAIL_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Event Management!</h1>
          </div>
          <div class="content">
            <p>Hello {{userName}},</p>
            <p>Thank you for registering! We're excited to have you on board.</p>
            <p>You can now:</p>
            <ul>
              <li>Browse and discover exciting events</li>
              <li>Make reservations for your favorite events</li>
              <li>Manage your bookings</li>
            </ul>
            <p style="margin-top: 30px;">
              <a href="{{appUrl}}" class="button">Start Exploring Events</a>
            </p>
          </div>
          <div class="footer">
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>&copy; 2026 Event Management. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({
      userName,
      appUrl: this.configService.get('APP_URL', 'http://localhost:3000'),
    });

    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM', 'noreply@eventmanagement.com'),
      to: userEmail,
      subject: 'Welcome to Event Management!',
      html,
    });
  }

  async sendReservationPending(
    userEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: Date,
    numberOfSeats: number,
  ): Promise<void> {
    const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .event-details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reservation Pending</h1>
          </div>
          <div class="content">
            <p>Hello {{userName}},</p>
            <p>Your reservation has been received and is currently pending approval.</p>
            <div class="event-details">
              <h3>{{eventTitle}}</h3>
              <p><strong>Date:</strong> {{eventDate}}</p>
              <p><strong>Number of Seats:</strong> {{numberOfSeats}}</p>
            </div>
            <p>You will receive a confirmation email once your reservation is approved by the event organizer.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Event Management. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({
      userName,
      eventTitle,
      eventDate: new Date(eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      numberOfSeats,
    });

    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM', 'noreply@eventmanagement.com'),
      to: userEmail,
      subject: `Reservation Pending - ${eventTitle}`,
      html,
    });
  }

  async sendReservationConfirmed(
    userEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: Date,
    eventLocation: string,
    numberOfSeats: number,
    ticketPdf?: Buffer,
  ): Promise<void> {
    const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .event-details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #22c55e; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Reservation Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hello {{userName}},</p>
            <p>Great news! Your reservation has been confirmed.</p>
            <div class="event-details">
              <h3>{{eventTitle}}</h3>
              <p><strong>Date:</strong> {{eventDate}}</p>
              <p><strong>Location:</strong> {{eventLocation}}</p>
              <p><strong>Number of Seats:</strong> {{numberOfSeats}}</p>
            </div>
            <p>Your ticket is attached to this email. Please present it at the venue.</p>
            <p>We look forward to seeing you at the event!</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Event Management. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({
      userName,
      eventTitle,
      eventDate: new Date(eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      eventLocation,
      numberOfSeats,
    });

    const mailOptions: MailOptions = {
      from: this.configService.get('MAIL_FROM', 'noreply@eventmanagement.com'),
      to: userEmail,
      subject: `Reservation Confirmed - ${eventTitle}`,
      html,
    };

    if (ticketPdf) {
      mailOptions.attachments = [
        {
          filename: 'ticket.pdf',
          content: ticketPdf,
          contentType: 'application/pdf',
        },
      ];
    }

    await this.transporter.sendMail(mailOptions);
  }

  async sendReservationCanceled(
    userEmail: string,
    userName: string,
    eventTitle: string,
    reason?: string,
  ): Promise<void> {
    const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .event-details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reservation Canceled</h1>
          </div>
          <div class="content">
            <p>Hello {{userName}},</p>
            <p>Your reservation for <strong>{{eventTitle}}</strong> has been canceled.</p>
            {{#if reason}}
            <div class="event-details">
              <p><strong>Reason:</strong> {{reason}}</p>
            </div>
            {{/if}}
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Event Management. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({
      userName,
      eventTitle,
      reason,
    });

    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM', 'noreply@eventmanagement.com'),
      to: userEmail,
      subject: `Reservation Canceled - ${eventTitle}`,
      html,
    });
  }

  async sendEventCanceled(
    userEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: Date,
  ): Promise<void> {
    const template = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px 20px; background: #f9fafb; }
          .event-details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Event Canceled</h1>
          </div>
          <div class="content">
            <p>Hello {{userName}},</p>
            <p>We regret to inform you that the following event has been canceled:</p>
            <div class="event-details">
              <h3>{{eventTitle}}</h3>
              <p><strong>Scheduled Date:</strong> {{eventDate}}</p>
            </div>
            <p>Your reservation has been automatically canceled. We apologize for any inconvenience.</p>
            <p>Please check our website for other upcoming events that might interest you.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 Event Management. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({
      userName,
      eventTitle,
      eventDate: new Date(eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM', 'noreply@eventmanagement.com'),
      to: userEmail,
      subject: `Event Canceled - ${eventTitle}`,
      html,
    });
  }
}
