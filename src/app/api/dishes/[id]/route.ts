import { NextRequest, NextResponse } from 'next/server';
import menuData from '@/data/menu.json';

// GET a single dish
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dish = menuData.find(d => d.id === id);

    if (!dish) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
    }

    return NextResponse.json(dish);
  } catch (error: any) {
    console.error('Failed to fetch dish:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dish' }, { status: 500 });
  }
}

// PUT update a dish (Disabled in static JSON mode)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ error: 'Database is in read-only static mode on Vercel.' }, { status: 403 });
}

// DELETE a dish (Disabled in static JSON mode)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({ error: 'Database is in read-only static mode on Vercel.' }, { status: 403 });
}
