import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { markets } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate limit parameter
    const limitParam = searchParams.get('limit');
    const limit = limitParam 
      ? Math.min(Math.max(parseInt(limitParam), 1), 50) 
      : 10;

    // Validate limit is a valid number
    if (limitParam && isNaN(parseInt(limitParam))) {
      return NextResponse.json({ 
        error: "Invalid limit parameter",
        code: "INVALID_LIMIT" 
      }, { status: 400 });
    }

    // Query active markets sorted by 24h volume
    const trendingMarkets = await db.select()
      .from(markets)
      .where(eq(markets.status, 'active'))
      .orderBy(desc(markets.volume24h))
      .limit(limit);

    // Return results (empty array if no markets found)
    return NextResponse.json(trendingMarkets, { status: 200 });

  } catch (error) {
    console.error('GET trending markets error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}