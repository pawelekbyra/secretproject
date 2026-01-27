import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { login, password } = body;

    const logs: string[] = [];
    logs.push(`Attempting debug login for: '${login}'`);

    if (!login || !password) {
        return NextResponse.json({ success: false, message: 'Missing credentials', logs });
    }

    const normalizedLogin = login.trim();
    logs.push(`Normalized login: '${normalizedLogin}'`);

    let user = null;
    if (normalizedLogin.includes('@')) {
        logs.push('Searching by EMAIL...');
        user = await prisma.user.findUnique({ where: { email: normalizedLogin } });
    } else {
        logs.push('Searching by USERNAME...');
        user = await prisma.user.findUnique({ where: { username: normalizedLogin } });
    }

    if (!user) {
        logs.push('❌ User NOT FOUND in database.');
        // Try to help user by finding close matches or listing users (limited)
        // const allUsers = await prisma.user.findMany({ select: { email: true, username: true }, take: 5 });
        // logs.push(`Available users (hint): ${JSON.stringify(allUsers)}`);
        return NextResponse.json({ success: false, message: 'User not found', logs });
    }

    logs.push(`✅ User found: ID=${user.id}, Email=${user.email}, Username=${user.username}`);
    logs.push(`User Role: ${user.role}`);
    logs.push(`DB Password Hash exists: ${!!user.password}`);

    if (!user.password) {
         logs.push('❌ User has NO PASSWORD set in DB.');
         return NextResponse.json({ success: false, message: 'No password set', logs });
    }

    logs.push(`Comparing provided password with stored hash...`);
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        logs.push('✅ Password MATCHES!');
        return NextResponse.json({ success: true, message: 'Credentials valid', logs, user: { id: user.id, username: user.username } });
    } else {
        logs.push('❌ Password DOES NOT MATCH.');
        // Debug info about hash (safe to show in debug endpoint, but risky in prod - use with caution)
        logs.push(`Stored hash prefix: ${user.password.substring(0, 10)}...`);
        return NextResponse.json({ success: false, message: 'Invalid password', logs });
    }

  } catch (error: any) {
    console.error("Debug Login Error:", error);
    return NextResponse.json({ success: false, message: 'Server error', error: error.message });
  }
}
