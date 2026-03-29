import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src/data/products.json');

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const fileData = fs.readFileSync(dataPath, 'utf8');
    let products = JSON.parse(fileData);
    
    products = products.map((p: any) => p.id === id ? { ...p, ...body, price: parseFloat(body.price), weight: parseInt(body.weight) || 0, imageUrl: body.imageUrl || "", isCustom: Boolean(body.isCustom) } : p);
    
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const fileData = fs.readFileSync(dataPath, 'utf8');
    let products = JSON.parse(fileData);
    
    products = products.filter((p: any) => p.id !== id);
    
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
