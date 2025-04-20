"use client";

import BuildingForm from '@/components/forms/building-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import * as React from 'react';
import { useUser } from '@clerk/nextjs';
import { usePermissions } from '@/hooks/use-permissions';
import { User } from '@/types/user';
import { BUILDING_UPDATE } from '@/constants/permissions';
import { useMemo } from 'react';

interface EditBuildingPageProps {
    params: Promise<{
        id: string;
    }>;
}

type Building = {
    id: string;
    name: string;
    code: string | null;
    address: string | null;
    createdAt: string;
    updatedAt: string;
};

export default function EditBuildingPage({ params }: EditBuildingPageProps) {
    const unwrappedParams = React.use(params);
    const id = unwrappedParams.id;
    const [ building, setBuilding ] = React.useState<Building | null>(null);
    const [ loading, setLoading ] = React.useState(true);
    const [ error, setError ] = React.useState<Error | null>(null);
    const { user } = useUser();

    // Memoize the user object to prevent recreation on every render
    const userForPermissions = useMemo(() => {
        if (!user) return null;

        return {
            id: user.id,
            clerkId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.emailAddresses[ 0 ]?.emailAddress || null,
            profileImageUrl: user.imageUrl,
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        } as User;
    }, [ user ]);

    // Get permissions from our hook
    const { can } = usePermissions(userForPermissions);
    const canEditBuilding = can(BUILDING_UPDATE);

    // Redirect if user doesn't have permission to edit buildings
    React.useEffect(() => {
        if (userForPermissions && !canEditBuilding && !loading) {
            redirect('/dashboard/inventory');
        }
    }, [ userForPermissions, canEditBuilding, loading ]);

    React.useEffect(() => {
        const fetchBuilding = async () => {
            try {
                const response = await fetch(`/api/buildings/${id}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        setLoading(false);
                        return;
                    }
                    throw new Error('Failed to fetch building data');
                }

                const buildingData = await response.json();
                setBuilding(buildingData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching building:", error);
                setError(error instanceof Error ? error : new Error('Unknown error'));
                setLoading(false);
            }
        };

        fetchBuilding();
    }, [ id ]);

    if (loading) {
        return <div className="container p-6">Loading building details...</div>;
    }

    if (error) {
        return <div className="container p-6">Error: {error.message}</div>;
    }

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
        <div className="container mx-auto p-4 md:p-6">
            <div className="mb-6">
                <Link href={`/dashboard/inventory/buildings/${id}`}>
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to {building.name}
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold md:text-3xl">Edit Building</h1>
                <p className="text-muted-foreground">Update the building information.</p>
            </div>

            <div className="max-w-2xl mx-auto">
                <BuildingForm initialData={formData} />
            </div>
        </div>
    );
} 