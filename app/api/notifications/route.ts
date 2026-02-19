
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await auth();
    const url = new URL(req.url);
    const forceMock = url.searchParams.get('mock') === 'true';

    // Helper to return success wrapper
    const successResponse = (data: any[], unreadCount: number) => NextResponse.json({ success: true, notifications: data, unreadCount });

    if (forceMock || !session?.user) {
      console.log("🔔 API: Returning empty notifications (Force Mock or Guest)");
      return successResponse([], 0);
    }

    try {
      if (!prisma) throw new Error("Prisma client is undefined");

      const [notifications, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            fromUser: {
              select: {
                id: true,
                displayName: true,
                avatar: true
              }
            }
          }
        }),
        prisma.notification.count({
          where: {
            userId: session.user.id,
            read: false
          }
        })
      ]);

      return successResponse(notifications, unreadCount);

    } catch (dbError) {
      console.error("⚠️ API: Database error:", dbError);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

  } catch (error) {
    console.error("🔥 API: Critical Error:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }
    const userId = session.user.id!;

    const { subscription, isPwaInstalled } = await request.json();

    try {
        await db.savePushSubscription(userId, subscription, isPwaInstalled);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving push subscription:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
