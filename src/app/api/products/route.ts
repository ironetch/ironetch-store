import { NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await readJsonData('products.json');
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const products = await readJsonData('products.json');
    
    const newProduct = {
      id: body.title.toLowerCase().replace(/\s+/g, '-'),
      ...body,
      price: parseFloat(body.price),
      weight: parseInt(body.weight) || 0,
      stock: parseInt(body.stock) || 0,
      imageUrl: body.imageUrl || "",
      isCustom: Boolean(body.isCustom)
    };
    
    products.push(newProduct);
    await writeJsonData('products.json', products);
    
    return NextResponse.json(newProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add product' }, { status: 500 });
  }
}
