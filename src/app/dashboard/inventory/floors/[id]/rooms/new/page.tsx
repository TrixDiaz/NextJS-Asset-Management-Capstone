import { prisma } from '@/lib/prisma';
import RoomForm from '@/components/forms/room-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface AddRoomPageProps {
  params: {
    id: string;
  };
}

export default async function AddRoomPage(props: AddRoomPageProps) {
  // Access id from props.params
  const id = props.params.id;

  try {
    // Verify the floor exists
    const floor = await prisma.floor.findUnique({
      where: { id },
      include: {
        building: true
      }
    });

    if (!floor) {
      notFound();
    }

    return (
      <div className='container mx-auto w-full max-w-4xl p-6'>
        <div className='mb-4 flex items-center'>
          <Link href={`/dashboard/inventory/floors/${id}`}>
            <Button variant='ghost' size='sm'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Floor
            </Button>
          </Link>
        </div>

        <div className='mb-6'>
          <h1 className='text-3xl font-bold'>Add Room</h1>
          <p className='text-muted-foreground'>
            Adding room to Floor {floor.number}
            {floor.name && ` - ${floor.name}`} in {floor.building.name}
          </p>
        </div>

        <RoomForm floorId={id} />
      </div>
    );
  } catch (error) {
    console.error('Error in add room page:', error);
    throw error;
  }
}
