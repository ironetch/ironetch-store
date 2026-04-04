import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newOrder = await prisma.order.create({
      data: {
        id: `ord_${Date.now()}`,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        totalPrice: parseFloat(body.totalPrice),
        items: body.items,
        paymentIntentId: body.paymentIntentId || null,
        status: body.status || 'pending'
      }
    });

    return NextResponse.json(newOrder);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
