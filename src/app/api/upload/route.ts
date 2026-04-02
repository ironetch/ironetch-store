import { NextResponse } from 'next/server';

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

    // Convert the file directly to a Base64 Data URL
    // This avoids writing to the Vercel serverless read-only filesystem (/var/task/public)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Str = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Str}`;

    // Return the data URL. In a full production app, this should be swapped out 
    // for Vercel Blob, AWS S3, or Cloudinary.
    return NextResponse.json({ url: dataUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
