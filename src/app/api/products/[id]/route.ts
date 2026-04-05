import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    await prisma.product.update({
      where: { id },
      data: {
        title: body.title,
        price: parseFloat(body.price),
        weight: parseInt(body.weight) || 0,
        stock: parseInt(body.stock) || 0,
        category: body.category,
        description: body.description,
        materials: body.materials ? (Array.isArray(body.materials) ? body.materials : [body.materials]) : [],
        imageUrl: body.imageUrl || "",
        images: Array.isArray(body.images) ? body.images : [],
        isCustom: Boolean(body.isCustom)
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.product.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
