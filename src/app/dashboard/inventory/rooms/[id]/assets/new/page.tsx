'use client';

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AssetForm from '@/components/forms/asset-form';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function NewAssetPage() {
    const params = useParams();
    const roomId = typeof params.id === 'string' ? params.id : '';

    return (
        <div className="container p-6">
            <div className="flex items-center mb-4">
                <Link href={`/dashboard/inventory/rooms/${roomId}`}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Room
                    </Button>
                </Link>
            </div>

            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Add New Asset</CardTitle>
                </CardHeader>
                <CardContent>
                    <AssetForm roomId={roomId} />
                </CardContent>
            </Card>
        </div>
    );
} 