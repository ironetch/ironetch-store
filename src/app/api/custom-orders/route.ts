import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'custom-orders.json');

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
      imageDataUrl: body.imageDataUrl, // Base64 data URL of uploaded file
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
    await writeOrders(orders);
    return NextResponse.json(orders[idx]);
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
