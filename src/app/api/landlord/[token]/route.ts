import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const report = await prisma.inspectionReport.findFirst({
      where: { shareToken: params.token },
      include: {
        room: {
          include: {
            user: {
              select: { name: true, email: true, phone: true },
            },
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
      return NextResponse.json({ error: 'Invalid or expired landlord link' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Landlord view error:', error);
    return NextResponse.json({ error: 'Failed to load landlord report' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const report = await prisma.inspectionReport.findFirst({
      where: { shareToken: params.token },
      include: { room: true },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action, landlordName, landlordPhone, landlordNotes, landlordSignature, disputedItems } = body;

    if (action === 'ACKNOWLEDGE') {
      const now = new Date();
      await prisma.inspectionReport.update({
        where: { id: report.id },
        data: {
          landlordName: landlordName || report.landlordName,
          landlordPhone: landlordPhone || report.landlordPhone,
          landlordNotes: landlordNotes || null,
          landlordSignature: landlordSignature || landlordName,
          landlordAcknowledgedAt: now,
          landlordStatus: 'ACKNOWLEDGED',
        },
      });

      // Notify tenant
      await prisma.notification.create({
        data: {
          userId: report.room.userId,
          title: 'Landlord Acknowledged Inspection',
          message: `${landlordName || 'Landlord'} signed and accepted the condition certificate for ${report.room.title}.`,
          type: 'ACKNOWLEDGMENT',
          linkUrl: `/reports/${report.id}`,
        },
      });

      return NextResponse.json({ success: true, message: 'Acknowledgment recorded' });
    }

    if (action === 'DISPUTE_ITEMS') {
      if (Array.isArray(disputedItems)) {
        for (const item of disputedItems) {
          await prisma.inspectionItemRecord.update({
            where: { id: item.itemId },
            data: {
              landlordDisputed: true,
              landlordComment: item.comment,
            },
          });
        }
      }

      await prisma.inspectionReport.update({
        where: { id: report.id },
        data: { landlordStatus: 'DISPUTED' },
      });

      // Notify tenant
      await prisma.notification.create({
        data: {
          userId: report.room.userId,
          title: 'Landlord Raised Item Comments',
          message: `${report.room.landlordName} flagged items on the inspection report for ${report.room.title}.`,
          type: 'REMINDER',
          linkUrl: `/reports/${report.id}`,
        },
      });

      return NextResponse.json({ success: true, message: 'Dispute comments recorded' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Landlord action error:', error);
    return NextResponse.json({ error: 'Failed to record landlord action' }, { status: 500 });
  }
}
