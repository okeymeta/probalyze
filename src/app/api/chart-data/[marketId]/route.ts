import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chartData } from '@/db/schema';
import { eq, and, gte, lte, asc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  try {
    const { marketId } = await params;
    const { searchParams } = new URL(request.url);

    // Validate marketId
    const parsedMarketId = parseInt(marketId);
    if (!marketId || isNaN(parsedMarketId)) {
      return NextResponse.json(
        { 
          error: 'Valid market ID is required',
          code: 'INVALID_MARKET_ID'
        },
        { status: 400 }
      );
    }

    // Parse query parameters
    const fromTimestamp = searchParams.get('from');
    const toTimestamp = searchParams.get('to');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 100;

    // Build query conditions
    const conditions = [eq(chartData.marketId, parsedMarketId)];

    if (fromTimestamp) {
      conditions.push(gte(chartData.timestamp, fromTimestamp));
    }

    if (toTimestamp) {
      conditions.push(lte(chartData.timestamp, toTimestamp));
    }

    // Execute query with filters
    const query = db
      .select()
      .from(chartData)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(asc(chartData.timestamp))
      .limit(limit);

    const results = await query;

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET chart data error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}