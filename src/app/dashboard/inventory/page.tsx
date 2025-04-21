import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Define building with related floors and rooms
type Building = {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Floor = {
  id: string;
  number: number;
  name: string | null;
  buildingId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Room = {
  id: string;
  number: string;
  name: string | null;
  type: string;
  floorId: string;
  createdAt: Date;
  updatedAt: Date;
};

type BuildingWithRelations = Building & {
  floors: Array<
    Floor & {
      rooms: Array<Room>;
    }
  >;
};

export default async function InventoryDashboard() {
  try {
    // Fetch all buildings with floors and rooms
    // @ts-ignore - Using type assertion to bypass TypeScript error
    const buildings = (await (prisma.building as any).findMany({
      include: {
        floors: {
          include: {
            rooms: true
          },
          orderBy: {
            number: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })) as BuildingWithRelations[];

    // If there's no data yet, initialize with empty array
    const buildingsData = buildings || [];

    return (
      <div className='h-[calc(100vh-100px)] overflow-y-auto p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>Inventory Management System</h1>
          <div className='flex gap-2'>
            <Link href='/dashboard/inventory/buildings/new'>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Add Building
              </Button>
            </Link>
            <Link href='/dashboard/inventory/storage'>
              <Button variant='outline'>Storage Inventory</Button>
            </Link>
            <Link href='/dashboard/inventory/welcome'>
              <Button variant='secondary'>Help & Guide</Button>
            </Link>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {buildingsData.map((building) => (
            <div
              key={building.id}
              className='overflow-hidden rounded-lg border shadow-sm'
            >
              <div className='bg-primary bg-opacity-50 flex items-center justify-between px-4 py-4'>
                <h2 className='text-xl font-semibold'>{building.name}</h2>
                <Link href={`/dashboard/inventory/buildings/${building.id}`}>
                  <Button variant='ghost' size='sm'>
                    View Details
                  </Button>
                </Link>
              </div>
              <div className='space-y-4 p-4'>
                {building.floors.length === 0 ? (
                  <p className='text-gray-500 italic'>No floors added yet</p>
                ) : (
                  building.floors.map((floor) => (
                    <div key={floor.id} className='space-y-2'>
                      <h3 className='border-b pb-1 text-lg font-medium'>
                        Floor {floor.number} {floor.name && `- ${floor.name}`}
                      </h3>
                      {floor.rooms.length === 0 ? (
                        <p className='text-gray-500 italic'>
                          No rooms added yet
                        </p>
                      ) : (
                        <div className='grid grid-cols-2 gap-2'>
                          {floor.rooms.map((room) => (
                            <Link
                              key={room.id}
                              href={`/dashboard/inventory/rooms/${room.id}`}
                              className='hover:bg-primary/10 block rounded border p-2 transition-colors'
                            >
                              <div className='font-medium'>
                                Room {room.number}
                              </div>
                              {room.name && (
                                <div className='text-sm text-gray-500'>
                                  {room.name}
                                </div>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
                {building.floors.length > 0 && (
                  <Link
                    href={`/dashboard/inventory/buildings/${building.id}/floors/new`}
                  >
                    <Button variant='ghost' size='sm' className='mt-2'>
                      <Plus className='mr-2 h-4 w-4' />
                      Add Floor
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}

          {buildingsData.length === 0 && (
            <div className='col-span-3 rounded-lg border p-12 text-center'>
              <h3 className='mb-2 text-xl font-medium'>No buildings found</h3>
              <p className='mb-4 text-gray-500'>
                Start by adding your first building to the system.
              </p>
              <Link href='/dashboard/inventory/buildings/new'>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Building
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in inventory dashboard:', error);
    return (
      <div className='p-6'>
        <h1 className='mb-6 text-3xl font-bold'>Inventory Management System</h1>
        <div className='rounded-md border border-red-300 bg-red-50 p-4'>
          <p className='text-red-700'>
            There was an error loading the inventory. Please ensure the database
            is properly configured.
          </p>
          <p className='mt-2 text-sm text-red-500'>
            Error details:{' '}
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      </div>
    );
  }
}
