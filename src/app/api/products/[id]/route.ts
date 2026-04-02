import { NextResponse } from 'next/server';
import { readJsonData, writeJsonData } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    let products = await readJsonData('products.json');
    
    products = products.map((p: any) => p.id === id ? { ...p, ...body, price: parseFloat(body.price), weight: parseInt(body.weight) || 0, stock: parseInt(body.stock) || 0, imageUrl: body.imageUrl || "", isCustom: Boolean(body.isCustom) } : p);
    
    await writeJsonData('products.json', products);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    let products = await readJsonData('products.json');
    
    products = products.filter((p: any) => p.id !== id);
    
    await writeJsonData('products.json', products);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
