import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newId = body.title.toLowerCase().replace(/\s+/g, '-');
    
    const product = await prisma.product.create({
      data: {
        id: newId,
        title: body.title,
        price: parseFloat(body.price),
        weight: parseInt(body.weight) || 0,
        stock: parseInt(body.stock) || 0,
        category: body.category,
        description: body.description,
        materials: body.materials ? (Array.isArray(body.materials) ? body.materials : [body.materials]) : [],
        imageUrl: body.imageUrl || "",
        isCustom: Boolean(body.isCustom)
      }
    });
    
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add product' }, { status: 500 });
  }
}
