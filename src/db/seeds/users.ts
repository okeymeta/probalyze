import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        {
            walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
            balance: 324.75,
            totalVolume: 2847.50,
            totalWinnings: 892.30,
            createdAt: new Date('2024-10-15').toISOString(),
            updatedAt: new Date('2025-01-08').toISOString(),
        },
        {
            walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
            balance: 156.20,
            totalVolume: 4523.80,
            totalWinnings: 1247.65,
            createdAt: new Date('2024-11-02').toISOString(),
            updatedAt: new Date('2025-01-09').toISOString(),
        },
        {
            walletAddress: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUXqXV7D5H',
            balance: 45.80,
            totalVolume: 687.25,
            totalWinnings: -87.40,
            createdAt: new Date('2024-12-10').toISOString(),
            updatedAt: new Date('2025-01-10').toISOString(),
        },
        {
            walletAddress: 'FkXN8K9fZ3qNxLWvGHmYp2XdD7RbVc4Tj5Ma8Uw6PqHs',
            balance: 489.50,
            totalVolume: 3214.90,
            totalWinnings: 1385.20,
            createdAt: new Date('2024-10-28').toISOString(),
            updatedAt: new Date('2025-01-11').toISOString(),
        },
        {
            walletAddress: 'HbQw3Vx7YzKpN9RmTc5Jf2LdGsXu8PaE4Mt6WnUi1ZvB',
            balance: 12.35,
            totalVolume: 156.40,
            totalWinnings: -145.75,
            createdAt: new Date('2024-12-22').toISOString(),
            updatedAt: new Date('2025-01-07').toISOString(),
        },
        {
            walletAddress: 'JpLm9Nx8Kw2YrVt5Hc3Bg6Fz4Qd7Ps1Au0Me6WnXi8Uj',
            balance: 278.90,
            totalVolume: 1923.60,
            totalWinnings: 456.85,
            createdAt: new Date('2024-11-18').toISOString(),
            updatedAt: new Date('2025-01-12').toISOString(),
        },
        {
            walletAddress: 'KrTm4Px9Lw8ZsVu2Hd5Cg7Fy6Qe3Rt0Bv1Ne8XoYj9Wk',
            balance: 97.65,
            totalVolume: 3876.45,
            totalWinnings: -52.30,
            createdAt: new Date('2024-11-05').toISOString(),
            updatedAt: new Date('2025-01-09').toISOString(),
        },
        {
            walletAddress: 'MvWn6Qy0Mx1AtVw4Jf8Dh9Gz2Fx5Re7Cw3Oe0ZpYk6Xl',
            balance: 423.15,
            totalVolume: 4789.30,
            totalWinnings: 1124.50,
            createdAt: new Date('2024-10-20').toISOString(),
            updatedAt: new Date('2025-01-11').toISOString(),
        }
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});