import BuildingForm from '@/components/forms/building-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface EditBuildingPageProps {
  params: {
    id: string;
  };
}

export default async function EditBuildingPage({
  params
}: EditBuildingPageProps) {
  const { id } = params;

  // Fetch building details for pre-filling the form
  const building = await prisma.building.findUnique({
    where: { id }
  });

  if (!building) {
    notFound();
  }

  // Convert to the format expected by BuildingForm
  const formData = {
    name: building.name,
    code: building.code || undefined,
    address: building.address || undefined
  };

  return (
    <div className='container mx-auto p-4 md:p-6'>
      <div className='mb-6'>
        <Link href={`/dashboard/inventory/buildings/${id}`}>
          <Button variant='ghost' size='sm' className='mb-4'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to {building.name}
          </Button>
        </Link>
        <h1 className='text-2xl font-bold md:text-3xl'>Edit Building</h1>
        <p className='text-muted-foreground'>
          Update the building information.
        </p>
      </div>

      <div className='mx-auto max-w-2xl'>
        <BuildingForm initialData={formData} />
      </div>
    </div>
  );
}
