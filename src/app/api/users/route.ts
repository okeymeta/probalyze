import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(users);

    if (search) {
      query = query.where(
        like(users.walletAddress, `%${search}%`)
      );
    }

    const results = await query
      .orderBy(desc(users.createdAt))
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
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'walletAddress is required', code: 'MISSING_WALLET_ADDRESS' },
        { status: 400 }
      );
    }

    const trimmedWalletAddress = walletAddress.trim();

    if (!trimmedWalletAddress) {
      return NextResponse.json(
        { error: 'walletAddress cannot be empty', code: 'EMPTY_WALLET_ADDRESS' },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, trimmedWalletAddress))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Wallet address already exists', code: 'DUPLICATE_WALLET_ADDRESS' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newUser = await db
      .insert(users)
      .values({
        walletAddress: trimmedWalletAddress,
        balance: 0,
        totalVolume: 0,
        totalWinnings: 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newUser[0], { status: 201 });
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
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required', code: 'MISSING_WALLET_ADDRESS' },
        { status: 400 }
      );
    }

    const trimmedWallet = wallet.trim();

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, trimmedWallet))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { balance, totalVolume, totalWinnings } = body;

    const updates: {
      balance?: number;
      totalVolume?: number;
      totalWinnings?: number;
      updatedAt: string;
    } = {
      updatedAt: new Date().toISOString(),
    };

    if (balance !== undefined) {
      if (typeof balance !== 'number' || balance < 0) {
        return NextResponse.json(
          { error: 'balance must be a non-negative number', code: 'INVALID_BALANCE' },
          { status: 400 }
        );
      }
      updates.balance = balance;
    }

    if (totalVolume !== undefined) {
      if (typeof totalVolume !== 'number' || totalVolume < 0) {
        return NextResponse.json(
          { error: 'totalVolume must be a non-negative number', code: 'INVALID_TOTAL_VOLUME' },
          { status: 400 }
        );
      }
      updates.totalVolume = totalVolume;
    }

    if (totalWinnings !== undefined) {
      if (typeof totalWinnings !== 'number' || totalWinnings < 0) {
        return NextResponse.json(
          { error: 'totalWinnings must be a non-negative number', code: 'INVALID_TOTAL_WINNINGS' },
          { status: 400 }
        );
      }
      updates.totalWinnings = totalWinnings;
    }

    const updated = await db
      .update(users)
      .set(updates)
      .where(eq(users.walletAddress, trimmedWallet))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}