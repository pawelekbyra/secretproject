import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');
  const cursor = searchParams.get('cursor') || undefined;
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : 10;

  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!parentId) {
    return NextResponse.json({ success: false, message: 'parentId is required' }, { status: 400 });
  }

  try {
    // We need a new db function to get replies specifically
    const { comments: replies, nextCursor } = await db.getCommentReplies(parentId, { limit, cursor, currentUserId });
    return NextResponse.json({ success: true, replies, nextCursor });
  } catch (error) {
    console.error(`Error fetching replies for parentId ${parentId}:`, error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
