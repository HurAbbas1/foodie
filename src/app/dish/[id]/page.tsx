import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import DishMobileView from '@/components/menu/DishMobileView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DishPage({ params }: PageProps) {
  const { id } = await params;

  const dish = await prisma.dish.findUnique({
    where: { id },
    include: {
      ingredients: true,
      allergens: true,
    },
  });

  if (!dish) {
    notFound();
  }

  // Cast type to match client Dish expected format
  const formattedDish = {
    ...dish,
    ingredients: dish.ingredients.map(ing => ({
      id: ing.id,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit
    })),
    allergens: dish.allergens.map(alg => ({
      id: alg.id,
      name: alg.name
    }))
  };

  return <DishMobileView dish={formattedDish} />;
}
export const dynamic = 'force-dynamic';
