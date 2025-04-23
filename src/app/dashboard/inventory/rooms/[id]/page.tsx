'use client';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Calendar, User, Edit, QrCode } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { setEntityNameInStorage } from '@/hooks/use-breadcrumbs';
import Image from 'next/image';

interface RoomDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface DeploymentItem {
  id: string;
  name: string;
  itemType: string;
  subType: string | null;
  unit: string | null;
  deployments: {
    id: string;
    quantity: number;
    serialNumber: string | null;
    date: Date;
    deployedBy: string;
    remarks: string | null;
  }[];
}

interface Room {
  id: string;
  number: string;
  name: string | null;
  type: string | null;
  floor: {
    id: string;
    number: number;
    name: string | null;
    building: {
      id: string;
      name: string;
    };
  };
}

interface Schedule {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  dayOfWeek: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    username: string;
  };
}

export default function RoomDetailPage({ params }: RoomDetailPageProps) {
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const [room, setRoom] = useState<Room | null>(null);
  const [deploymentsByItem, setDeploymentsByItem] = useState<
    Record<string, DeploymentItem>
  >({});
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string>('');
  const [showQrDialog, setShowQrDialog] = useState(false);
  const id = unwrappedParams.id;

  // Helper function to get day name in proper case
  const formatDayOfWeek = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch room data
        const roomResponse = await fetch(`/api/rooms/${id}`);
        if (!roomResponse.ok) {
          if (roomResponse.status === 404) {
            notFound();
          }
          throw new Error('Failed to load room data');
        }
        const roomData = await roomResponse.json();
        setRoom(roomData);

        // Store room name, floor name, and building name in localStorage for breadcrumbs
        const roomName = roomData.name
          ? `Room ${roomData.number} - ${roomData.name}`
          : `Room ${roomData.number}`;
        setEntityNameInStorage('room', id, roomName);

        const floorName = roomData.floor.name
          ? `Floor ${roomData.floor.number} - ${roomData.floor.name}`
          : `Floor ${roomData.floor.number}`;
        setEntityNameInStorage('floor', roomData.floor.id, floorName);

        setEntityNameInStorage(
          'building',
          roomData.floor.building.id,
          roomData.floor.building.name
        );

        // Generate QR code for room URL
        const roomUrl = `${window.location.origin}/dashboard/inventory/rooms/${id}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomUrl)}`;
        setQrCode(qrCodeUrl);

        // Fetch deployments
        const deploymentsResponse = await fetch(`/api/rooms/${id}/deployments`);
        if (deploymentsResponse.ok) {
          const deploymentsData = await deploymentsResponse.json();

          // Group deployments by storage item
          const groupedDeployments: Record<string, DeploymentItem> = {};
          deploymentsData.forEach((deployment: any) => {
            const itemId = deployment.storageItemId;

            if (!groupedDeployments[itemId]) {
              groupedDeployments[itemId] = {
                id: deployment.storageItemId,
                name: deployment.storageItemName,
                itemType: deployment.itemType,
                subType: deployment.subType,
                unit: deployment.unit,
                deployments: []
              };
            }

            groupedDeployments[itemId].deployments.push({
              id: deployment.id,
              quantity: deployment.quantity,
              serialNumber: deployment.serialNumber,
              date: new Date(deployment.date),
              deployedBy: deployment.deployedBy,
              remarks: deployment.remarks
            });
          });

          setDeploymentsByItem(groupedDeployments);
        }

        // Fetch schedules
        const schedulesResponse = await fetch(`/api/rooms/${id}/schedules`);
        if (schedulesResponse.ok) {
          const schedulesData = await schedulesResponse.json();
          setSchedules(schedulesData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading room data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className='container flex min-h-[60vh] items-center justify-center p-6'>
        <p>Loading room details...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className='container flex min-h-[60vh] items-center justify-center p-6'>
        <p>Room not found</p>
      </div>
    );
  }

  return (
    <div className='container p-6'>
      <div className='mb-4 flex items-center'>
        <Link href='/dashboard/inventory/rooms'>
          <Button variant='ghost' size='sm'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Rooms
          </Button>
        </Link>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <div className='md:col-span-1'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-2xl font-bold'>Room Details</CardTitle>
              <div className='flex space-x-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setShowQrDialog(true)}
                >
                  <QrCode className='mr-2 h-4 w-4' />
                  QR Code
                </Button>
                <Link href={`/dashboard/inventory/rooms/${id}/edit`}>
                  <Button size='sm' variant='outline'>
                    <Edit className='mr-2 h-4 w-4' />
                    Edit
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <dl className='space-y-4'>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>
                    Room Number
                  </dt>
                  <dd className='mt-1 text-lg'>{room.number}</dd>
                </div>
                {room.name && (
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Room Name
                    </dt>
                    <dd className='mt-1 text-lg'>{room.name}</dd>
                  </div>
                )}
                <div>
                  <dt className='text-sm font-medium text-gray-500'>
                    Building
                  </dt>
                  <dd className='mt-1'>{room.floor.building.name}</dd>
                </div>
                <div>
                  <dt className='text-sm font-medium text-gray-500'>Floor</dt>
                  <dd className='mt-1'>{`${room.floor.name || `Floor ${room.floor.number}`}`}</dd>
                </div>
                {room.type && (
                  <div>
                    <dt className='text-sm font-medium text-gray-500'>
                      Room Type
                    </dt>
                    <dd className='mt-1'>
                      <Badge variant='outline'>{room.type}</Badge>
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className='md:col-span-2'>
          <Tabs defaultValue='schedules' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='schedules'>
                <Calendar className='mr-2 h-4 w-4' />
                Schedules
              </TabsTrigger>
              <TabsTrigger value='assets'>
                <Package className='mr-2 h-4 w-4' />
                Assets
              </TabsTrigger>
            </TabsList>

            <TabsContent value='schedules'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Calendar className='mr-2 h-5 w-5' />
                    Room Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {schedules.length === 0 ? (
                    <div className='py-4 text-center'>
                      <p className='mb-4 text-gray-500'>
                        No schedules assigned to this room yet
                      </p>
                      <Link href='/dashboard/schedules/new'>
                        <Button>Create Schedule</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {schedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className='flex flex-col justify-between rounded-md border p-3 sm:flex-row'
                        >
                          <div>
                            <h3 className='font-medium'>{schedule.title}</h3>
                            {schedule.description && (
                              <p className='mt-1 text-sm text-gray-500'>
                                {schedule.description}
                              </p>
                            )}
                            <div className='mt-2 flex items-center'>
                              <Badge
                                variant='outline'
                                className='mr-2 capitalize'
                              >
                                {formatDayOfWeek(schedule.dayOfWeek)}
                              </Badge>
                              <span className='text-sm'>
                                {format(new Date(schedule.startTime), 'h:mm a')}{' '}
                                - {format(new Date(schedule.endTime), 'h:mm a')}
                              </span>
                            </div>
                          </div>
                          <div className='mt-2 flex items-center sm:mt-0'>
                            <div className='flex items-center text-sm text-gray-600'>
                              <User className='mr-1 h-3.5 w-3.5' />
                              {schedule.user.firstName && schedule.user.lastName
                                ? `${schedule.user.firstName} ${schedule.user.lastName}`
                                : schedule.user.username}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='assets'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Package className='mr-2 h-5 w-5' />
                    Deployed Assets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(deploymentsByItem).length === 0 ? (
                    <div className='py-4 text-center'>
                      <p className='mb-4 text-gray-500'>
                        No assets deployed to this room yet
                      </p>
                      <Link href='/dashboard/inventory/storage'>
                        <Button>Deploy Assets to Room</Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className='mb-4 flex justify-end'>
                        <Link href='/dashboard/inventory/storage'>
                          <Button>Deploy More Assets</Button>
                        </Link>
                      </div>
                      <div className='space-y-8'>
                        {Object.values(deploymentsByItem).map(
                          (item: DeploymentItem) => (
                            <div
                              key={item.id}
                              className='border-b pb-6 last:border-0'
                            >
                              <h3 className='mb-2 text-lg font-medium'>
                                <Link
                                  href={`/dashboard/inventory/storage/${item.id}`}
                                  className='text-blue-600 hover:underline'
                                >
                                  {item.name}
                                </Link>
                                <span className='ml-2 text-sm text-gray-500'>
                                  {item.itemType}
                                  {item.subType && ` (${item.subType})`}
                                </span>
                              </h3>

                              <div className='mt-3 space-y-4'>
                                {item.deployments.map((deployment) => (
                                  <div
                                    key={deployment.id}
                                    className='bg-muted rounded-md p-3'
                                  >
                                    <div className='mb-2 flex flex-wrap items-center justify-between'>
                                      <span className='font-medium'>
                                        {deployment.quantity}{' '}
                                        {item.unit || 'units'}
                                      </span>
                                      <div className='flex items-center text-sm text-gray-500'>
                                        <Calendar className='mr-1 h-3.5 w-3.5' />
                                        {format(
                                          new Date(deployment.date),
                                          'PPP p'
                                        )}
                                      </div>
                                    </div>

                                    {deployment.serialNumber && (
                                      <div className='my-1 text-sm'>
                                        Serial:{' '}
                                        <Badge variant='outline'>
                                          {deployment.serialNumber}
                                        </Badge>
                                      </div>
                                    )}

                                    <div className='flex items-center text-sm'>
                                      <User className='mr-1 h-3.5 w-3.5' />
                                      Deployed by: {deployment.deployedBy}
                                    </div>

                                    {deployment.remarks && (
                                      <div className='mt-1 text-sm text-gray-600 italic'>
                                        &ldquo;{deployment.remarks}&rdquo;
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className='sm:max-w-[400px]'>
          <DialogHeader>
            <DialogTitle>Room QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code to access information for{' '}
              {room.name || `Room ${room.number}`}.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-center py-6'>
            {qrCode ? (
              <img
                src={qrCode}
                alt={`QR Code for ${room.number}`}
                className='h-64 w-64'
              />
            ) : (
              <div className='bg-muted flex h-64 w-64 items-center justify-center rounded-md border'>
                <p className='text-muted-foreground'>Loading QR code...</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowQrDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
