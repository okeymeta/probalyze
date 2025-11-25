import { db } from '@/db';
import { platformStats } from '@/db/schema';

async function main() {
    const samplePlatformStats = [
        {
            totalFeesCollected: 127.50,
            totalVolume: 18750.00,
            totalMarkets: 15,
            totalUsers: 8,
            totalBets: 50,
            poolBalance: 7500.00,
            lastUpdated: new Date().toISOString(),
        }
    ];

    await db.insert(platformStats).values(samplePlatformStats);
    
    console.log('✅ Platform stats seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});