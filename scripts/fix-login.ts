import { config } from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

// Try to load .env.local, then .env
config({ path: '.env.local' });
config({ path: '.env' });

async function fixLogin() {
    console.log("🛠️  Starting Login Fix Tool (Admin Account Reset)...");

    // Check if DATABASE_URL is present
    if (!process.env.DATABASE_URL) {
        console.error("❌ Error: DATABASE_URL is not defined.");
        console.error("👉 Tip: Run this script with dotenv-cli if your variables are in a file:");
        console.error("   npx dotenv -e .env.local -- npx tsx scripts/fix-login.ts");
        process.exit(1);
    }

    const email = 'admin@admin.pl';
    // Use argument for password or default to 'admin'
    const newPassword = process.argv[2] || 'admin';

    console.log(`ℹ️  Target User: ${email}`);
    console.log(`ℹ️  New Password: ${newPassword}`);

    try {
        console.log(`🔍 Checking database connection...`);
        // Test connection
        await prisma.$connect();

        const existingUser = await prisma.user.findUnique({ where: { email } });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        if (existingUser) {
            console.log(`👤 Found user: ${existingUser.username} (ID: ${existingUser.id})`);
            console.log(`🔄 Updating password...`);

            await prisma.user.update({
                where: { email },
                data: {
                    password: hashedPassword,
                    // Ensure account is not locked by first login flag if that's an issue
                    // But keep it true if we want them to go through setup?
                    // User said "logowanie nie dziala", let's assume we want to just let them in.
                    // But usually setup is important. Let's keep existing flags unless necessary.
                    // Actually, let's reset sessionVersion to force refresh
                    sessionVersion: { increment: 1 }
                }
            });
            console.log("✅ Password updated in database.");
        } else {
            console.log(`⚠️  User ${email} not found. Creating new admin user...`);
             await prisma.user.create({
                data: {
                    email,
                    username: 'Admin',
                    password: hashedPassword,
                    role: 'admin',
                    displayName: 'Administrator TT',
                    isFirstLogin: false, // Create as ready-to-use
                    name: 'Administrator TT'
                }
            });
            console.log("✅ New Admin user created.");
        }

        // Verify immediately
        console.log("🔍 Verifying login logic...");
        const userCheck = await prisma.user.findUnique({ where: { email } });

        if (!userCheck || !userCheck.password) {
             console.error("❌ Verification failed: User retrieval issue.");
             return;
        }

        const isMatch = await bcrypt.compare(newPassword, userCheck.password);

        if (isMatch) {
            console.log("\n🎉 SUCCESS! Fix applied and verified.");
            console.log("👉 You can now log in with:");
            console.log(`   Email:    ${email}`);
            console.log(`   Password: ${newPassword}`);
        } else {
            console.error("❌ VERIFICATION FAILED: The password hash in the DB does not match the input.");
        }

    } catch (e) {
        console.error("❌ Database Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

fixLogin();
