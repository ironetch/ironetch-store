import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src/data/orders.json');

export async function GET() {
  try {
    const fileData = fs.readFileSync(dataPath, 'utf8');
    return NextResponse.json(JSON.parse(fileData));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
