'use client';

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { setEntityNameInStorage } from '@/hooks/use-breadcrumbs';

interface BuildingDetailPageProps {
  params: {
    id: string;
  };
}

type Building = {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  floors: Floor[];
};

type Floor = {
  id: string;
  number: number;
  name: string | null;
  buildingId: string;
  createdAt: string;
  updatedAt: string;
  rooms: {
    id: string;
    number: string;
    name: string | null;
    type: string;
  }[];
};

export default function BuildingDetailPage({
  params
}: BuildingDetailPageProps) {
  const { id } = params;
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBuildingData = async () => {
      try {
        setLoading(true);
        // Fetch building data with floors and rooms
        const response = await fetch(`/api/buildings/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setLoading(false);
            return; // Will render not found UI
          }
          throw new Error('Failed to fetch building data');
        }

        const buildingData = await response.json();

        // Store building name in localStorage for breadcrumbs
        setEntityNameInStorage('building', id, buildingData.name);

        setBuilding(buildingData);
        setLoading(false);
      } catch (error) {
        console.error('Error in building detail page:', error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
        setLoading(false);
      }
    };

    fetchBuildingData();
  }, [id]);

  if (loading) {
    return <div className='container p-6'>Loading building details...</div>;
  }

  if (error) {
    return <div className='container p-6'>Error: {error.message}</div>;
  }

  if (!building) {
    notFound();
  }

  return (
    <div className='container w-full p-6'>
      <div className='mb-4 flex items-center'>
        <Link href='/dashboard/inventory'>
          <Button variant='ghost' size='sm'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Inventory
          </Button>
        </Link>
      </div>

      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>{building.name}</h1>
          {building.code && (
            <p className='text-muted-foreground'>Code: {building.code}</p>
          )}
          {building.address && (
            <p className='text-muted-foreground'>{building.address}</p>
          )}
        </div>
        <div className='flex gap-2'>
          <Link href={`/dashboard/inventory/buildings/${id}/edit`}>
            <Button variant='outline'>Edit Building</Button>
          </Link>
          <Link href={`/dashboard/inventory/buildings/${id}/floors/new`}>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Floor
            </Button>
          </Link>
        </div>
      </div>

      {building.floors.length === 0 ? (
        <div className='rounded-lg border p-12 text-center'>
          <h3 className='mb-2 text-lg font-medium'>No Floors Added Yet</h3>
          <p className='text-muted-foreground mb-4'>
            Start by adding floors to this building
          </p>
          <Link href={`/dashboard/inventory/buildings/${id}/floors/new`}>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add First Floor
            </Button>
          </Link>
        </div>
      ) : (
        <div className='grid gap-6'>
          {building.floors.map((floor) => (
            <Card key={floor.id} className='dark:border-gray-700'>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle>
                    Floor {floor.number}
                    {floor.name && ` - ${floor.name}`}
                  </CardTitle>
                  <div className='flex gap-2'>
                    <Link
                      href={`/dashboard/inventory/floors/${floor.id}/rooms/new`}
                    >
                      <Button size='sm'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Room
                      </Button>
                    </Link>
                    <Link href={`/dashboard/inventory/floors/${floor.id}`}>
                      <Button variant='outline' size='sm'>
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
                <CardDescription>
                  {floor.rooms.length} room{floor.rooms.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>

              {floor.rooms.length > 0 && (
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    {floor.rooms.map((room) => (
                      <Link
                        href={`/dashboard/inventory/rooms/${room.id}`}
                        key={room.id}
                        className='rounded-md border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                      >
                        <div className='font-medium'>Room {room.number}</div>
                        {room.name && (
                          <div className='text-sm text-gray-500 dark:text-gray-400'>
                            {room.name}
                          </div>
                        )}
                        <div className='mt-1 text-xs text-gray-400 dark:text-gray-500'>
                          {room.type}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
