import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a single dish from Prisma Postgres
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dish = await prisma.dish.findUnique({
      where: { id },
      include: {
        ingredients: true,
        allergens: true
      }
    });

    if (!dish) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
    }

    return NextResponse.json(dish);
  } catch (error: any) {
    console.error('Failed to fetch dish:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dish' }, { status: 500 });
  }
}

// PUT update a dish in Prisma Postgres
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, category, price, description, calories, modelUrl, usdzUrl, previewUrl, ingredients, allergens } = body;

    const existing = await prisma.dish.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
    }

    // Delete existing relation records to recreate them
    await prisma.ingredient.deleteMany({ where: { dishId: id } });
    await prisma.allergen.deleteMany({ where: { dishId: id } });

    const updatedDish = await prisma.dish.update({
      where: { id },
      data: {
        name,
        category,
        price: price !== undefined ? parseFloat(price) : undefined,
        description,
        calories: calories !== undefined ? (calories ? parseInt(calories) : null) : undefined,
        modelUrl,
        usdzUrl,
        previewUrl,
        ingredients: {
          create: (ingredients || []).map((ing: any) => ({
            name: ing.name,
            quantity: parseFloat(ing.quantity || 0),
            unit: ing.unit || 'g'
          }))
        },
        allergens: {
          create: (allergens || []).map((all: any) => ({
            name: all.name
          }))
        }
      },
      include: {
        ingredients: true,
        allergens: true
      }
    });

    return NextResponse.json(updatedDish);
  } catch (error: any) {
    console.error('Failed to update dish:', error);
    return NextResponse.json({ error: error.message || 'Failed to update dish' }, { status: 500 });
  }
}

// DELETE a dish from Prisma Postgres
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const existing = await prisma.dish.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
    }

    await prisma.dish.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Dish deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete dish:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete dish' }, { status: 500 });
  }
}
