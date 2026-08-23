import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import zlib from 'zlib';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Ensure the uploads directory exists under public
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    
    // Generate a unique filename using timestamp
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}_${safeName}`;
    const filePath = path.join(uploadsDir, filename);
    
    // Save original file
    await writeFile(filePath, buffer);
    
    // If it's a .glb file, also save a compressed .gz version
    if (file.name.endsWith('.glb')) {
      const compressedBuffer = zlib.gzipSync(buffer);
      await writeFile(`${filePath}.gz`, compressedBuffer);
      
      // Return the compressed version path
      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}.gz`
      });
    }
    
    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
