import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const payload = await verifySession();
    if (!payload || !payload.user) {
        return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const habits = await prisma.habit.findMany({
            where: { userId: payload.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                logs: true
            }
        });
        return NextResponse.json({ success: true, data: habits });
    } catch (error) {
        console.error('Error fetching habits:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const payload = await verifySession();
    if (!payload || !payload.user) {
        return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { name, icon, type } = await req.json();
        if (!name) {
            return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
        }

        const habit = await prisma.habit.create({
            data: {
                userId: payload.user.id,
                name,
                icon,
                type: type || 'good',
            },
        });
        return NextResponse.json({ success: true, data: habit });
    } catch (error) {
        console.error('Error creating habit:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
