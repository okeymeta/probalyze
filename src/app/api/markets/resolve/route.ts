import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { markets, bets, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, outcome } = body;

    // Validate required fields
    if (!marketId) {
      return NextResponse.json(
        { 
          error: 'Market ID is required',
          code: 'MISSING_MARKET_ID' 
        },
        { status: 400 }
      );
    }

    if (!outcome || (outcome !== 'yes' && outcome !== 'no')) {
      return NextResponse.json(
        { 
          error: 'Valid outcome is required (yes or no)',
          code: 'INVALID_OUTCOME' 
        },
        { status: 400 }
      );
    }

    // Validate marketId is a valid integer
    const parsedMarketId = parseInt(marketId.toString());
    if (isNaN(parsedMarketId)) {
      return NextResponse.json(
        { 
          error: 'Valid market ID is required',
          code: 'INVALID_MARKET_ID' 
        },
        { status: 400 }
      );
    }

    // Check if market exists
    const existingMarket = await db.select()
      .from(markets)
      .where(eq(markets.id, parsedMarketId))
      .limit(1);

    if (existingMarket.length === 0) {
      return NextResponse.json(
        { 
          error: 'Market not found',
          code: 'MARKET_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const market = existingMarket[0];

    // Check if market is already resolved
    if (market.status === 'resolved') {
      return NextResponse.json(
        { 
          error: 'Market is already resolved',
          code: 'MARKET_ALREADY_RESOLVED' 
        },
        { status: 400 }
      );
    }

    // Update market to resolved status
    const updatedMarket = await db.update(markets)
      .set({
        status: 'resolved',
        outcome: outcome,
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(eq(markets.id, parsedMarketId))
      .returning();

    if (updatedMarket.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update market',
          code: 'UPDATE_FAILED' 
        },
        { status: 500 }
      );
    }

    // Query all unsettled bets for this market
    const unsettledBets = await db.select()
      .from(bets)
      .where(
        and(
          eq(bets.marketId, parsedMarketId),
          eq(bets.isSettled, false)
        )
      );

    let totalBetsSettled = 0;
    let totalPayouts = 0;
    const userWinnings: Record<string, number> = {};

    // Process each bet
    for (const bet of unsettledBets) {
      // Calculate actualPayout based on outcome
      const actualPayout = bet.prediction === outcome ? bet.potentialPayout : 0;
      
      // Update bet to settled
      await db.update(bets)
        .set({
          actualPayout: actualPayout,
          isSettled: true,
          updatedAt: new Date().toISOString()
        })
        .where(eq(bets.id, bet.id));

      totalBetsSettled++;
      totalPayouts += actualPayout;

      // Track user winnings for batch update
      if (actualPayout > 0) {
        if (!userWinnings[bet.userWallet]) {
          userWinnings[bet.userWallet] = 0;
        }
        userWinnings[bet.userWallet] += actualPayout;
      }
    }

    // Update user totalWinnings for all winning users
    for (const [walletAddress, winnings] of Object.entries(userWinnings)) {
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.walletAddress, walletAddress))
        .limit(1);

      if (existingUser.length > 0) {
        const currentWinnings = existingUser[0].totalWinnings || 0;
        await db.update(users)
          .set({
            totalWinnings: currentWinnings + winnings,
            updatedAt: new Date().toISOString()
          })
          .where(eq(users.walletAddress, walletAddress));
      }
    }

    // Return success summary
    return NextResponse.json(
      {
        success: true,
        marketId: parsedMarketId,
        outcome: outcome,
        totalBetsSettled: totalBetsSettled,
        totalPayouts: totalPayouts
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}