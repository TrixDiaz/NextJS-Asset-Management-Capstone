import FloorForm from '@/components/forms/floor-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface EditFloorPageProps {
  params: {
    id: string;
  };
}

export default async function EditFloorPage({ params }: EditFloorPageProps) {
  const { id } = params;

  // Fetch floor details for pre-filling the form
  const floor = await prisma.floor.findUnique({
    where: { id },
    include: {
      building: true
    }
  });

  if (!floor) {
    notFound();
  }

  // Convert to format expected by FloorForm
  const formData = {
    number: floor.number,
    name: floor.name || '',
    buildingId: floor.buildingId
  };

  return (
    <div className='container mx-auto p-4 md:p-6'>
      <div className='mb-6'>
        <Link href={`/dashboard/inventory/floors/${id}`}>
          <Button variant='ghost' size='sm' className='mb-4'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Floor {floor.number}
          </Button>
        </Link>
        <h1 className='text-2xl font-bold md:text-3xl'>Edit Floor</h1>
        <p className='text-muted-foreground'>
          Update floor information for {floor.building.name}.
        </p>
      </div>

      <div className='mx-auto max-w-2xl'>
        <FloorForm initialData={formData} />
      </div>
    </div>
  );
}
