import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only PNG and SVG files are allowed' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 });
    }

    // Ensure uploads directory exists
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    // Generate a unique filename preserving extension
    const ext = file.type === 'image/svg+xml' ? '.svg' : '.png';
    const fileName = `product-${Date.now()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    // Write the file
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    // Return the public URL
    const publicUrl = `/uploads/${fileName}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
