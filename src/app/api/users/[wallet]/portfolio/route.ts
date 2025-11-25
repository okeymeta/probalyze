import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, bets, markets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { wallet: string } }
) {
  try {
    const walletAddress = params.wallet;

    if (!walletAddress) {
      return NextResponse.json(
        { 
          error: 'Wallet address is required',
          code: 'MISSING_WALLET_ADDRESS' 
        },
        { status: 400 }
      );
    }

    // Get user details by wallet address
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, walletAddress))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const user = userResult[0];

    // Get all bets for this user
    const userBets = await db
      .select({
        id: bets.id,
        marketId: bets.marketId,
        userWallet: bets.userWallet,
        amount: bets.amount,
        prediction: bets.prediction,
        priceAtBet: bets.priceAtBet,
        potentialPayout: bets.potentialPayout,
        actualPayout: bets.actualPayout,
        timestamp: bets.timestamp,
        isSettled: bets.isSettled,
        marketSymbol: markets.symbol,
        marketName: markets.name,
        marketCurrentPrice: markets.currentPrice,
        marketSettlementPrice: markets.settlementPrice,
        marketStatus: markets.status,
        marketExpiryDate: markets.expiryDate
      })
      .from(bets)
      .leftJoin(markets, eq(bets.marketId, markets.id))
      .where(eq(bets.userWallet, walletAddress));

    // Calculate portfolio metrics
    let totalInvested = 0;
    let totalReturns = 0;
    let unrealizedValue = 0;
    let settledBetsCount = 0;
    let activeBetsCount = 0;

    for (const bet of userBets) {
      totalInvested += bet.amount;

      if (bet.isSettled) {
        settledBetsCount++;
        totalReturns += bet.actualPayout || 0;
      } else {
        activeBetsCount++;
        unrealizedValue += bet.potentialPayout || 0;
      }
    }

    const profitLoss = totalReturns - totalInvested;
    const totalBetsCount = userBets.length;

    // Format bets with market details
    const formattedBets = userBets.map(bet => ({
      id: bet.id,
      marketId: bet.marketId,
      userWallet: bet.userWallet,
      amount: bet.amount,
      prediction: bet.prediction,
      priceAtBet: bet.priceAtBet,
      potentialPayout: bet.potentialPayout,
      actualPayout: bet.actualPayout,
      timestamp: bet.timestamp,
      isSettled: bet.isSettled,
      market: {
        symbol: bet.marketSymbol,
        name: bet.marketName,
        currentPrice: bet.marketCurrentPrice,
        settlementPrice: bet.marketSettlementPrice,
        status: bet.marketStatus,
        expiryDate: bet.marketExpiryDate
      }
    }));

    // Construct comprehensive portfolio response
    const portfolio = {
      totalInvested,
      totalReturns,
      unrealizedValue,
      profitLoss,
      totalBets: totalBetsCount,
      activeBets: activeBetsCount,
      settledBets: settledBetsCount
    };

    return NextResponse.json({
      user: {
        walletAddress: user.walletAddress,
        balance: user.balance,
        totalVolume: user.totalVolume,
        totalWinnings: user.totalWinnings
      },
      portfolio,
      bets: formattedBets
    }, { status: 200 });

  } catch (error) {
    console.error('GET portfolio error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}