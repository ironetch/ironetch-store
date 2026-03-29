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

export async function POST(req: Request) {
  try {
    const { code, amount_off, percent_off } = await req.json();

    const couponParams: any = {
      duration: 'once',
    };
    
    if (percent_off) {
      couponParams.percent_off = parseFloat(percent_off);
    } else if (amount_off) {
      couponParams.amount_off = Math.round(parseFloat(amount_off) * 100);
      couponParams.currency = 'cad';
    } else {
       return NextResponse.json({ error: "Must provide amount_off or percent_off" }, { status: 400 });
    }

    const coupon = await stripe.coupons.create(couponParams);
    
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: code.toUpperCase()
    } as any);

    return NextResponse.json(promoCode);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
