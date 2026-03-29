import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, price, quantity = 1, metadata = {}, weight = 0, category } = body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: title,
              metadata: { ...metadata, weight: String(weight), category },
            },
            unit_amount: Math.round(price * 100),
          },
          quantity,
        },
      ],
      mode: 'payment',
      allow_promotion_codes: true,
      success_url: `${req.headers.get('origin') || 'http://localhost:3000'}?success=true`,
      cancel_url: `${req.headers.get('origin') || 'http://localhost:3000'}?canceled=true`,
      shipping_address_collection: {
        allowed_countries: ['CA', 'US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 1500, currency: 'cad' },
            display_name: 'Canada Post Expedited Parcel',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 2500, currency: 'cad' },
            display_name: 'Canada Post Xpresspost',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 2 },
            },
          },
        },
      ],
      automatic_tax: { enabled: true },
    });

    return NextResponse.json({ url: session.url, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create session" }, { status: 500 });
  }
}
