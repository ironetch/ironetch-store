import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', { apiVersion: '2025-02-24.acacia' as any });

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const localProducts = await prisma.product.findMany();

    for (const item of items) {
      const product = localProducts.find((p: any) => p.id === item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product ${item.title} not found in database.` }, { status: 404 });
      }
      if (item.quantity > product.stock) {
        return NextResponse.json({ error: `Not enough stock for ${item.title}. Only ${product.stock} remaining.` }, { status: 400 });
      }
    }

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'cad',
        product_data: {
          name: item.title,
          metadata: { material: item.material || '', weight: String(item.weight || 0) },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
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
