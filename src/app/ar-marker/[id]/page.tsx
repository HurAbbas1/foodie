import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ARMarkerClient from './ARMarkerClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ARMarkerPage({ params }: PageProps) {
  const { id } = await params;
  const dish = await prisma.dish.findUnique({ where: { id } });

  if (!dish || !dish.modelUrl) {
    notFound();
  }

  return (
    <ARMarkerClient
      dishId={dish.id}
      dishName={dish.name}
      modelUrl={dish.modelUrl}
    />
  );
}

export const dynamic = 'force-dynamic';
