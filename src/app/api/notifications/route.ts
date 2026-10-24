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

    if (!userId) {
      const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@depositlocker.com' },
      });
      if (demoUser) userId = demoUser.id;
    }

    if (!userId) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ notifications: [] });
  }
}

export async function PATCH(req: NextRequest) {
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

    if (userId) {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
