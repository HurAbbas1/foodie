import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a single dish
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
        allergens: true,
      },
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

// PUT update a dish
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      category,
      price,
      description,
      calories,
      modelUrl,
      usdzUrl,
      previewUrl,
      ingredients = [],
      allergens = [],
    } = body;

    // Check if dish exists
    const existingDish = await prisma.dish.findUnique({ where: { id } });
    if (!existingDish) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
    }

    // Run clean delete and update in a transaction
    const updatedDish = await prisma.$transaction(async (tx) => {
      // Delete existing ingredients and allergens
      await tx.ingredient.deleteMany({ where: { dishId: id } });
      await tx.allergen.deleteMany({ where: { dishId: id } });

      // Update dish details and insert new ingredients and allergens
      return await tx.dish.update({
        where: { id },
        data: {
          name,
          category,
          price: parseFloat(price),
          description,
          calories: calories ? parseInt(calories, 10) : null,
          modelUrl,
          usdzUrl,
          previewUrl,
          ingredients: {
            create: ingredients.map((ing: any) => ({
              name: ing.name,
              quantity: parseFloat(ing.quantity) || 0,
              unit: ing.unit,
            })),
          },
          allergens: {
            create: allergens.map((name: string) => ({
              name,
            })),
          },
        },
        include: {
          ingredients: true,
          allergens: true,
        },
      });
    });

    return NextResponse.json(updatedDish);
  } catch (error: any) {
    console.error('Failed to update dish:', error);
    return NextResponse.json({ error: error.message || 'Failed to update dish' }, { status: 500 });
  }
}

// DELETE a dish
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if dish exists
    const existingDish = await prisma.dish.findUnique({ where: { id } });
    if (!existingDish) {
      return NextResponse.json({ error: 'Dish not found' }, { status: 404 });
    }

    // The cascade delete is defined at database schema level,
    // so deleting the dish will automatically delete ingredients and allergens.
    await prisma.dish.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Dish deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete dish:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete dish' }, { status: 500 });
  }
}
