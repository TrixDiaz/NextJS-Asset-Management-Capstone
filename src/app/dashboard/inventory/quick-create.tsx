"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface Building {
    id: string;
    name: string;
    code: string;
    address: string;
}

interface Floor {
    id: string;
    number: string;
    name: string;
    buildingId: string;
}

interface BuildingFormData {
    name: string;
    code: string;
    address: string;
}

interface FloorFormData {
    number: string;
    name: string;
}

interface RoomFormData {
    number: string;
    name: string;
    type: 'CLASSROOM' | 'OFFICE' | 'LABORATORY' | 'STORAGE' | 'OTHER';
}

export default function QuickCreate() {
    const [ buildings, setBuildings ] = useState<Building[]>([]);
    const [ floors, setFloors ] = useState<Floor[]>([]);
    const [ selectedBuilding, setSelectedBuilding ] = useState<string>('');
    const [ selectedFloor, setSelectedFloor ] = useState<string>('');

    // Form data
    const [ buildingData, setBuildingData ] = useState<BuildingFormData>({
        name: '',
        code: '',
        address: ''
    });

    const [ floorData, setFloorData ] = useState<FloorFormData>({
        number: '',
        name: ''
    });

    const [ roomData, setRoomData ] = useState<RoomFormData>({
        number: '',
        name: '',
        type: 'CLASSROOM'
    });

    // Fetch buildings
    useEffect(() => {
        fetchBuildings();
    }, []);

    // Fetch floors when building is selected
    useEffect(() => {
        if (selectedBuilding) {
            fetchFloors(selectedBuilding);
        } else {
            setFloors([]);
            setSelectedFloor('');
        }
    }, [ selectedBuilding ]);

    const fetchBuildings = async () => {
        try {
            const response = await fetch('/api/buildings');
            if (!response.ok) throw new Error('Failed to fetch buildings');
            const data = await response.json();
            setBuildings(data);
        } catch (error) {
            console.error('Error fetching buildings:', error);
            toast.error('Failed to load buildings');
        }
    };

    const fetchFloors = async (buildingId: string) => {
        try {
            const response = await fetch(`/api/floors?buildingId=${buildingId}`);
            if (!response.ok) throw new Error('Failed to fetch floors');
            const data = await response.json();
            setFloors(data);
        } catch (error) {
            console.error('Error fetching floors:', error);
            toast.error('Failed to load floors');
        }
    };

    const handleBuildingChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBuildingData(prev => ({ ...prev, [ name ]: value }));
    };

    const handleFloorChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFloorData(prev => ({ ...prev, [ name ]: value }));
    };

    const handleRoomChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRoomData(prev => ({ ...prev, [ name ]: value }));
    };

    const handleRoomTypeChange = (value: 'CLASSROOM' | 'OFFICE' | 'LABORATORY' | 'STORAGE' | 'OTHER') => {
        setRoomData(prev => ({ ...prev, type: value }));
    };

    const handleCreateBuilding = async (e: FormEvent) => {
        e.preventDefault();

        if (!buildingData.name) {
            toast.error('Building name is required');
            return;
        }

        try {
            const response = await fetch('/api/buildings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(buildingData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create building');
            }

            const newBuilding = await response.json();
            toast.success('Building created successfully');
            setBuildingData({ name: '', code: '', address: '' });
            fetchBuildings();
            setSelectedBuilding(newBuilding.id);
        } catch (error: unknown) {
            console.error('Error creating building:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create building');
        }
    };

    const handleCreateFloor = async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedBuilding) {
            toast.error('Please select a building first');
            return;
        }

        if (!floorData.number) {
            toast.error('Floor number is required');
            return;
        }

        try {
            const response = await fetch('/api/floors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...floorData,
                    buildingId: selectedBuilding
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create floor');
            }

            const newFloor = await response.json();
            toast.success('Floor created successfully');
            setFloorData({ number: '', name: '' });
            fetchFloors(selectedBuilding);
            setSelectedFloor(newFloor.id);
        } catch (error: unknown) {
            console.error('Error creating floor:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create floor');
        }
    };

    const handleCreateRoom = async (e: FormEvent) => {
        e.preventDefault();

        if (!selectedFloor) {
            toast.error('Please select a floor first');
            return;
        }

        if (!roomData.number) {
            toast.error('Room number is required');
            return;
        }

        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...roomData,
                    floorId: selectedFloor
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create room');
            }

            toast.success('Room created successfully');
            setRoomData({ number: '', name: '', type: 'CLASSROOM' });
        } catch (error: unknown) {
            console.error('Error creating room:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create room');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-xl font-bold mb-6">Quick Create</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Building Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Create Building</CardTitle>
                        <CardDescription>Add a new building to the inventory</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateBuilding} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="buildingName">Building Name</Label>
                                <Input
                                    id="buildingName"
                                    name="name"
                                    value={buildingData.name}
                                    onChange={handleBuildingChange}
                                    placeholder="Main Building"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="buildingCode">Building Code</Label>
                                <Input
                                    id="buildingCode"
                                    name="code"
                                    value={buildingData.code}
                                    onChange={handleBuildingChange}
                                    placeholder="MB"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="buildingAddress">Address</Label>
                                <Input
                                    id="buildingAddress"
                                    name="address"
                                    value={buildingData.address}
                                    onChange={handleBuildingChange}
                                    placeholder="123 University St"
                                />
                            </div>

                            <Button type="submit" className="w-full">Create Building</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Floor Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Create Floor</CardTitle>
                        <CardDescription>Add a new floor to a building</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateFloor} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="buildingSelect">Select Building</Label>
                                <Select
                                    value={selectedBuilding}
                                    onValueChange={setSelectedBuilding}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a building" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {buildings.map((building) => (
                                            <SelectItem key={building.id} value={building.id}>
                                                {building.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="floorNumber">Floor Number</Label>
                                <Input
                                    id="floorNumber"
                                    name="number"
                                    value={floorData.number}
                                    onChange={handleFloorChange}
                                    placeholder="1"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="floorName">Floor Name (Optional)</Label>
                                <Input
                                    id="floorName"
                                    name="name"
                                    value={floorData.name}
                                    onChange={handleFloorChange}
                                    placeholder="Ground Floor"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={!selectedBuilding}
                            >
                                Create Floor
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Room Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Create Room</CardTitle>
                        <CardDescription>Add a new room to a floor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="buildingSelectRoom">Select Building</Label>
                                <Select
                                    value={selectedBuilding}
                                    onValueChange={setSelectedBuilding}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a building" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {buildings.map((building) => (
                                            <SelectItem key={building.id} value={building.id}>
                                                {building.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="floorSelectRoom">Select Floor</Label>
                                <Select
                                    value={selectedFloor}
                                    onValueChange={setSelectedFloor}
                                    disabled={!selectedBuilding}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a floor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {floors.map((floor) => (
                                            <SelectItem key={floor.id} value={floor.id}>
                                                {floor.number} {floor.name ? `- ${floor.name}` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="roomNumber">Room Number</Label>
                                <Input
                                    id="roomNumber"
                                    name="number"
                                    value={roomData.number}
                                    onChange={handleRoomChange}
                                    placeholder="101"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="roomName">Room Name (Optional)</Label>
                                <Input
                                    id="roomName"
                                    name="name"
                                    value={roomData.name}
                                    onChange={handleRoomChange}
                                    placeholder="Conference Room"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="roomType">Room Type</Label>
                                <Select
                                    value={roomData.type}
                                    onValueChange={handleRoomTypeChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select room type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CLASSROOM">Classroom</SelectItem>
                                        <SelectItem value="OFFICE">Office</SelectItem>
                                        <SelectItem value="LABORATORY">Laboratory</SelectItem>
                                        <SelectItem value="STORAGE">Storage</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={!selectedFloor}
                            >
                                Create Room
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 