import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src/data/products.json');

export async function GET() {
  const fileData = fs.readFileSync(dataPath, 'utf8');
  return NextResponse.json(JSON.parse(fileData));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fileData = fs.readFileSync(dataPath, 'utf8');
    const products = JSON.parse(fileData);
    
    const newProduct = {
      id: body.title.toLowerCase().replace(/\s+/g, '-'),
      ...body,
      price: parseFloat(body.price),
      weight: parseInt(body.weight) || 0
    };
    
    products.push(newProduct);
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
    
    return NextResponse.json(newProduct);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}
