import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.join(process.cwd(), 'src/data/orders.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const filePath = path.join(process.cwd(), 'src/data/orders.json');
    let orders: any[] = [];
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      orders = JSON.parse(data);
    } catch {}

    const newOrder = {
      id: `ord_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...body
    };

    orders.push(newOrder);
    
    // Attempt write, but don't crash if Vercel serverless environment is read-only
    try {
      await fs.writeFile(filePath, JSON.stringify(orders, null, 2));
    } catch (e) {
      console.warn('Could not write orders.json in this environment');
    }

    return NextResponse.json(newOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
