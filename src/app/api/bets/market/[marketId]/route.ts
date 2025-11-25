import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bets } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    const { marketId } = params;

    // Validate marketId
    if (!marketId || isNaN(parseInt(marketId))) {
      return NextResponse.json(
        {
          error: 'Valid market ID is required',
          code: 'INVALID_MARKET_ID',
        },
        { status: 400 }
      );
    }

    const parsedMarketId = parseInt(marketId);

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query bets for the specific market with pagination
    const marketBets = await db
      .select()
      .from(bets)
      .where(eq(bets.marketId, parsedMarketId))
      .orderBy(desc(bets.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(marketBets, { status: 200 });
  } catch (error) {
    console.error('GET bets error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}