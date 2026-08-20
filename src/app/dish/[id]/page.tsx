import { notFound } from 'next/navigation';
import DishMobileView from '@/components/menu/DishMobileView';
import menuData from '@/data/menu.json';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DishPage({ params }: PageProps) {
  const { id } = await params;

  const dish = menuData.find(d => d.id === id);

  if (!dish) {
    notFound();
  }

  return <DishMobileView dish={dish} />;
}
export const dynamic = 'force-dynamic';

