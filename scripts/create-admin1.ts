import { config } from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

// Try to load .env.local, then .env
config({ path: '.env.local' });
config({ path: '.env' });

async function createAdmin1() {
    console.log("🛠️  Creating 'admin1@admin.pl' user...");

    if (!process.env.DATABASE_URL) {
        console.error("❌ Error: DATABASE_URL is not defined.");
        console.error("👉 Run with: npx dotenv -e .env.local -- npx tsx scripts/create-admin1.ts");
        process.exit(1);
    }

    const email = 'admin1@admin.pl';
    const password = 'admin';
    const username = 'admin1';

    try {
        await prisma.$connect();

        // 1. Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log(`⚠️  User ${email} already exists. Deleting to recreate clean...`);
            await prisma.user.delete({ where: { email } });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(`🔑 Generated hash for '${password}': ${hashedPassword.substring(0, 10)}...`);

        // 3. Create user
        const newUser = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                role: 'admin',
                displayName: 'Admin One',
                isFirstLogin: false,
                name: 'Admin One',
                emailVerified: new Date(),
            }
        });

        console.log(`✅ User created: ${newUser.email} (ID: ${newUser.id})`);

        // 4. Verification Check
        console.log("🔍 Verifying immediately...");
        const checkUser = await prisma.user.findUnique({ where: { email } });
        if (!checkUser) throw new Error("User not found after creation!");

        const isMatch = await bcrypt.compare(password, checkUser.password || "");
        if (isMatch) {
            console.log("✅ Verification SUCCESS: Password matches hash in DB.");
        } else {
            console.error("❌ Verification FAILED: Hash mismatch immediately after creation!");
        }

    } catch (e) {
        console.error("❌ Database Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin1();
