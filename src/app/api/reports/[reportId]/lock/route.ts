import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeItemHash, computeReportChainedHash } from '@/lib/crypto';

export async function POST(
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
            photos: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (report.status === 'LOCKED') {
      return NextResponse.json({
        success: true,
        message: 'Report is already cryptographically locked',
        report,
      });
    }

    const { tenantSignature } = (await req.json().catch(() => ({}))) || {};

    const now = new Date();
    const itemHashes: string[] = [];

    // Compute hashes for all items
    for (const item of report.items) {
      const photoHashes = item.photos.map((p) => p.sha256Hash);
      const itemHash = computeItemHash(item.id, item.conditionRating, item.status, photoHashes);
      itemHashes.push(itemHash);
    }

    // Compute chained cryptographic hash
    const chainedHash = computeReportChainedHash(
      report.reportNumber,
      now.toISOString(),
      itemHashes
    );

    // Update report to locked
    const updatedReport = await prisma.inspectionReport.update({
      where: { id: report.id },
      data: {
        status: 'LOCKED',
        chainedHash,
        lockedAt: now,
        completedAt: now,
        tenantSignature: tenantSignature || 'Verified Tenant',
      },
    });

    // Update room status
    let newRoomStatus = report.room.status;
    if (report.type === 'MOVE_IN') {
      newRoomStatus = 'LOCKED';
    } else if (report.type === 'MOVE_OUT') {
      newRoomStatus = 'COMPARED';
    }

    await prisma.room.update({
      where: { id: report.roomId },
      data: { status: newRoomStatus },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: report.room.userId,
        title: `Report ${report.reportNumber} Locked & Sealed`,
        message: `Tamper-evident ${report.type === 'MOVE_IN' ? 'Move-In' : 'Move-Out'} certificate generated with SHA-256 seal.`,
        type: 'LOCK',
        linkUrl: `/reports/${report.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Report cryptographically sealed & locked permanently.',
      report: updatedReport,
      chainedHash,
    });
  } catch (error) {
    console.error('Error locking report:', error);
    return NextResponse.json({ error: 'Failed to lock report' }, { status: 500 });
  }
}
