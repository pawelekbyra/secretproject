import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!process.env.ABLY_API_KEY) {
    return NextResponse.json(
      { error: 'Ably is not configured' },
      { status: 503 }
    );
  }

  try {
    const Ably = (await import('ably')).default;
    const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY });
    const token = await ably.auth.createTokenRequest({ clientId: 'ting-tong-client' });
    return NextResponse.json(token);
  } catch (error) {
    console.error('Failed to create Ably token:', error);
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
}
