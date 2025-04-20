'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    Building,
    Cpu,
    Database,
    HardDrive,
    Home,
    Layers,
    Monitor,
    Package,
    Server,
    Plus
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useUser } from '@clerk/nextjs';
import { PermissionLink } from '@/components/auth/permission-link';
import {
    BUILDING_READ,
    BUILDING_CREATE,
    ASSET_READ,
    ASSET_CREATE,
    STORAGE_READ,
} from '@/constants/permissions';
import { User } from '@/types/user';

export default function WelcomePage() {
    const { user } = useUser();

    // Create user object for permission checks
    const userForPermissions: User | null = user ? {
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
    } : null;

    return (
        <div className="container px-4 sm:px-6 mx-auto h-screen overflow-y-auto">
            <div className="mb-8 text-center py-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">Inventory Management System</h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
                    Track assets, manage rooms, and keep inventory of your IT equipment with this comprehensive system
                </p>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
                <Card className="flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                            Buildings & Rooms
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm sm:text-base">Manage your organization&apos;s buildings, floors, and rooms in a hierarchical structure.</p>
                    </CardContent>
                    <CardFooter>
                        <PermissionLink
                            href="/dashboard/inventory"
                            permission={BUILDING_READ}
                            user={userForPermissions}
                            className="w-full"
                        >
                            <Button variant="outline" className="w-full">
                                View Buildings
                            </Button>
                        </PermissionLink>
                    </CardFooter>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />
                            Asset Tracking
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm sm:text-base">Track computers, monitors, and other equipment with details on their location and status.</p>
                    </CardContent>
                    <CardFooter>
                        <PermissionLink
                            href="/dashboard/inventory/assets"
                            permission={ASSET_READ}
                            user={userForPermissions}
                            className="w-full"
                        >
                            <Button variant="outline" className="w-full">
                                View Assets
                            </Button>
                        </PermissionLink>
                    </CardFooter>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                            Storage Inventory
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="text-sm sm:text-base">Maintain inventory of cables, software, hardware, and other items in your storage.</p>
                    </CardContent>
                    <CardFooter>
                        <PermissionLink
                            href="/dashboard/inventory/storage"
                            permission={STORAGE_READ}
                            user={userForPermissions}
                            className="w-full"
                        >
                            <Button variant="outline" className="w-full">
                                View Storage
                            </Button>
                        </PermissionLink>
                    </CardFooter>
                </Card>
            </div>

            <div className="border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                    Getting Started
                </h2>
                <div className="space-y-4">
                    <div className="flex gap-3 sm:gap-4 items-start">
                        <div className="bg-primary text-primary-foreground w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm sm:text-base">1</div>
                        <div>
                            <h3 className="text-md sm:text-lg font-medium">Create Buildings</h3>
                            <p className="text-sm sm:text-base text-muted-foreground">Start by adding buildings to your system (e.g., &quot;KorPhil&quot;). Each building serves as the top-level container for your inventory structure.</p>
                        </div>
                    </div>

                    <div className="flex gap-3 sm:gap-4 items-start">
                        <div className="bg-primary text-primary-foreground w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm sm:text-base">2</div>
                        <div>
                            <h3 className="text-md sm:text-lg font-medium">Add Floors</h3>
                            <p className="text-sm sm:text-base text-muted-foreground">For each building, add the floors that exist (e.g., &quot;3rd Floor&quot;). This helps organize your spaces hierarchically.</p>
                        </div>
                    </div>

                    <div className="flex gap-3 sm:gap-4 items-start">
                        <div className="bg-primary text-primary-foreground w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm sm:text-base">3</div>
                        <div>
                            <h3 className="text-md sm:text-lg font-medium">Create Rooms</h3>
                            <p className="text-sm sm:text-base text-muted-foreground">Add rooms to each floor (e.g., &quot;Room 302&quot;). Rooms are where assets will be located and tracked.</p>
                        </div>
                    </div>

                    <div className="flex gap-3 sm:gap-4 items-start">
                        <div className="bg-primary text-primary-foreground w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm sm:text-base">4</div>
                        <div>
                            <h3 className="text-md sm:text-lg font-medium">Enter Storage Inventory</h3>
                            <p className="text-sm sm:text-base text-muted-foreground">Add items to your storage inventory with details like quantity, unit, and type (e.g., VGA cables, patch panels, mice).</p>
                        </div>
                    </div>

                    <div className="flex gap-3 sm:gap-4 items-start">
                        <div className="bg-primary text-primary-foreground w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm sm:text-base">5</div>
                        <div>
                            <h3 className="text-md sm:text-lg font-medium">Add Assets to Rooms</h3>
                            <p className="text-sm sm:text-base text-muted-foreground">Add computers and other equipment to specific rooms, including details like system unit, monitor, and UPS information.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 mb-6 sm:mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">System Structure</CardTitle>
                        <CardDescription>Hierarchical organization of your inventory</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <span className="font-medium text-sm sm:text-base">Buildings</span>
                                <span className="text-xs sm:text-sm text-muted-foreground">(e.g., KorPhil)</span>
                            </div>
                            <div className="flex items-center gap-2 pl-4 sm:pl-5">
                                <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <span className="font-medium text-sm sm:text-base">Floors</span>
                                <span className="text-xs sm:text-sm text-muted-foreground">(e.g., 3rd Floor)</span>
                            </div>
                            <div className="flex items-center gap-2 pl-8 sm:pl-10">
                                <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <span className="font-medium text-sm sm:text-base">Rooms</span>
                                <span className="text-xs sm:text-sm text-muted-foreground">(e.g., Room 302)</span>
                            </div>
                            <div className="flex items-center gap-2 pl-12 sm:pl-16">
                                <Cpu className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <span className="font-medium text-sm sm:text-base">Computers</span>
                                <span className="text-xs sm:text-sm text-muted-foreground">(PCs with details)</span>
                            </div>
                            <div className="flex items-center gap-2 pl-12 sm:pl-16">
                                <HardDrive className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                <span className="font-medium text-sm sm:text-base">Other Equipment</span>
                                <span className="text-xs sm:text-sm text-muted-foreground">(Printers, projectors, etc.)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
                        <CardDescription>Get started with these essential actions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <PermissionLink
                            href="/dashboard/inventory/buildings/new"
                            permission={BUILDING_CREATE}
                            user={userForPermissions}
                            className="w-full"
                        >
                            <Button variant="default" className="w-full flex justify-between items-center gap-2" size="sm">
                                <span className="flex items-center">
                                    <Building className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    Create New Building
                                </span>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </PermissionLink>
                        <PermissionLink
                            href="/dashboard/inventory/assets/new"
                            permission={ASSET_CREATE}
                            user={userForPermissions}
                            className="w-full"
                        >
                            <Button variant="outline" className="w-full flex justify-between items-center gap-2" size="sm">
                                <span className="flex items-center">
                                    <Monitor className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    Add New Asset
                                </span>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </PermissionLink>
                        <PermissionLink
                            href="/dashboard/inventory/storage/new"
                            permission={STORAGE_READ}
                            user={userForPermissions}
                            className="w-full"
                        >
                            <Button variant="outline" className="w-full flex justify-between items-center gap-2" size="sm">
                                <span className="flex items-center">
                                    <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    Add Storage Item
                                </span>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </PermissionLink>
                        <Link href="/dashboard/users/new" className="w-full">
                            <Button variant="outline" className="w-full flex justify-between items-center gap-2" size="sm">
                                <span className="flex items-center">
                                    <Server className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                    Create User
                                </span>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 