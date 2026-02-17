import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = await verifySession();
    if (!payload || !payload.user) {
        return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { id } = params;
        const logs = await prisma.habitLog.findMany({
            where: { habitId: id },
            orderBy: { date: 'asc' },
        });
        return NextResponse.json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const payload = await verifySession();
    if (!payload || !payload.user) {
        return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { id } = params;
        const { date, isSuccess } = await req.json();

        if (!date) {
            return NextResponse.json({ success: false, message: 'Date is required' }, { status: 400 });
        }

        // Normalize date to midnight UTC for storage (ensuring YYYY-MM-DD format)
        const dateOnly = typeof date === 'string' ? date.substring(0, 10) : new Date(date).toISOString().substring(0, 10);
        const normalizedDate = new Date(`${dateOnly}T00:00:00.000Z`);

        // Verify habit ownership
        const habit = await prisma.habit.findUnique({
            where: { id },
        });

        if (!habit || habit.userId !== payload.user.id) {
            return NextResponse.json({ success: false, message: 'Habit not found' }, { status: 404 });
        }

        if (isSuccess === null) {
            // Delete log if status is null (None)
            await prisma.habitLog.deleteMany({
                where: {
                    habitId: id,
                    date: normalizedDate,
                },
            });
            return NextResponse.json({ success: true, data: null });
        }

        const log = await prisma.habitLog.upsert({
            where: {
                habitId_date: {
                    habitId: id,
                    date: normalizedDate,
                },
            },
            update: {
                isSuccess,
            },
            create: {
                habitId: id,
                date: normalizedDate,
                isSuccess,
            },
        });

        return NextResponse.json({ success: true, data: log });
    } catch (error) {
        console.error('Error upserting log:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
