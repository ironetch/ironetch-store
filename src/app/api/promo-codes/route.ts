import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

export async function GET() {
  try {
    const promoCodes = await stripe.promotionCodes.list({ limit: 100, active: true });
    return NextResponse.json(promoCodes.data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
