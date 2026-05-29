import { jsPDF } from 'jspdf';

interface TicketData {
  bookingId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  teamName: string;
  sportName: string;
  date: string;
  time: string;
  addons: string[];
  hourlyRate: number;
  addonsTotal: number;
  gst: number;
  total: number;
  createdAt: string;
  pitchType?: string;
  duration?: number;
}

export function generateBookingPDF(ticket: TicketData) {
  // Create a new A4 sized PDF (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;

  // --- Theme Colors ---
  const PRIMARY_DARK = '#09090b'; // Tailwind Zinc 950 border
  const ACCENT_ORANGE = '#f97316'; // orange-500
  const TEXT_DARK = '#18181b'; // Zinc 900
  const TEXT_MUTED = '#71717a'; // Zinc 500
  const BG_LIGHT = '#fafafa'; // Zinc 50

  // 1. Decorative background gradients / details (a side orange ribbon)
  doc.setFillColor(249, 115, 22); // ACCENT_ORANGE
  doc.rect(0, 0, 6, pageHeight, 'F'); // Left vertical highlight bar

  // 2. Top Header Banner Block
  doc.setFillColor(9, 9, 11); // PRIMARY_DARK
  doc.rect(15, 15, 180, 38, 'F');

  // Horizontal Orange Line under header inside banner
  doc.setFillColor(249, 115, 22);
  doc.rect(15, 51, 180, 2, 'F');

  // Title Text Inside Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('JACK FOOTBALL CLUB', 25, 30);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text('FIFA-Certified Arena • Home of Jack FC • Horamavu Bengaluru', 25, 36);
  doc.text('OFFICIAL GATE ENTRY PASS & PLAY PERMIT Receipt', 25, 42);

  // Ticket ID in banner (top right alignment)
  doc.setFont('Courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(249, 115, 22); // Orange Ticket Reference
  doc.text(`ID: ${ticket.bookingId}`, 140, 30);

  // 3. Main Information Grid (Column 1: Athlete | Column 2: Booking Info)
  doc.setTextColor(24, 24, 27); // TEXT_DARK
  
  // Athlete profile block
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ATHLETE DETAILS', 20, 65);
  
  doc.setDrawColor(228, 228, 231); // light border
  doc.setLineWidth(0.25);
  doc.line(20, 67, 100, 67);

  doc.setFont('Helvetica', 'bold');
  doc.text('Name:', 20, 74);
  doc.setFont('Helvetica', 'normal');
  doc.text(ticket.userName, 58, 74);

  doc.setFont('Helvetica', 'bold');
  doc.text('Contact Phone:', 20, 81);
  doc.setFont('Helvetica', 'normal');
  doc.text(ticket.userPhone, 58, 81);

  doc.setFont('Helvetica', 'bold');
  doc.text('Contact Email:', 20, 88);
  doc.setFont('Helvetica', 'normal');
  doc.text(ticket.userEmail, 58, 88);

  doc.setFont('Helvetica', 'bold');
  doc.text('Squad/Team:', 20, 95);
  doc.setFont('Helvetica', 'normal');
  doc.text(ticket.teamName, 58, 95);

  // Booking Info Block (Right Column)
  doc.setFont('Helvetica', 'bold');
  doc.text('SCHEDULE INFO', 115, 65);
  doc.line(115, 67, 195, 67);

  doc.setFont('Helvetica', 'bold');
  doc.text('Facility:', 115, 74);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(249, 115, 22); // Orange highlight sport
  doc.text(ticket.sportName + (ticket.pitchType ? ` (${ticket.pitchType})` : ''), 146, 74);
  doc.setTextColor(24, 24, 27);

  doc.setFont('Helvetica', 'bold');
  doc.text('Play Date:', 115, 81);
  doc.setFont('Helvetica', 'normal');
  doc.text(ticket.date, 146, 81);

  doc.setFont('Helvetica', 'bold');
  doc.text('Time Slot:', 115, 88);
  doc.setFont('Helvetica', 'bold');
  doc.text(ticket.time, 146, 88);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(24, 24, 27);
  doc.text('Receipt Date:', 115, 95);
  doc.setFont('Helvetica', 'normal');
  doc.text(new Date(ticket.createdAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }), 146, 95);


  // 4. Charges Itemization Table
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('BILLING DETAILS & FEE COMPILATION', 20, 110);
  doc.line(20, 112, 195, 112);

  // Table Header row background
  doc.setFillColor(244, 244, 245); // light gray
  doc.rect(20, 116, 175, 8, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(82, 82, 91); // gray
  doc.text('Charge Description', 24, 121);
  doc.text('Pricing (INR)', 165, 121);

  // Item 1: Base hourly slot
  const bookingDuration = ticket.duration || 1;
  const computedBaseTotal = ticket.hourlyRate * bookingDuration;

  doc.setTextColor(24, 24, 27);
  doc.setFont('Helvetica', 'bold');
  doc.text(ticket.sportName + (ticket.pitchType ? ` - ${ticket.pitchType}` : ''), 24, 131);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Hourly reservation rate for ${bookingDuration} ${bookingDuration === 1 ? 'Hour' : 'Hours'} (INR ${ticket.hourlyRate}/Hr)`, 24, 135);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`INR ${computedBaseTotal}`, 165, 131);

  // Item 2: Addons
  let nextY = 143;
  if (ticket.addons && ticket.addons.length > 0) {
    doc.setFont('Helvetica', 'bold');
    doc.text('Jack FC Extra Premium Addons Included:', 24, nextY);
    nextY += 4;
    doc.setFont('Helvetica', 'normal');
    ticket.addons.forEach((addonName) => {
      doc.setFontSize(8);
      doc.text(`• ${addonName}`, 28, nextY);
      nextY += 4.5;
    });
    // Addon pricing subtotal
    doc.setFontSize(9);
    doc.text('Addons Extra pricing unit sum', 24, nextY);
    doc.text(`INR ${ticket.addonsTotal}`, 165, nextY);
    nextY += 6;
  }

  // Draw separator line
  doc.setDrawColor(228, 228, 231);
  doc.line(20, nextY - 1, 195, nextY - 1);

  // GST (18%) taxation row removed per manager request
  nextY += 3;

  // Total amount orange banner box
  doc.setFillColor(249, 115, 22); // orange
  doc.rect(20, nextY, 175, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL PAID AMOUNT IN FULL', 25, nextY + 7.5);
  doc.setFont('Courier', 'bold');
  doc.setFontSize(14);
  doc.text(`INR ${ticket.total}`, 155, nextY + 7.5);

  nextY += 21;

  // 5. Visual Gate Entry Scan representation (Ticket stamp)
  // Draw a simulated barcode: 30 long bars of random widths to visual accuracy
  doc.setFillColor(9, 9, 11);
  let barX = 22;
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(113, 113, 122);
  doc.text('GATE-PASS SECURITY BARCODE', barX, nextY - 5);
  
  for (let b = 1; b <= 35; b++) {
    const width = b % 4 === 0 ? 1.5 : b % 3 === 0 ? 0.4 : b % 2 === 0 ? 1.0 : 0.6;
    doc.rect(barX, nextY, width, 14, 'F');
    barX += width + 0.55;
  }
  doc.setFont('Courier', 'bold');
  doc.setFontSize(8);
  doc.text(`*${ticket.bookingId}-${ticket.userName.slice(0, 4).toUpperCase()}*`, 22, nextY + 18);

  // Status Stamp (Green visual badge)
  const stampX = 145;
  const stampY = nextY - 2;
  doc.setDrawColor(34, 197, 94); // solid emerald-500
  doc.setLineWidth(0.6);
  doc.rect(stampX, stampY, 45, 16);
  doc.setTextColor(34, 197, 94);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RESERVED & PAID', stampX + 5, stampY + 6.5);
  doc.setFontSize(7.5);
  doc.setFont('Helvetica', 'normal');
  doc.text('VERIFIED VIA FIRESTORE', stampX + 6, stampY + 11.5);

  // 6. Security & Ground regulations
  nextY += 28;
  doc.setFillColor(244, 244, 245); // light gray info box
  doc.rect(20, nextY, 175, 28, 'F');

  doc.setTextColor(82, 82, 91);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('GROUND REGULATIONS & ARENA CODE OF CONDUCT', 24, nextY + 5);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  
  const rules = [
    '1. Non-marking soccer shoes are strictly mandatory on turf arena. Absolutely no metal spikes allowed.',
    '2. Standard reservations are strictly restricted to the booked hour. Please clear ground 5 minutes before expiration.',
    '3. Booking cancellations/rescheduling must be requested at least 12 Hours prior dynamically via direct contact.',
    '4. Present this generated PDF copy with the secure barcode at the Horamavu Arena frontdesk scans.'
  ];

  let rulesY = nextY + 9.5;
  rules.forEach((rule) => {
    doc.text(rule, 24, rulesY);
    rulesY += 4;
  });

  // Footer text
  doc.setTextColor(161, 161, 170);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('This is an electronically compiled validation slip. No signature is legally required.', 20, 282);
  doc.text('Thank you for playing at Jack Football Club! Burn sweat, play absolute raw.', 118, 282);

  // Save the PDF
  const filename = `JackFC_Receipt_${ticket.userName.replace(/\s+/g, '_')}_${ticket.date.replace(/[,/\s]+/g, '_')}.pdf`;
  doc.save(filename);
}
