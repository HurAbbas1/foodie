import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { pattString, markerBase64, transparentLogoBase64, transparentFullLogoBase64 } = await request.json();

    if (!pattString || !markerBase64) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const publicDir = path.join(process.cwd(), 'public');

    // 1. Save logo.patt
    fs.writeFileSync(path.join(publicDir, 'logo.patt'), pattString, 'utf-8');

    // 2. Save logo-marker.png (decode base64)
    const base64Data = markerBase64.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(path.join(publicDir, 'logo-marker.png'), Buffer.from(base64Data, 'base64'));

    // 3. Save logo-badge-transparent.png (decode base64) if present
    if (transparentLogoBase64) {
      const base64LogoData = transparentLogoBase64.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(path.join(publicDir, 'logo-badge-transparent.png'), Buffer.from(base64LogoData, 'base64'));
    }

    // 4. Save logo-transparent.png (decode base64) if present
    if (transparentFullLogoBase64) {
      const base64FullLogoData = transparentFullLogoBase64.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(path.join(publicDir, 'logo-transparent.png'), Buffer.from(base64FullLogoData, 'base64'));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving marker files:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
