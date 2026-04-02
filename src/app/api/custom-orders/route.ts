import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import Stripe from 'stripe';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'custom-orders.json');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

async function readOrders() {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeOrders(orders: any[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2));
}

export async function GET() {
  const orders = await readOrders();
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orders = await readOrders();

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
    await writeOrders(orders);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const orders = await readOrders();
    const idx = orders.findIndex((o: any) => o.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();

    let invoiceUrl: string | null = null;

    // ── On Approval: create a Stripe Invoice and send it ──────────────────
    if (status === 'approved' && orders[idx].customerEmail) {
      try {
        const order = orders[idx];

        // 1. Find or create a Stripe Customer by email
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

        // 2. Add an invoice item for the custom order
        await stripe.invoiceItems.create({
          customer: customer.id,
          amount: Math.round(order.price * order.quantity * 100), // cents
          currency: 'cad',
          description: `${order.productTitle} (${order.material}) × ${order.quantity} — Custom Logo Order`,
        });

        // 3. Create the invoice with auto-advance and payment link
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

        // 4. Finalize and send — this triggers Stripe's invoice email to customer
        const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
        await stripe.invoices.sendInvoice(invoice.id);

        invoiceUrl = finalized.hosted_invoice_url || null;
        orders[idx].stripeInvoiceId = finalized.id;
        orders[idx].invoiceUrl = invoiceUrl;
      } catch (stripeErr: any) {
        // Don't block the status update if Stripe fails — just log it
        console.error('Stripe invoice creation failed:', stripeErr.message);
        orders[idx].invoiceError = stripeErr.message;
      }
    }

    await writeOrders(orders);
    return NextResponse.json({ ...orders[idx], invoiceUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const orders = await readOrders();
    const filtered = orders.filter((o: any) => o.id !== id);
    await writeOrders(filtered);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
