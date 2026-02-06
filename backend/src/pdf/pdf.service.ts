import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { ReservationWithRelations } from '../reservations/interfaces';

@Injectable()
export class PdfService {
  constructor(private configService: ConfigService) {}

  async generateTicket(reservation: ReservationWithRelations): Promise<Buffer> {
    // Generate QR code before creating the PDF stream
    const qrData = `RESERVATION:${reservation.id}:${reservation.event.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc
          .fontSize(28)
          .font('Helvetica-Bold')
          .text('EVENT TICKET', { align: 'center' })
          .moveDown(0.5);

        // Divider line
        doc
          .strokeColor('#333')
          .lineWidth(2)
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .stroke()
          .moveDown(1);

        // Event Information
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .fillColor('#1a1a1a')
          .text(reservation.event.title, { align: 'center' })
          .moveDown(0.5);

        doc
          .fontSize(12)
          .font('Helvetica')
          .fillColor('#666')
          .text(
            `${new Date(reservation.event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}`,
            { align: 'center' },
          )
          .text(
            `${new Date(reservation.event.date).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}`,
            { align: 'center' },
          )
          .moveDown(0.3)
          .text(reservation.event.location, { align: 'center' })
          .moveDown(2);

        // Reservation Details
        const leftColumn = 70;
        const rightColumn = 320;
        let currentY = doc.y;

        // Left Column
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#333')
          .text('RESERVATION DETAILS', leftColumn, currentY);

        currentY += 20;
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#666')
          .text('Reservation ID:', leftColumn, currentY)
          .font('Helvetica-Bold')
          .fillColor('#000')
          .text(reservation.id.substring(0, 8).toUpperCase(), leftColumn + 100, currentY);

        currentY += 18;
        doc
          .font('Helvetica')
          .fillColor('#666')
          .text('Status:', leftColumn, currentY)
          .font('Helvetica-Bold')
          .fillColor(reservation.status === 'CONFIRMED' ? '#22c55e' : '#f59e0b')
          .text(reservation.status, leftColumn + 100, currentY);

        currentY += 18;
        doc
          .font('Helvetica')
          .fillColor('#666')
          .text('Number of Seats:', leftColumn, currentY)
          .font('Helvetica-Bold')
          .fillColor('#000')
          .text(reservation.numberOfSeats.toString(), leftColumn + 100, currentY);

        currentY += 18;
        doc
          .font('Helvetica')
          .fillColor('#666')
          .text('Booking Date:', leftColumn, currentY)
          .font('Helvetica-Bold')
          .fillColor('#000')
          .text(new Date(reservation.createdAt).toLocaleDateString(), leftColumn + 100, currentY);

        // Right Column - Attendee Info
        currentY = doc.y - 56;
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .fillColor('#333')
          .text('ATTENDEE INFORMATION', rightColumn, currentY);

        currentY += 20;
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#666')
          .text('Name:', rightColumn, currentY)
          .font('Helvetica-Bold')
          .fillColor('#000')
          .text(
            `${reservation.user.firstName} ${reservation.user.lastName}`,
            rightColumn + 50,
            currentY,
          );

        currentY += 18;
        doc
          .font('Helvetica')
          .fillColor('#666')
          .text('Email:', rightColumn, currentY)
          .font('Helvetica-Bold')
          .fillColor('#000')
          .text(reservation.user.email, rightColumn + 50, currentY, { width: 200 });

        // QR Code
        doc.moveDown(4);
        const qrSize = 120;
        const qrX = (doc.page.width - qrSize) / 2;
        doc.image(qrCodeBuffer, qrX, doc.y, { width: qrSize, height: qrSize });

        doc.moveDown(8);
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor('#999')
          .text('Scan this QR code at the venue for quick check-in', { align: 'center' })
          .moveDown(2);

        // Footer
        doc
          .strokeColor('#e5e5e5')
          .lineWidth(1)
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .stroke()
          .moveDown(0.5);

        doc
          .fontSize(8)
          .fillColor('#999')
          .text('This is your official event ticket. Please present it at the venue.', {
            align: 'center',
          })
          .text('For questions, contact the event organizer or visit our support page.', {
            align: 'center',
          });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
