import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

const markets = sqliteTable('markets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('imageUrl'),
  status: text('status').notNull().default('active'),
  totalYesAmount: real('totalYesAmount').notNull().default(0),
  totalNoAmount: real('totalNoAmount').notNull().default(0),
  yesPrice: real('yesPrice').notNull().default(0.5),
  noPrice: real('noPrice').notNull().default(0.5),
  outcome: text('outcome'),
  createdBy: text('createdBy').notNull(),
  createdAt: text('createdAt').notNull(),
  closesAt: text('closesAt'),
  resolvedAt: text('resolvedAt'),
  category: text('category'),
  volume24h: real('volume24h').notNull().default(0),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const market = await db
      .select()
      .from(markets)
      .where(eq(markets.id, parseInt(id)))
      .limit(1);

    if (market.length === 0) {
      return NextResponse.json(
        { error: 'Market not found', code: 'MARKET_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(market[0], { status: 200 });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      imageUrl,
      status,
      totalYesAmount,
      totalNoAmount,
      yesPrice,
      noPrice,
      outcome,
      closesAt,
      resolvedAt,
      category,
      volume24h,
    } = body;

    const existingMarket = await db
      .select()
      .from(markets)
      .where(eq(markets.id, parseInt(id)))
      .limit(1);

    if (existingMarket.length === 0) {
      return NextResponse.json(
        { error: 'Market not found', code: 'MARKET_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (status !== undefined) updateData.status = status;
    if (totalYesAmount !== undefined) updateData.totalYesAmount = totalYesAmount;
    if (totalNoAmount !== undefined) updateData.totalNoAmount = totalNoAmount;
    if (yesPrice !== undefined) updateData.yesPrice = yesPrice;
    if (noPrice !== undefined) updateData.noPrice = noPrice;
    if (outcome !== undefined) updateData.outcome = outcome;
    if (closesAt !== undefined) updateData.closesAt = closesAt;
    if (resolvedAt !== undefined) updateData.resolvedAt = resolvedAt;
    if (category !== undefined) updateData.category = category;
    if (volume24h !== undefined) updateData.volume24h = volume24h;

    const updated = await db
      .update(markets)
      .set(updateData)
      .where(eq(markets.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update market', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}