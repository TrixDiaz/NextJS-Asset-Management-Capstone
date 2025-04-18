import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Edit, History } from 'lucide-react';
import { notFound } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from 'date-fns';

interface StorageItemDetailPageProps {
    params: {
        id: string;
    };
}

type StorageItem = {
    id: string;
    name: string;
    itemType: string;
    subType: string | null;
    quantity: number;
    unit: string | null;
    remarks: string | null;
    serialNumbers: string[];
    createdAt: Date;
    updatedAt: Date;
    deploymentHistory: {
        id: string;
        quantity: number;
        serialNumber: string | null;
        date: Date;
        deployedBy: string;
        remarks: string | null;
        toRoomId: string | null;
    }[];
};

// Content component to avoid React.use in async function error
function StorageItemContent({ storageItem, id }: { storageItem: StorageItem, id: string }) {
    return (
        <div className="container p-6">
            <div className="flex items-center mb-4">
                <Link href="/dashboard/inventory/storage">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Storage
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-2xl font-bold">{storageItem.name}</CardTitle>
                            <Link href={`/dashboard/inventory/storage/${id}/edit`}>
                                <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Item Type</dt>
                                    <dd className="mt-1 text-lg">{storageItem.itemType}</dd>
                                </div>
                                {storageItem.subType && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Sub Type</dt>
                                        <dd className="mt-1 text-lg">{storageItem.subType}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                                    <dd className="mt-1 text-lg">
                                        {storageItem.quantity > 0 ? (
                                            <span>
                                                {storageItem.quantity} {storageItem.unit || ''}
                                            </span>
                                        ) : (
                                            <Badge variant="destructive">Out of Stock</Badge>
                                        )}
                                    </dd>
                                </div>
                                {storageItem.serialNumbers && storageItem.serialNumbers.length > 0 && (
                                    <div className="md:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Serial Numbers</dt>
                                        <dd className="mt-1">
                                            <div className="flex flex-wrap gap-2">
                                                {storageItem.serialNumbers.map((serial, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {serial}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </dd>
                                    </div>
                                )}
                                <div className="md:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Remarks</dt>
                                    <dd className="mt-1">{storageItem.remarks || 'No remarks'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Added On</dt>
                                    <dd className="mt-1">
                                        {storageItem.createdAt.toLocaleDateString()}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                    <dd className="mt-1">
                                        {storageItem.updatedAt.toLocaleDateString()}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    {storageItem.quantity > 0 && (
                        <div className="mt-6">
                            <Link href={`/dashboard/inventory/storage/${id}/deploy`}>
                                <Button>
                                    Deploy Item
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <History className="h-5 w-5 mr-2" />
                                Deployment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {storageItem.deploymentHistory.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No deployment history yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {storageItem.deploymentHistory.map((record) => (
                                        <div key={record.id} className="border-b pb-3 last:border-0">
                                            <div className="flex justify-between">
                                                <span className="font-medium">
                                                    {record.quantity} {storageItem.unit || 'units'}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {formatDistance(record.date, new Date(), { addSuffix: true })}
                                                </span>
                                            </div>
                                            {record.serialNumber && (
                                                <div className="text-sm my-1">
                                                    Serial: <Badge variant="outline">{record.serialNumber}</Badge>
                                                </div>
                                            )}
                                            <div className="text-sm">
                                                Deployed by: {record.deployedBy}
                                            </div>
                                            {record.remarks && (
                                                <div className="text-sm text-gray-600 mt-1">
                                                    Note: {record.remarks}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default async function StorageItemDetailPage({ params }: StorageItemDetailPageProps) {
    const id = params.id;

    try {
        // Fetch storage item with deployment history
        const storageItem = await prisma.storageItem.findUnique({
            where: { id },
            include: {
                deploymentHistory: {
                    orderBy: {
                        date: 'desc'
                    }
                }
            }
        }) as StorageItem | null;

        if (!storageItem) {
            notFound();
        }

        return <StorageItemContent storageItem={storageItem} id={id} />;
    } catch (error) {
        console.error("Error in storage item detail:", error);
        throw error;
    }
} 