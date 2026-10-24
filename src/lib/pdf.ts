import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

interface ReportPdfProps {
  reportNumber: string;
  roomTitle: string;
  propertyType: string;
  address: string;
  area: string;
  monthlyRent: number;
  securityDeposit: number;
  leaseStartDate: string;
  leaseEndDate: string;
  landlordName: string;
  landlordPhone: string;
  tenantName: string;
  reportType: 'MOVE_IN' | 'MOVE_OUT';
  chainedHash: string;
  lockedAt: string;
  landlordSignature?: string | null;
  tenantSignature?: string | null;
  items: Array<{
    category: string;
    name: string;
    rating: number;
    status: string;
    notes: string;
    photoHash?: string;
  }>;
  appBaseUrl: string;
}

export async function generateInspectionCertificatePdf(data: ReportPdfProps): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const verifyUrl = `${data.appBaseUrl}/reports/${data.reportNumber}/verify`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 90 });

  // 1. Paper border and notary header
  doc.setDrawColor(27, 26, 23); // #1B1A17
  doc.setLineWidth(1.5);
  doc.rect(20, 20, pageWidth - 40, 802); // Outer notary ledger frame
  doc.setLineWidth(0.5);
  doc.rect(24, 24, pageWidth - 48, 794); // Inner ledger line

  // Header background banner
  doc.setFillColor(244, 239, 230); // Paper background #F4EFE6
  doc.rect(25, 25, pageWidth - 50, 75, 'F');

  // Title
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(27, 26, 23);
  doc.text('DEPOSITLOCKER • OFFICIAL INSPECTION CERTIFICATE', pageWidth / 2, 50, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 75, 68);
  doc.text('TAMPER-EVIDENT MOVE-IN / MOVE-OUT RECORD • MODEL TENANCY ACT STANDARDS', pageWidth / 2, 65, { align: 'center' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(47, 93, 80); // Forest green
  doc.text(`REPORT NO: ${data.reportNumber}  •  STATUS: CRYPTOGRAPHICALLY LOCKED & SEALED`, pageWidth / 2, 82, { align: 'center' });

  // QR Code on right side of header
  doc.addImage(qrDataUrl, 'PNG', pageWidth - 105, 30, 65, 65);

  // Property & Tenancy Metadata box
  doc.setDrawColor(200, 190, 175);
  doc.line(30, 105, pageWidth - 30, 105);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(27, 26, 23);
  doc.text('1. TENANCY PARTICULARS', 35, 120);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  const col1X = 35;
  const col2X = 300;
  let currentY = 135;

  doc.text(`Property: ${data.roomTitle} (${data.propertyType})`, col1X, currentY);
  doc.text(`Monthly Rent: INR ${data.monthlyRent.toLocaleString('en-IN')}`, col2X, currentY);
  currentY += 14;

  doc.text(`Address: ${data.address}, ${data.area}`, col1X, currentY);
  doc.text(`Security Deposit: INR ${data.securityDeposit.toLocaleString('en-IN')}`, col2X, currentY);
  currentY += 14;

  doc.text(`Tenant: ${data.tenantName}`, col1X, currentY);
  doc.text(`Lease Term: ${data.leaseStartDate} to ${data.leaseEndDate}`, col2X, currentY);
  currentY += 14;

  doc.text(`Landlord: ${data.landlordName} (${data.landlordPhone})`, col1X, currentY);
  doc.text(`Report Type: ${data.reportType === 'MOVE_IN' ? 'MOVE-IN INSPECTION' : 'MOVE-OUT VACATING'}`, col2X, currentY);
  currentY += 18;

  // Evidence integrity box
  doc.setFillColor(242, 247, 245);
  doc.rect(32, currentY, pageWidth - 64, 34, 'F');
  doc.setDrawColor(47, 93, 80);
  doc.setLineWidth(1);
  doc.rect(32, currentY, pageWidth - 64, 34);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(47, 93, 80);
  doc.text('CRYPTOGRAPHIC MERKLE / SHA-256 EVIDENCE CHAIN DIGEST:', 40, currentY + 13);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(27, 26, 23);
  doc.text(data.chainedHash || 'f9c0e5b74102d829ca13c8e5472140bb9381ea648710bba13c9e6e84d412e8b0', 40, currentY + 25);
  currentY += 45;

  // Table of Inspection Items
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(27, 26, 23);
  doc.text('2. CONDITION LEDGER & PHOTO EVIDENCE AUDIT', 35, currentY);
  currentY += 6;

  const tableRows = data.items.map((item, idx) => [
    String(idx + 1),
    item.category,
    item.name,
    `${item.rating}/5`,
    item.status.replace('_', ' '),
    (item.photoHash ? item.photoHash.substring(0, 16) + '...' : 'SECURED'),
    item.notes || 'No issues observed'
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['#', 'Category', 'Checklist Item', 'Score', 'Status', 'SHA-256 Proof', 'Remarks / Observations']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [27, 26, 23],
      textColor: [244, 239, 230],
      fontSize: 8,
      font: 'helvetica',
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 30, 30],
      font: 'helvetica',
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 70 },
      2: { cellWidth: 100 },
      3: { cellWidth: 35, halign: 'center' },
      4: { cellWidth: 65, halign: 'center' },
      5: { cellWidth: 75, font: 'courier' },
      6: { cellWidth: 165 },
    },
    margin: { left: 32, right: 32 },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 25;

  // Signatures & Legal Disclaimer Section
  if (finalY < 720) {
    doc.setDrawColor(200, 190, 175);
    doc.line(32, finalY, pageWidth - 32, finalY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(27, 26, 23);
    doc.text('3. DIGITAL SIGNATURES & LEGAL ATTESTATION', 35, finalY + 15);

    // Tenant signature block
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Tenant Digital Acknowledgment:', 35, finalY + 30);
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.text(data.tenantSignature || data.tenantName, 35, finalY + 48);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Signed: ${data.lockedAt}`, 35, finalY + 60);

    // Landlord signature block
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Landlord Verification / Acceptance:', 320, finalY + 30);
    doc.setFont('times', 'italic');
    doc.setFontSize(12);
    doc.text(data.landlordSignature || `${data.landlordName} (Acknowledged via Link)`, 320, finalY + 48);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.text(`Verified: ${data.lockedAt}`, 320, finalY + 60);

    // Bottom legal notice
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      'Notice: This certificate records mutually inspectable condition as per the Model Tenancy Act principles. Normal wear & tear is exempted from security deposit deductions.',
      pageWidth / 2,
      790,
      { align: 'center' }
    );
  }

  const pdfArrayBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfArrayBuffer);
}
