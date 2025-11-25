import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { wallet: string } }
) {
  try {
    const { wallet } = params;

    if (!wallet || wallet.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Valid wallet address is required',
          code: 'INVALID_WALLET_ADDRESS' 
        },
        { status: 400 }
      );
    }

    const user = await db.select()
      .from(users)
      .where(eq(users.walletAddress, wallet))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(user[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}