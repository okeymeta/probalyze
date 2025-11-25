import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chartData, markets } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, yesPrice, noPrice, timestamp, volume } = body;

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

    if (yesPrice === undefined || yesPrice === null) {
      return NextResponse.json(
        { 
          error: 'Yes price is required',
          code: 'MISSING_YES_PRICE'
        },
        { status: 400 }
      );
    }

    if (noPrice === undefined || noPrice === null) {
      return NextResponse.json(
        { 
          error: 'No price is required',
          code: 'MISSING_NO_PRICE'
        },
        { status: 400 }
      );
    }

    // Validate marketId is a valid integer
    const marketIdInt = parseInt(marketId);
    if (isNaN(marketIdInt)) {
      return NextResponse.json(
        { 
          error: 'Market ID must be a valid integer',
          code: 'INVALID_MARKET_ID'
        },
        { status: 400 }
      );
    }

    // Validate yesPrice is a number between 0 and 1
    const yesPriceFloat = parseFloat(yesPrice);
    if (isNaN(yesPriceFloat) || yesPriceFloat < 0 || yesPriceFloat > 1) {
      return NextResponse.json(
        { 
          error: 'Yes price must be a number between 0 and 1',
          code: 'INVALID_YES_PRICE'
        },
        { status: 400 }
      );
    }

    // Validate noPrice is a number between 0 and 1
    const noPriceFloat = parseFloat(noPrice);
    if (isNaN(noPriceFloat) || noPriceFloat < 0 || noPriceFloat > 1) {
      return NextResponse.json(
        { 
          error: 'No price must be a number between 0 and 1',
          code: 'INVALID_NO_PRICE'
        },
        { status: 400 }
      );
    }

    // Validate volume if provided
    let volumeFloat = 0;
    if (volume !== undefined && volume !== null) {
      volumeFloat = parseFloat(volume);
      if (isNaN(volumeFloat) || volumeFloat < 0) {
        return NextResponse.json(
          { 
            error: 'Volume must be a non-negative number',
            code: 'INVALID_VOLUME'
          },
          { status: 400 }
        );
      }
    }

    // Validate that the market exists
    const market = await db.select()
      .from(markets)
      .where(eq(markets.id, marketIdInt))
      .limit(1);

    if (market.length === 0) {
      return NextResponse.json(
        { 
          error: 'Market not found',
          code: 'MARKET_NOT_FOUND'
        },
        { status: 400 }
      );
    }

    // Create the chart data point
    const newChartData = await db.insert(chartData)
      .values({
        marketId: marketIdInt,
        timestamp: timestamp || new Date().toISOString(),
        yesPrice: yesPriceFloat,
        noPrice: noPriceFloat,
        volume: volumeFloat
      })
      .returning();

    return NextResponse.json(newChartData[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}