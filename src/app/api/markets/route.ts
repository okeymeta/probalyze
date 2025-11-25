import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';

// Define markets table schema
const markets = sqliteTable('markets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('imageUrl'),
  status: text('status').default('active'),
  totalYesAmount: real('totalYesAmount').default(0),
  totalNoAmount: real('totalNoAmount').default(0),
  yesPrice: real('yesPrice').default(0.5),
  noPrice: real('noPrice').default(0.5),
  outcome: text('outcome'),
  createdBy: text('createdBy').notNull(),
  createdAt: text('createdAt'),
  closesAt: text('closesAt'),
  resolvedAt: text('resolvedAt'),
  category: text('category'),
  volume24h: real('volume24h').default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single market by ID
    if (id) {
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
          { error: 'Market not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(market[0], { status: 200 });
    }

    // List markets with filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const sortField = searchParams.get('sort') ?? 'createdAt';
    const sortOrder = searchParams.get('order') ?? 'desc';

    let query = db.select().from(markets);

    // Build WHERE conditions
    const conditions = [];

    if (search) {
      conditions.push(like(markets.title, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(markets.status, status));
    }

    if (category) {
      conditions.push(eq(markets.category, category));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = {
      title: markets.title,
      status: markets.status,
      category: markets.category,
      createdAt: markets.createdAt,
      closesAt: markets.closesAt,
      volume24h: markets.volume24h,
      totalYesAmount: markets.totalYesAmount,
      totalNoAmount: markets.totalNoAmount,
    }[sortField] ?? markets.createdAt;

    query = sortOrder === 'asc' 
      ? query.orderBy(asc(sortColumn))
      : query.orderBy(desc(sortColumn));

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

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
    const { title, createdBy, description, imageUrl, status, closesAt, category } = body;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!createdBy || typeof createdBy !== 'string' || createdBy.trim().length === 0) {
      return NextResponse.json(
        { error: 'CreatedBy is required and must be a non-empty string', code: 'MISSING_CREATED_BY' },
        { status: 400 }
      );
    }

    // Prepare insert data with defaults
    const insertData: any = {
      title: title.trim(),
      createdBy: createdBy.trim(),
      createdAt: new Date().toISOString(),
      status: status && typeof status === 'string' ? status.trim() : 'active',
      totalYesAmount: 0,
      totalNoAmount: 0,
      yesPrice: 0.5,
      noPrice: 0.5,
      volume24h: 0,
    };

    // Add optional fields if provided
    if (description && typeof description === 'string') {
      insertData.description = description.trim();
    }

    if (imageUrl && typeof imageUrl === 'string') {
      insertData.imageUrl = imageUrl.trim();
    }

    if (closesAt && typeof closesAt === 'string') {
      insertData.closesAt = closesAt;
    }

    if (category && typeof category === 'string') {
      insertData.category = category.trim();
    }

    // Insert market
    const newMarket = await db
      .insert(markets)
      .values(insertData)
      .returning();

    return NextResponse.json(newMarket[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if market exists
    const existing = await db
      .select()
      .from(markets)
      .where(eq(markets.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Market not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete market
    const deleted = await db
      .delete(markets)
      .where(eq(markets.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Market deleted successfully',
        market: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}