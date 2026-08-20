import { NextRequest, NextResponse } from 'next/server';
import menuData from '@/data/menu.json';

// GET all dishes
export async function GET() {
  try {
    // Sort by createdAt descending
    const sorted = [...menuData].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return NextResponse.json(sorted);
  } catch (error: any) {
    console.error('Failed to fetch dishes:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dishes' }, { status: 500 });
  }
}

// POST create new dish (Disabled in static JSON mode)
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: 'Database is in read-only static mode on Vercel.' }, { status: 403 });
}
