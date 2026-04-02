import { promises as fs } from 'fs';
import path from 'path';

// Helper to handle reads and writes safely on Vercel (where process.cwd() is read-only)
export async function getFilePath(filename: string): Promise<string> {
  const isVercel = process.env.VERCEL === '1' || process.env.NEXT_PUBLIC_VERCEL_ENV;
  const tmpPath = path.join('/tmp', filename);
  const srcPath = path.join(process.cwd(), 'src', 'data', filename);

  if (isVercel) {
    try {
      // If it already exists in /tmp from a previous write this lambda session, use it
      await fs.access(tmpPath);
      return tmpPath;
    } catch {
      // Otherwise, copy the source file to /tmp first so we can mutate it
      try {
        const data = await fs.readFile(srcPath, 'utf-8');
        await fs.writeFile(tmpPath, data, 'utf-8');
        return tmpPath;
      } catch (e) {
        // Fallback: create empty array in /tmp
        await fs.writeFile(tmpPath, '[]', 'utf-8');
        return tmpPath;
      }
    }
  }

  // Local development: read/write directly to src/data
  return srcPath;
}

export async function readJsonData(filename: string) {
  const filepath = await getFilePath(filename);
  try {
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export async function writeJsonData(filename: string, data: any) {
  const filepath = await getFilePath(filename);
  await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
}
