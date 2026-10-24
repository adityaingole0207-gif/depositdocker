import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInspectionCertificatePdf } from '@/lib/pdf';

export async function GET(
  req: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const report = await prisma.inspectionReport.findFirst({
      where: {
        OR: [{ id: params.reportId }, { reportNumber: params.reportId }],
      },
      include: {
        room: {
          include: {
            user: true,
          },
        },
        items: {
          include: {
            checklistItem: true,
            photos: true,
          },
          orderBy: { checklistItem: { sortOrder: 'asc' } },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const pdfBuffer = await generateInspectionCertificatePdf({
      reportNumber: report.reportNumber,
      roomTitle: report.room.title,
      propertyType: report.room.propertyType,
      address: report.room.address,
      area: report.room.area,
      monthlyRent: report.room.monthlyRent,
      securityDeposit: report.room.securityDeposit,
      leaseStartDate: report.room.leaseStartDate.toISOString().split('T')[0],
      leaseEndDate: report.room.leaseEndDate.toISOString().split('T')[0],
      landlordName: report.landlordName || report.room.landlordName,
      landlordPhone: report.landlordPhone || report.room.landlordPhone,
      tenantName: report.room.user.name,
      reportType: report.type as 'MOVE_IN' | 'MOVE_OUT',
      chainedHash: report.chainedHash || 'DRAFT_UNLOCKED',
      lockedAt: report.lockedAt ? report.lockedAt.toISOString() : 'UNLOCKED DRAFT',
      landlordSignature: report.landlordSignature,
      tenantSignature: report.tenantSignature,
      items: report.items.map((i) => ({
        category: i.checklistItem.category,
        name: i.checklistItem.name,
        rating: i.conditionRating,
        status: i.status,
        notes: i.notes || '',
        photoHash: i.photos[0]?.sha256Hash,
      })),
      appBaseUrl,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="DepositLocker-Certificate-${report.reportNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
