// File: /home/ahmed/code/my-portfolio/app/api/capture-image/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const tmpDir = path.join(process.cwd(), 'tmp');
    await fs.mkdir(tmpDir, { recursive: true });

    const filename = `capture-${Date.now()}.jpg`;
    const filepath = path.join(tmpDir, filename);

    await execAsync(`libcamera-still --immediate --nopreview -o ${filepath} -t 100 --width 1920 --height 1080`);

    const imageBuffer = await fs.readFile(filepath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    await fs.unlink(filepath);

    return NextResponse.json({ image: base64Image });
  } catch (error) {
    console.error('Error capturing image:', error);
    return NextResponse.json({ 
      error: 'Failed to capture image', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}