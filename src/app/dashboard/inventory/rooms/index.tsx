import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Building } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function RoomsIndexPage() {
  try {
    // Get all rooms with their relationships
    const rooms = await prisma.$queryRaw`
            SELECT 
                r.id, 
                r.number, 
                r.name, 
                r."type", 
                f.number as "floorNumber", 
                b.name as "buildingName",
                COUNT(dr.id) as "deploymentCount"
            FROM "Room" r
            JOIN "Floor" f ON r."floorId" = f.id
            JOIN "Building" b ON f."buildingId" = b.id
            LEFT JOIN "DeploymentRecord" dr ON dr."toRoomId" = r.id
            GROUP BY r.id, r.number, r.name, r."type", f.number, b.name
            ORDER BY b.name, f.number, r.number
        `;

    return (
      <div className='container p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>Rooms</h1>
          <Link href='/dashboard/inventory/rooms/new'>
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Add Room
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Building className='mr-2 h-5 w-5' />
              All Rooms
            </CardTitle>
            <CardDescription>
              View and manage all rooms across your buildings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(rooms as any[]).length === 0 ? (
              <div className='py-6 text-center'>
                <p className='mb-4 text-gray-500'>No rooms found</p>
                <Link href='/dashboard/inventory/seed'>
                  <Button variant='outline'>Create Sample Data</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Building</TableHead>
                    <TableHead>Floor</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Deployed Assets</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(rooms as any[]).map((room) => (
                    <TableRow key={room.id}>
                      <TableCell>{room.buildingName}</TableCell>
                      <TableCell>Floor {room.floorNumber}</TableCell>
                      <TableCell>
                        {room.number}
                        {room.name && (
                          <span className='ml-2 text-gray-500'>
                            ({room.name})
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {room.type ? (
                          <Badge variant='outline'>{room.type}</Badge>
                        ) : (
                          <span className='text-gray-500'>-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>
                          {room.deploymentCount}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Link href={`/dashboard/inventory/rooms/${room.id}`}>
                          <Button variant='ghost' size='sm'>
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error loading rooms:', error);
    return (
      <div className='container p-6'>
        <h1 className='mb-6 text-3xl font-bold'>Rooms</h1>
        <div className='rounded-md border border-red-300 bg-red-50 p-4'>
          <p className='text-red-700'>
            There was an error loading the rooms. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
