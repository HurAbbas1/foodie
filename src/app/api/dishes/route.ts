import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all dishes
export async function GET() {
  try {
    const dishes = await prisma.dish.findMany({
      include: {
        ingredients: true,
        allergens: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(dishes);
  } catch (error: any) {
    console.error('Failed to fetch dishes:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dishes' }, { status: 500 });
  }
}

// POST create new dish
export async function POST(req: NextRequest) {
  try {
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

    if (!name || !category || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dish = await prisma.dish.create({
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

    return NextResponse.json(dish, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create dish:', error);
    return NextResponse.json({ error: error.message || 'Failed to create dish' }, { status: 500 });
  }
}
