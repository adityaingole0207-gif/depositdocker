import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifySessionToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        reports: {
          include: {
            items: {
              include: {
                checklistItem: true,
                photos: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Also get all checklist items so the walkthrough can load full 40 items
    const checklistItems = await prisma.checklistItem.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ room, checklistItems });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await prisma.room.update({
      where: { id: params.id },
      data: {
        title: body.title,
        propertyType: body.propertyType,
        address: body.address,
        area: body.area,
        monthlyRent: body.monthlyRent ? Number(body.monthlyRent) : undefined,
        securityDeposit: body.securityDeposit ? Number(body.securityDeposit) : undefined,
        landlordName: body.landlordName,
        landlordPhone: body.landlordPhone,
        landlordEmail: body.landlordEmail,
        status: body.status,
      },
    });

    return NextResponse.json({ room: updated });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.room.update({
      where: { id: params.id },
      data: { status: 'ARCHIVED' },
    });
    return NextResponse.json({ success: true, message: 'Room archived' });
  } catch (error) {
    console.error('Error archiving room:', error);
    return NextResponse.json({ error: 'Failed to archive room' }, { status: 500 });
  }
}
