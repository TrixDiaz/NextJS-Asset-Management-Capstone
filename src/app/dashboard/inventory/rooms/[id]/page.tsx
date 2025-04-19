"use client";

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Calendar, User, Edit, QrCode } from 'lucide-react';
import { notFound } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setEntityNameInStorage } from '@/hooks/use-breadcrumbs';

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
        }
    }
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
    const [ room, setRoom ] = useState<Room | null>(null);
    const [ deploymentsByItem, setDeploymentsByItem ] = useState<Record<string, DeploymentItem>>({});
    const [ schedules, setSchedules ] = useState<Schedule[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ qrCode, setQrCode ] = useState<string>('');
    const [ showQrDialog, setShowQrDialog ] = useState(false);
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

                setEntityNameInStorage('building', roomData.floor.building.id, roomData.floor.building.name);

                // Generate QR code
                const qrData = {
                    id: roomData.id,
                    name: roomData.name,
                    number: roomData.number,
                    floor: roomData.floor.number,
                    building: roomData.floor.building.name
                };

                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`;
                setQrCode(qrCodeUrl);

                // Fetch deployments
                const deploymentsResponse = await fetch(`/api/rooms/${id}/deployments`);
                if (deploymentsResponse.ok) {
                    const deploymentsData = await deploymentsResponse.json();

                    // Group deployments by storage item
                    const groupedDeployments: Record<string, DeploymentItem> = {};
                    deploymentsData.forEach((deployment: any) => {
                        const itemId = deployment.storageItemId;

                        if (!groupedDeployments[ itemId ]) {
                            groupedDeployments[ itemId ] = {
                                id: deployment.storageItemId,
                                name: deployment.storageItemName,
                                itemType: deployment.itemType,
                                subType: deployment.subType,
                                unit: deployment.unit,
                                deployments: []
                            };
                        }

                        groupedDeployments[ itemId ].deployments.push({
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
                console.error("Error loading room data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [ id ]);

    if (loading) {
        return (
            <div className="container p-6 flex justify-center items-center min-h-[60vh]">
                <p>Loading room details...</p>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="container p-6 flex justify-center items-center min-h-[60vh]">
                <p>Room not found</p>
            </div>
        );
    }

    return (
        <div className="container p-6">
            <div className="flex items-center mb-4">
                <Link href="/dashboard/inventory/rooms">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Rooms
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-2xl font-bold">Room Details</CardTitle>
                            <div className="flex space-x-2">
                                <Button size="sm" variant="outline" onClick={() => setShowQrDialog(true)}>
                                    <QrCode className="h-4 w-4 mr-2" />
                                    QR Code
                                </Button>
                                <Link href={`/dashboard/inventory/rooms/${id}/edit`}>
                                    <Button size="sm" variant="outline">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <dl className="space-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Room Number</dt>
                                    <dd className="mt-1 text-lg">{room.number}</dd>
                                </div>
                                {room.name && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Room Name</dt>
                                        <dd className="mt-1 text-lg">{room.name}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Building</dt>
                                    <dd className="mt-1">{room.floor.building.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Floor</dt>
                                    <dd className="mt-1">{`${room.floor.name || `Floor ${room.floor.number}`}`}</dd>
                                </div>
                                {room.type && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Room Type</dt>
                                        <dd className="mt-1">
                                            <Badge variant="outline">{room.type}</Badge>
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Tabs defaultValue="schedules" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="schedules">
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedules
                            </TabsTrigger>
                            <TabsTrigger value="assets">
                                <Package className="h-4 w-4 mr-2" />
                                Assets
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="schedules">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Calendar className="h-5 w-5 mr-2" />
                                        Room Schedule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {schedules.length === 0 ? (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500 mb-4">No schedules assigned to this room yet</p>
                                            <Link href="/dashboard/schedules/new">
                                                <Button>
                                                    Create Schedule
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {schedules.map((schedule) => (
                                                <div key={schedule.id} className="flex flex-col sm:flex-row justify-between p-3 border rounded-md">
                                                    <div>
                                                        <h3 className="font-medium">{schedule.title}</h3>
                                                        {schedule.description && (
                                                            <p className="text-sm text-gray-500 mt-1">{schedule.description}</p>
                                                        )}
                                                        <div className="flex items-center mt-2">
                                                            <Badge variant="outline" className="mr-2 capitalize">
                                                                {formatDayOfWeek(schedule.dayOfWeek)}
                                                            </Badge>
                                                            <span className="text-sm">
                                                                {format(new Date(schedule.startTime), 'h:mm a')} - {format(new Date(schedule.endTime), 'h:mm a')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 sm:mt-0 flex items-center">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <User className="h-3.5 w-3.5 mr-1" />
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

                        <TabsContent value="assets">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Package className="h-5 w-5 mr-2" />
                                        Deployed Assets
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {Object.keys(deploymentsByItem).length === 0 ? (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500 mb-4">No assets deployed to this room yet</p>
                                            <Link href="/dashboard/inventory/storage">
                                                <Button>
                                                    Deploy Assets to Room
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="mb-4 flex justify-end">
                                                <Link href="/dashboard/inventory/storage">
                                                    <Button>
                                                        Deploy More Assets
                                                    </Button>
                                                </Link>
                                            </div>
                                            <div className="space-y-8">
                                                {Object.values(deploymentsByItem).map((item: DeploymentItem) => (
                                                    <div key={item.id} className="border-b pb-6 last:border-0">
                                                        <h3 className="text-lg font-medium mb-2">
                                                            <Link href={`/dashboard/inventory/storage/${item.id}`} className="text-blue-600 hover:underline">
                                                                {item.name}
                                                            </Link>
                                                            <span className="ml-2 text-sm text-gray-500">
                                                                {item.itemType}{item.subType && ` (${item.subType})`}
                                                            </span>
                                                        </h3>

                                                        <div className="space-y-4 mt-3">
                                                            {item.deployments.map((deployment) => (
                                                                <div key={deployment.id} className="bg-muted rounded-md p-3">
                                                                    <div className="flex flex-wrap justify-between items-center mb-2">
                                                                        <span className="font-medium">
                                                                            {deployment.quantity} {item.unit || 'units'}
                                                                        </span>
                                                                        <div className="flex items-center text-sm text-gray-500">
                                                                            <Calendar className="h-3.5 w-3.5 mr-1" />
                                                                            {format(new Date(deployment.date), 'PPP p')}
                                                                        </div>
                                                                    </div>

                                                                    {deployment.serialNumber && (
                                                                        <div className="text-sm my-1">
                                                                            Serial: <Badge variant="outline">{deployment.serialNumber}</Badge>
                                                                        </div>
                                                                    )}

                                                                    <div className="text-sm flex items-center">
                                                                        <User className="h-3.5 w-3.5 mr-1" />
                                                                        Deployed by: {deployment.deployedBy}
                                                                    </div>

                                                                    {deployment.remarks && (
                                                                        <div className="text-sm text-gray-600 mt-1 italic">
                                                                            &ldquo;{deployment.remarks}&rdquo;
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
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
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Room QR Code</DialogTitle>
                        <DialogDescription>
                            Scan this QR code to access information for {room.name || `Room ${room.number}`}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center py-6">
                        {qrCode ? (
                            <img
                                src={qrCode}
                                alt={`QR Code for ${room.number}`}
                                className="w-64 h-64"
                            />
                        ) : (
                            <div className="w-64 h-64 flex items-center justify-center border rounded-md bg-muted">
                                <p className="text-muted-foreground">Loading QR code...</p>
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