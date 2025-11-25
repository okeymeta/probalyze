import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, bets } from '@/db/schema';
import { desc, sql, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const sortBy = searchParams.get('sort') || 'winnings'; // winnings, volume, profit

    // Get all users with their stats
    const allUsers = await db.select().from(users);

    // Calculate additional metrics for each user
    const leaderboardData = await Promise.all(
      allUsers.map(async (user) => {
        // Get user's bets
        const userBets = await db
          .select()
          .from(bets)
          .where(eq(bets.userWallet, user.walletAddress));

        let totalBets = userBets.length;
        let wonBets = 0;
        let lostBets = 0;
        let activeBets = 0;
        let totalInvested = 0;
        let totalReturns = 0;

        for (const bet of userBets) {
          totalInvested += bet.amount;
          
          if (bet.isSettled) {
            totalReturns += bet.actualPayout || 0;
            if ((bet.actualPayout || 0) > bet.amount) {
              wonBets++;
            } else if ((bet.actualPayout || 0) < bet.amount) {
              lostBets++;
            }
          } else {
            activeBets++;
          }
        }

        const profit = totalReturns - totalInvested;
        const winRate = totalBets > 0 ? (wonBets / (wonBets + lostBets || 1)) * 100 : 0;
        const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

        return {
          walletAddress: user.walletAddress,
          balance: user.balance,
          totalVolume: user.totalVolume,
          totalWinnings: user.totalWinnings,
          totalBets,
          wonBets,
          lostBets,
          activeBets,
          profit,
          winRate,
          roi,
          createdAt: user.createdAt
        };
      })
    );

    // Sort based on the requested criteria
    let sortedData = leaderboardData;
    switch (sortBy) {
      case 'volume':
        sortedData = leaderboardData.sort((a, b) => b.totalVolume - a.totalVolume);
        break;
      case 'profit':
        sortedData = leaderboardData.sort((a, b) => b.profit - a.profit);
        break;
      case 'winrate':
        sortedData = leaderboardData.sort((a, b) => b.winRate - a.winRate);
        break;
      case 'bets':
        sortedData = leaderboardData.sort((a, b) => b.totalBets - a.totalBets);
        break;
      case 'winnings':
      default:
        sortedData = leaderboardData.sort((a, b) => b.totalWinnings - a.totalWinnings);
        break;
    }

    // Filter out users with no activity and apply limit
    const activeUsers = sortedData
      .filter(u => u.totalBets > 0 || u.totalVolume > 0)
      .slice(0, limit);

    // Add rank
    const rankedUsers = activeUsers.map((user, index) => ({
      rank: index + 1,
      ...user
    }));

    return NextResponse.json({
      leaderboard: rankedUsers,
      totalTraders: activeUsers.length,
      sortBy
    }, { status: 200 });

  } catch (error) {
    console.error('GET leaderboard error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
