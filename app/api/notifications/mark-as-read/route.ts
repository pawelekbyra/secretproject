import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
  }
  const userId = session.user.id!;

  try {
    const { notificationId } = await request.json();

    if (!notificationId || typeof notificationId !== 'string') {
      return NextResponse.json({ success: false, message: 'notificationId is required and must be a string' }, { status: 400 });
    }

    // Security check: Ensure the notification belongs to the user trying to mark it as read.
    const notification = await prisma.notification.findFirst({
        where: {
            id: notificationId,
            userId: userId
        }
    });

    if (!notification) {
        return NextResponse.json({ success: false, message: 'Notification not found or access denied.' }, { status: 404 });
    }

    await prisma.notification.update({
        where: {
            id: notificationId
        },
        data: {
            read: true
        }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
