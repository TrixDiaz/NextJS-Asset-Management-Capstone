import FloorForm from '@/components/forms/floor-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface NewFloorPageProps {
  params: {
    id: string;
  };
}

export default async function NewFloorPage(props: NewFloorPageProps) {
  const id = props.params.id;

  // Fetch building details to show in the heading
  const building = await prisma.building.findUnique({
    where: { id }
  });

  if (!building) {
    notFound();
  }

  return (
    <div className='container mx-auto p-4 md:p-6'>
      <div className='mb-6'>
        <Link href={`/dashboard/inventory/buildings/${id}`}>
          <Button variant='ghost' size='sm' className='mb-4'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to {building.name}
          </Button>
        </Link>
        <h1 className='text-2xl font-bold md:text-3xl'>
          Add New Floor to {building.name}
        </h1>
        <p className='text-muted-foreground'>
          Create a new floor in this building.
        </p>
      </div>

      <div className='mx-auto max-w-2xl'>
        <FloorForm buildingId={id} />
      </div>
    </div>
  );
}
