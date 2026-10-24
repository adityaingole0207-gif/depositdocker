import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeItemHash, computeReportChainedHash } from '@/lib/crypto';

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
        room: true,
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

    if (!report.lockedAt || !report.chainedHash) {
      return NextResponse.json({
        verified: false,
        status: 'UNSEALED_DRAFT',
        message: 'This report is still an unsealed draft and has not been cryptographically anchored.',
        report,
      });
    }

    // Recompute all item hashes
    const itemAudit = [];
    const itemHashes = [];

    for (const item of report.items) {
      const photoHashes = item.photos.map((p) => p.sha256Hash);
      const computedHash = computeItemHash(item.id, item.conditionRating, item.status, photoHashes);
      itemHashes.push(computedHash);

      itemAudit.push({
        id: item.id,
        name: item.checklistItem.name,
        category: item.checklistItem.category,
        rating: item.conditionRating,
        status: item.status,
        photoCount: item.photos.length,
        itemHash: computedHash,
        photos: item.photos.map((p) => ({
          id: p.id,
          sha256Hash: p.sha256Hash,
          serverTimestamp: p.serverTimestamp,
          exifCaptureDate: p.exifCaptureDate,
          exifGpsLat: p.exifGpsLat,
          exifGpsLng: p.exifGpsLng,
          fileUrl: p.fileUrl,
        })),
      });
    }

    // Recompute chained hash
    const recomputedChainedHash = computeReportChainedHash(
      report.reportNumber,
      report.lockedAt.toISOString(),
      itemHashes
    );

    const isIntact = recomputedChainedHash === report.chainedHash;

    return NextResponse.json({
      verified: isIntact,
      status: isIntact ? 'INTACT' : 'TAMPERED',
      storedChainedHash: report.chainedHash,
      recomputedChainedHash,
      lockedAt: report.lockedAt,
      reportNumber: report.reportNumber,
      roomTitle: report.room.title,
      itemsAudited: itemAudit.length,
      itemAudit,
      tamperCheckPassed: isIntact,
      auditTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error verifying report:', error);
    return NextResponse.json({ error: 'Failed to verify report' }, { status: 500 });
  }
}
