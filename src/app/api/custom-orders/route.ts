import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.customOrder.findMany({
      orderBy: { submittedAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newOrder = await prisma.customOrder.create({
      data: {
        id: `custom-${Date.now()}`,
        status: 'pending',
        customerName: body.customerName || 'Guest',
        customerEmail: body.customerEmail || '',
        productId: body.productId,
        productTitle: body.productTitle,
        material: body.material,
        quantity: parseInt(body.quantity),
        price: parseFloat(body.price),
        imageDataUrl: body.imageDataUrl,
        notes: body.notes || ''
      }
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    
    let order = await prisma.customOrder.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    order = await prisma.customOrder.update({
      where: { id },
      data: { status }
    });

    let invoiceUrl: string | null = null;
    let invoiceError: string | null = null;
    let stripeInvoiceId: string | null = null;

    if (status === 'approved' && order.customerEmail) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', { apiVersion: '2025-02-24.acacia' as any });
        const existingCustomers = await stripe.customers.list({ email: order.customerEmail, limit: 1 });
        let customer: Stripe.Customer;
        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
        } else {
          customer = await stripe.customers.create({
            email: order.customerEmail,
            name: order.customerName,
          });
        }

        await stripe.invoiceItems.create({
          customer: customer.id,
          amount: Math.round(order.price * order.quantity * 100),
          currency: 'cad',
          description: `${order.productTitle} (${order.material}) × ${order.quantity} — Custom Logo Order`,
        });

        const invoice = await stripe.invoices.create({
          customer: customer.id,
          collection_method: 'send_invoice',
          days_until_due: 7,
          auto_advance: true,
          custom_fields: [
            { name: 'Order ID', value: order.id },
            { name: 'Material', value: order.material },
          ],
          footer: 'Thank you for choosing IronEtch Laser Works. Your custom logo will be engraved with precision.',
        } as any);

        const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
        await stripe.invoices.sendInvoice(invoice.id);

        invoiceUrl = finalized.hosted_invoice_url || null;
        stripeInvoiceId = finalized.id;
        
      } catch (stripeErr: any) {
        console.error('Stripe invoice creation failed:', stripeErr.message);
        invoiceError = stripeErr.message;
      }
      
      // Update with Stripe info
      order = await prisma.customOrder.update({
        where: { id },
        data: { invoiceUrl, stripeInvoiceId, invoiceError }
      });
    }

    return NextResponse.json({ ...order, invoiceUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.customOrder.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
