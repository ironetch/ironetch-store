import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const dataPath = path.join(process.cwd(), 'src/data/users.json');
    let users = [];
    if (fs.existsSync(dataPath)) {
      users = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }

    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));

    return NextResponse.json({ success: true, message: 'User created' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
