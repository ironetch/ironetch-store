import { NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

export async function GET() {
  const orders = await readJsonData('custom-orders.json');
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orders = await readJsonData('custom-orders.json');

    const newOrder = {
      id: `custom-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      customerName: body.customerName || 'Guest',
      customerEmail: body.customerEmail || '',
      productId: body.productId,
      productTitle: body.productTitle,
      material: body.material,
      quantity: body.quantity,
      price: body.price,
      imageDataUrl: body.imageDataUrl,
      notes: body.notes || '',
    };

    orders.push(newOrder);
    await writeJsonData('custom-orders.json', orders);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const orders = await readJsonData('custom-orders.json');
    const idx = orders.findIndex((o: any) => o.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();

    let invoiceUrl: string | null = null;

    if (status === 'approved' && orders[idx].customerEmail) {
      try {
        const order = orders[idx];
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
        orders[idx].stripeInvoiceId = finalized.id;
        orders[idx].invoiceUrl = invoiceUrl;
      } catch (stripeErr: any) {
        console.error('Stripe invoice creation failed:', stripeErr.message);
        orders[idx].invoiceError = stripeErr.message;
      }
    }

    await writeJsonData('custom-orders.json', orders);
    return NextResponse.json({ ...orders[idx], invoiceUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const orders = await readJsonData('custom-orders.json');
    const filtered = orders.filter((o: any) => o.id !== id);
    await writeJsonData('custom-orders.json', filtered);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
