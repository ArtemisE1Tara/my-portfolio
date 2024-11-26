// api/capture-image/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Create a temporary directory if it doesn't exist
    const tmpDir = path.join(process.cwd(), 'tmp');
    try {
      await fs.mkdir(tmpDir);
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const filename = `capture-${Date.now()}.jpg`;
    const filepath = path.join(tmpDir, filename);

    // Capture image using libcamera-still
    // --immediate: Start capture immediately
    // --nopreview: Disable preview window
    // -o: Output file
    // -t: Timeout (in ms)
    // --width and --height: Set resolution
    await execAsync(`libcamera-still --immediate --nopreview -o ${filepath} -t 100 --width 640 --height 480`);

    // Read the captured image
    const imageBuffer = await fs.readFile(filepath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    // Clean up the temporary file
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