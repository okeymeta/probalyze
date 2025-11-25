import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bets } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const marketId = searchParams.get('marketId');
    const userWallet = searchParams.get('userWallet');
    const settled = searchParams.get('settled');

    let query = db.select().from(bets);

    const conditions = [];

    if (marketId) {
      const marketIdInt = parseInt(marketId);
      if (isNaN(marketIdInt)) {
        return NextResponse.json(
          { error: 'Invalid marketId parameter', code: 'INVALID_MARKET_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(bets.marketId, marketIdInt));
    }

    if (userWallet) {
      conditions.push(eq(bets.userWallet, userWallet));
    }

    if (settled !== null && settled !== undefined) {
      const isSettled = settled === 'true';
      conditions.push(eq(bets.isSettled, isSettled));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(bets.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      marketId,
      userWallet,
      amount,
      prediction,
      priceAtBet,
      potentialPayout,
      platformFee,
      transactionSignature
    } = body;

    // Validate required fields
    if (!marketId) {
      return NextResponse.json(
        { error: 'marketId is required', code: 'MISSING_MARKET_ID' },
        { status: 400 }
      );
    }

    if (!userWallet || typeof userWallet !== 'string' || userWallet.trim() === '') {
      return NextResponse.json(
        { error: 'userWallet is required', code: 'MISSING_USER_WALLET' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    if (!prediction) {
      return NextResponse.json(
        { error: 'prediction is required', code: 'MISSING_PREDICTION' },
        { status: 400 }
      );
    }

    if (priceAtBet === undefined || priceAtBet === null) {
      return NextResponse.json(
        { error: 'priceAtBet is required', code: 'MISSING_PRICE_AT_BET' },
        { status: 400 }
      );
    }

    if (potentialPayout === undefined || potentialPayout === null) {
      return NextResponse.json(
        { error: 'potentialPayout is required', code: 'MISSING_POTENTIAL_PAYOUT' },
        { status: 400 }
      );
    }

    if (platformFee === undefined || platformFee === null) {
      return NextResponse.json(
        { error: 'platformFee is required', code: 'MISSING_PLATFORM_FEE' },
        { status: 400 }
      );
    }

    // Validate amount > 0
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'amount must be greater than 0', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate prediction is 'yes' or 'no'
    const predictionLower = prediction.toLowerCase().trim();
    if (predictionLower !== 'yes' && predictionLower !== 'no') {
      return NextResponse.json(
        { error: 'prediction must be "yes" or "no"', code: 'INVALID_PREDICTION' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    const priceAtBetNum = parseFloat(priceAtBet);
    const potentialPayoutNum = parseFloat(potentialPayout);
    const platformFeeNum = parseFloat(platformFee);

    if (isNaN(priceAtBetNum)) {
      return NextResponse.json(
        { error: 'priceAtBet must be a valid number', code: 'INVALID_PRICE_AT_BET' },
        { status: 400 }
      );
    }

    if (isNaN(potentialPayoutNum)) {
      return NextResponse.json(
        { error: 'potentialPayout must be a valid number', code: 'INVALID_POTENTIAL_PAYOUT' },
        { status: 400 }
      );
    }

    if (isNaN(platformFeeNum)) {
      return NextResponse.json(
        { error: 'platformFee must be a valid number', code: 'INVALID_PLATFORM_FEE' },
        { status: 400 }
      );
    }

    // Validate marketId is valid integer
    const marketIdInt = parseInt(marketId);
    if (isNaN(marketIdInt)) {
      return NextResponse.json(
        { error: 'marketId must be a valid integer', code: 'INVALID_MARKET_ID' },
        { status: 400 }
      );
    }

    // Create new bet
    const newBet = await db
      .insert(bets)
      .values({
        marketId: marketIdInt,
        userWallet: userWallet.trim(),
        amount: amountNum,
        prediction: predictionLower,
        priceAtBet: priceAtBetNum,
        potentialPayout: potentialPayoutNum,
        actualPayout: 0,
        platformFee: platformFeeNum,
        transactionSignature: transactionSignature?.trim() || null,
        timestamp: new Date().toISOString(),
        isSettled: false
      })
      .returning();

    return NextResponse.json(newBet[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}