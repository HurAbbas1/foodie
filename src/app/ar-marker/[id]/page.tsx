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

  // Strip .gz extension so A-Frame gets a plain .glb URL it can parse natively
  const arModelUrl = dish.modelUrl.endsWith('.gz')
    ? dish.modelUrl.slice(0, -3) // removes trailing ".gz"
    : dish.modelUrl;

  return (
    <ARMarkerClient
      dishId={dish.id}
      dishName={dish.name}
      modelUrl={arModelUrl}
    />
  );
}

export const dynamic = 'force-dynamic';
