import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bets } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { wallet: string } }
) {
  try {
    const wallet = params.wallet;

    if (!wallet) {
      return NextResponse.json(
        { 
          error: 'Wallet address is required',
          code: 'MISSING_WALLET' 
        },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const userBets = await db
      .select()
      .from(bets)
      .where(eq(bets.userWallet, wallet))
      .orderBy(desc(bets.timestamp))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(userBets, { status: 200 });
  } catch (error) {
    console.error('GET bets by wallet error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}