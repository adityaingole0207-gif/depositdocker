import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const report = await prisma.inspectionReport.findUnique({
      where: { id: params.reportId },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (report.status === 'LOCKED') {
      return NextResponse.json(
        { error: 'Cannot modify a cryptographically locked inspection report.' },
        { status: 403 }
      );
    }

    const { items, tenantSignature } = await req.json();

    if (tenantSignature) {
      await prisma.inspectionReport.update({
        where: { id: report.id },
        data: { tenantSignature },
      });
    }

    if (Array.isArray(items)) {
      for (const item of items) {
        const { checklistItemId, conditionRating, notes, photos } = item;

        // Upsert item record
        let record = await prisma.inspectionItemRecord.findFirst({
          where: { reportId: report.id, checklistItemId },
        });

        const status =
          conditionRating <= 2
            ? report.type === 'MOVE_IN'
              ? 'PRE_EXISTING'
              : 'POSSIBLE_DAMAGE'
            : conditionRating === 3
            ? 'NORMAL_WEAR'
            : 'INTACT';

        if (record) {
          record = await prisma.inspectionItemRecord.update({
            where: { id: record.id },
            data: {
              conditionRating: Number(conditionRating),
              notes: notes || '',
              status,
            },
          });
        } else {
          record = await prisma.inspectionItemRecord.create({
            data: {
              reportId: report.id,
              checklistItemId,
              conditionRating: Number(conditionRating),
              notes: notes || '',
              status,
            },
          });
        }

        // Add photos if provided
        if (Array.isArray(photos)) {
          for (const photo of photos) {
            // Check if photo already linked
            const existing = await prisma.evidencePhoto.findFirst({
              where: { itemRecordId: record.id, sha256Hash: photo.sha256Hash },
            });

            if (!existing) {
              await prisma.evidencePhoto.create({
                data: {
                  itemRecordId: record.id,
                  fileUrl: photo.fileUrl,
                  sha256Hash: photo.sha256Hash,
                  serverTimestamp: photo.serverTimestamp ? new Date(photo.serverTimestamp) : new Date(),
                  exifCaptureDate: photo.exifCaptureDate ? new Date(photo.exifCaptureDate) : new Date(),
                  exifGpsLat: photo.exifGpsLat || 18.6279,
                  exifGpsLng: photo.exifGpsLng || 73.7831,
                  fileSize: photo.fileSize || 0,
                  mimeType: photo.mimeType || 'image/jpeg',
                },
              });
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Inspection items auto-saved' });
  } catch (error) {
    console.error('Error saving inspection items:', error);
    return NextResponse.json({ error: 'Failed to save items' }, { status: 500 });
  }
}
