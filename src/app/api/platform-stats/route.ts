import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { platformStats } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const stats = await db.select()
      .from(platformStats)
      .limit(1);

    if (stats.length === 0) {
      return NextResponse.json(
        { error: 'Platform stats not found', code: 'STATS_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(stats[0], { status: 200 });
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

    const newStats = await db.insert(platformStats)
      .values({
        totalFeesCollected: body.totalFeesCollected ?? 0,
        totalVolume: body.totalVolume ?? 0,
        totalMarkets: body.totalMarkets ?? 0,
        totalUsers: body.totalUsers ?? 0,
        totalBets: body.totalBets ?? 0,
        poolBalance: body.poolBalance ?? 0,
        lastUpdated: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newStats[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const existingStats = await db.select()
      .from(platformStats)
      .limit(1);

    if (existingStats.length === 0) {
      return NextResponse.json(
        { error: 'Platform stats not found. Create stats first using POST.', code: 'STATS_NOT_FOUND' },
        { status: 404 }
      );
    }

    const statsId = existingStats[0].id;

    const updateData: Record<string, any> = {
      lastUpdated: new Date().toISOString()
    };

    if (body.totalFeesCollected !== undefined) {
      updateData.totalFeesCollected = body.totalFeesCollected;
    }
    if (body.totalVolume !== undefined) {
      updateData.totalVolume = body.totalVolume;
    }
    if (body.totalMarkets !== undefined) {
      updateData.totalMarkets = body.totalMarkets;
    }
    if (body.totalUsers !== undefined) {
      updateData.totalUsers = body.totalUsers;
    }
    if (body.totalBets !== undefined) {
      updateData.totalBets = body.totalBets;
    }
    if (body.poolBalance !== undefined) {
      updateData.poolBalance = body.poolBalance;
    }

    const updated = await db.update(platformStats)
      .set(updateData)
      .where(eq(platformStats.id, statsId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update platform stats', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}