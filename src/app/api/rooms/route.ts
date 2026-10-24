import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    let userId: string | null = null;

    if (token) {
      const payload = await verifySessionToken(token);
      if (payload) userId = payload.userId;
    }

    // If not logged in, fallback to demo user so public demonstration works effortlessly
    if (!userId) {
      const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@depositlocker.com' },
      });
      if (demoUser) userId = demoUser.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rooms = await prisma.room.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        reports: {
          select: {
            id: true,
            type: true,
            status: true,
            reportNumber: true,
            lockedAt: true,
            chainedHash: true,
            shareToken: true,
            landlordStatus: true,
          },
        },
      },
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    let userId: string | null = null;

    if (token) {
      const payload = await verifySessionToken(token);
      if (payload) userId = payload.userId;
    }

    if (!userId) {
      const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@depositlocker.com' },
      });
      if (demoUser) userId = demoUser.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      propertyType,
      address,
      area,
      city,
      pincode,
      monthlyRent,
      securityDeposit,
      leaseStartDate,
      leaseEndDate,
      landlordName,
      landlordPhone,
      landlordEmail,
      agreementUrl,
    } = body;

    if (!title || !monthlyRent || !securityDeposit || !leaseStartDate || !leaseEndDate) {
      return NextResponse.json(
        { error: 'Title, Rent, Deposit, and Lease dates are required' },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        userId,
        title,
        propertyType: propertyType || '1BHK Flat',
        address: address || '',
        area: area || 'Akurdi',
        city: city || 'Pune / PCMC',
        pincode: pincode || '411044',
        monthlyRent: Number(monthlyRent),
        securityDeposit: Number(securityDeposit),
        leaseStartDate: new Date(leaseStartDate),
        leaseEndDate: new Date(leaseEndDate),
        landlordName: landlordName || 'Landlord',
        landlordPhone: landlordPhone || '',
        landlordEmail: landlordEmail || null,
        agreementUrl: agreementUrl || null,
        status: 'MOVE_IN_PENDING',
      },
    });

    // Create initial Move-In draft report
    const count = await prisma.inspectionReport.count();
    const areaPrefix = (area || 'PUN').substring(0, 3).toUpperCase();
    const reportNumber = `DL-IN-${areaPrefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const report = await prisma.inspectionReport.create({
      data: {
        roomId: room.id,
        type: 'MOVE_IN',
        status: 'DRAFT',
        reportNumber,
      },
    });

    // Create in-app notification
    await prisma.notification.create({
      data: {
        userId,
        title: 'Room Registered Successfully',
        message: `${room.title} registered. Begin your move-in walkthrough to document room condition.`,
        type: 'LOCK',
        linkUrl: `/rooms/${room.id}/move-in`,
      },
    });

    return NextResponse.json({ room, report });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
