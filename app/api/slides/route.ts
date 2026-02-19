import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/auth';
import { redis } from '@/lib/kv';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = searchParams.has('limit') ? parseInt(searchParams.get('limit')!, 10) : 5;

    const session = await auth();
    const currentUserId = session?.user?.id;

    // Cache only the initial feed (no cursor) to reduce DB load
    const cacheKey = `slides:feed:v2:${limit}:${currentUserId || 'guest'}`;
    if (!cursor) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return NextResponse.json(cached);
        }
      } catch (redisError) {
        console.error('Redis error:', redisError);
      }
    }

    if (!db.getSlides) {
        return NextResponse.json({ error: 'db.getSlides is not a function' }, { status: 500 });
    }

    const slides = await db.getSlides({ limit, cursor, currentUserId });

    let nextCursor: string | null = null;
    if (slides.length === limit) {
      const lastSlide = slides[slides.length - 1];
      // Store timestamp as cursor for consistency
      nextCursor = new Date(lastSlide.createdAt).getTime().toString();
    }

    const responseData = {
      slides,
      nextCursor,
    };

    if (!cursor) {
      try {
        await redis.set(cacheKey, responseData, { ex: 60 }); // Cache for 60 seconds
      } catch (redisError) {
        console.error('Redis set error:', redisError);
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Failed to fetch slides:', error);
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
  }
}
