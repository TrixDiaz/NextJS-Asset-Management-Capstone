"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, Plus, Trash2, Pencil, QrCode } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format, parse } from 'date-fns';
import { toast } from "sonner";

interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    role: string;
}

interface Room {
    id: string;
    name: string;
    number: string;
    capacity?: number;
    location?: string;
    qrCode?: string;
    floor?: {
        id: string;
        number: number;
        building?: {
            id: string;
            name: string;
        }
    }
}

interface Schedule {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    dayOfWeek: string;
    userId: string;
    roomId: string;
    room: Room;
}

const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
];

const userRoles = [ "admin", "manager", "user", "guest" ];

// Time options for dropdown with 30 min intervals
const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute of [ 0, 30 ]) {
            const h = hour.toString().padStart(2, '0');
            const m = minute.toString().padStart(2, '0');
            options.push(`${h}:${m}`);
        }
    }
    return options;
};

const timeOptions = generateTimeOptions();

// Component for time selection dropdown
interface TimeSelectProps {
    value: string;
    onChange: (value: string) => void;
    id: string;
    label: string;
    className?: string;
}

const TimeSelect: React.FC<TimeSelectProps> = ({ value, onChange, id, label, className = "" }) => {
    return (
        <div className={`grid grid-cols-4 items-center gap-4 ${className}`}>
            <Label htmlFor={id} className="text-right">
                {label}
            </Label>
            <Select
                value={value}
                onValueChange={onChange}
            >
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                    {timeOptions.map(time => (
                        <SelectItem key={time} value={time}>
                            {format(parse(time, 'HH:mm', new Date()), 'h:mm a')}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default function UserSchedulesPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [ user, setUser ] = useState<User | null>(null);
    const [ schedules, setSchedules ] = useState<Schedule[]>([]);
    const [ rooms, setRooms ] = useState<Room[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);

    // Dialog states
    const [ showAddDialog, setShowAddDialog ] = useState(false);
    const [ showEditDialog, setShowEditDialog ] = useState(false);
    const [ showDeleteDialog, setShowDeleteDialog ] = useState(false);
    const [ showQRDialog, setShowQRDialog ] = useState(false);

    // Schedule state
    const [ currentSchedule, setCurrentSchedule ] = useState<Schedule | null>(null);
    const [ scheduleToDelete, setScheduleToDelete ] = useState<string | null>(null);
    const [ selectedRoom, setSelectedRoom ] = useState<Room | null>(null);

    // Form state
    const [ formData, setFormData ] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        dayOfWeek: 'monday',
        roomId: ''
    });

    // User form state
    const [ userFormData, setUserFormData ] = useState({
        role: ''
    });

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/users/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch user');
                const data = await response.json();
                setUser(data);
                setUserFormData({ role: data.role });
            } catch (error) {
                console.error("Error loading user:", error);
                toast.error("Failed to load user data");
            }
        };

        fetchUser();
    }, [ userId ]);

    // Fetch schedules
    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/users/${userId}/schedules`);
                if (!response.ok) throw new Error('Failed to fetch schedules');
                const data = await response.json();
                setSchedules(data);
            } catch (error) {
                console.error("Error loading schedules:", error);
                toast.error("Failed to load schedules");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedules();
    }, [ userId ]);

    // Fetch rooms
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch('/api/rooms');
                if (!response.ok) throw new Error('Failed to fetch rooms');
                const data = await response.json();
                setRooms(data);
            } catch (error) {
                console.error("Error loading rooms:", error);
                toast.error("Failed to load rooms");
            }
        };

        fetchRooms();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [ name ]: value
        }));
    };

    const handleUserInputChange = (name: string, value: string) => {
        setUserFormData(prev => ({
            ...prev,
            [ name ]: value
        }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [ name ]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            startTime: '',
            endTime: '',
            dayOfWeek: 'monday',
            roomId: ''
        });
        setCurrentSchedule(null);
    };

    const handleAddSchedule = () => {
        resetForm();
        setShowAddDialog(true);
    };

    const handleEditSchedule = (schedule: Schedule) => {
        setCurrentSchedule(schedule);

        // Format times for time input (HH:MM)
        const startTime = format(new Date(schedule.startTime), 'HH:mm');
        const endTime = format(new Date(schedule.endTime), 'HH:mm');

        setFormData({
            title: schedule.title,
            description: schedule.description || '',
            startTime: startTime,
            endTime: endTime,
            dayOfWeek: schedule.dayOfWeek,
            roomId: schedule.roomId
        });
        setShowEditDialog(true);
    };

    const handleDeleteSchedule = (scheduleId: string) => {
        setScheduleToDelete(scheduleId);
        setShowDeleteDialog(true);
    };

    const handleShowQRCode = (room: Room) => {
        // Fetch room details with QR code
        fetch(`/api/rooms/${room.id}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch room details');
                return res.json();
            })
            .then(data => {
                setSelectedRoom({
                    ...room,
                    qrCode: data.qrCode
                });
                setShowQRDialog(true);
            })
            .catch(error => {
                console.error('Error fetching QR code:', error);
                toast.error("Failed to load room QR code");
                // Still show dialog with "no QR code" message
                setSelectedRoom(room);
                setShowQRDialog(true);
            });
    };

    const prepareScheduleData = () => {
        // Create proper datetime strings for the API from time inputs
        const today = new Date();
        const dayIndex = daysOfWeek.indexOf(formData.dayOfWeek);

        // Set the date to the next occurrence of the selected day
        const currentDay = today.getDay();
        // Sunday is 0 in JS but not in our daysOfWeek array, so we need to adjust
        const adjustedCurrentDay = currentDay === 0 ? 7 : currentDay;
        const daysUntilNext = (dayIndex + 1 - adjustedCurrentDay + 7) % 7;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysUntilNext);

        // Parse the time inputs
        const [ startHours, startMinutes ] = formData.startTime.split(':').map(Number);
        const [ endHours, endMinutes ] = formData.endTime.split(':').map(Number);

        const startDate = new Date(targetDate);
        startDate.setHours(startHours, startMinutes, 0, 0);

        const endDate = new Date(targetDate);
        endDate.setHours(endHours, endMinutes, 0, 0);

        return {
            ...formData,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString()
        };
    };

    const submitAddSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const scheduleData = prepareScheduleData();

            const response = await fetch(`/api/users/${userId}/schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scheduleData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create schedule');
            }

            // Refresh schedules
            const refreshResponse = await fetch(`/api/users/${userId}/schedules`);
            if (!refreshResponse.ok) throw new Error('Failed to fetch schedules');
            const data = await refreshResponse.json();
            setSchedules(data);

            setShowAddDialog(false);
            resetForm();
            toast.success("Schedule added successfully");
        } catch (error) {
            console.error('Error creating schedule:', error);
            toast.error(error instanceof Error ? error.message : "Failed to create schedule");
        }
    };

    const submitEditSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentSchedule) return;

        try {
            const scheduleData = prepareScheduleData();

            const response = await fetch(`/api/schedules/${currentSchedule.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scheduleData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update schedule');
            }

            // Refresh schedules
            const refreshResponse = await fetch(`/api/users/${userId}/schedules`);
            if (!refreshResponse.ok) throw new Error('Failed to fetch schedules');
            const data = await refreshResponse.json();
            setSchedules(data);

            setShowEditDialog(false);
            resetForm();
            toast.success("Schedule updated successfully");
        } catch (error) {
            console.error('Error updating schedule:', error);
            toast.error(error instanceof Error ? error.message : "Failed to update schedule");
        }
    };

    const confirmDeleteSchedule = async () => {
        if (!scheduleToDelete) return;

        try {
            const response = await fetch(`/api/schedules/${scheduleToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete schedule');
            }

            // Refresh schedules
            const refreshResponse = await fetch(`/api/users/${userId}/schedules`);
            if (!refreshResponse.ok) throw new Error('Failed to fetch schedules');
            const data = await refreshResponse.json();
            setSchedules(data);

            setShowDeleteDialog(false);
            setScheduleToDelete(null);
            toast.success("Schedule deleted successfully");
        } catch (error) {
            console.error('Error deleting schedule:', error);
            toast.error("Failed to delete schedule");
        }
    };

    const updateUserRole = async () => {
        if (!user) return;

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: userFormData.role }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user role');
            }

            // Update local user data
            setUser(prev => prev ? { ...prev, role: userFormData.role } : null);
            toast.success("User role updated successfully");
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error("Failed to update user role");
        }
    };

    return (
        <div className="p-6 space-y-6 w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">
                        Schedules for {user ? (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username || user.email || 'User') : 'Loading...'}
                    </h1>
                </div>

                <div className="flex items-center space-x-2">
                    {user && (
                        <div className="flex items-center space-x-2">
                            <Select
                                value={userFormData.role}
                                onValueChange={(value) => handleUserInputChange('role', value)}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {userRoles.map(role => (
                                        <SelectItem key={role} value={role}>
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={updateUserRole} variant="outline">
                                Update Role
                            </Button>
                        </div>
                    )}

                    <Button onClick={handleAddSchedule}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Schedule
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                {isLoading ? (
                    <div className="p-8 text-center">Loading schedules...</div>
                ) : schedules.length === 0 ? (
                    <div className="p-8 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                        <h3 className="text-lg font-semibold">No schedules found</h3>
                        <p className="text-muted-foreground mt-1">Get started by adding a schedule for this user.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Day</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Room</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules.map(schedule => (
                                <TableRow key={schedule.id}>
                                    <TableCell className="font-medium">
                                        {schedule.title}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {schedule.dayOfWeek}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(schedule.startTime), 'h:mm a')} - {format(new Date(schedule.endTime), 'h:mm a')}
                                    </TableCell>
                                    <TableCell>
                                        {schedule.room.name}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleShowQRCode(schedule.room)}
                                            >
                                                <QrCode className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditSchedule(schedule)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteSchedule(schedule.id)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Add Schedule Dialog */}
            <Dialog open={showAddDialog} onOpenChange={(open) => {
                setShowAddDialog(open);
                if (!open) resetForm();
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add Schedule</DialogTitle>
                        <DialogDescription>
                            Create a new schedule for this user.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitAddSchedule}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                    placeholder="E.g., Math Class, Piano Lesson"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                    placeholder="Optional details about this schedule"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dayOfWeek" className="text-right">
                                    Day
                                </Label>
                                <Select
                                    value={formData.dayOfWeek}
                                    onValueChange={(value) => handleSelectChange('dayOfWeek', value)}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {daysOfWeek.map(day => (
                                            <SelectItem key={day} value={day} className="capitalize">
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <TimeSelect
                                id="startTime"
                                label="Start Time"
                                value={formData.startTime}
                                onChange={(value) => handleSelectChange('startTime', value)}
                            />
                            <TimeSelect
                                id="endTime"
                                label="End Time"
                                value={formData.endTime}
                                onChange={(value) => handleSelectChange('endTime', value)}
                            />
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="roomId" className="text-right">
                                    Room
                                </Label>
                                <Select
                                    value={formData.roomId}
                                    onValueChange={(value) => handleSelectChange('roomId', value)}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map(room => (
                                            <SelectItem key={room.id} value={room.id}>
                                                {room.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Create Schedule</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Schedule Dialog */}
            <Dialog open={showEditDialog} onOpenChange={(open) => {
                setShowEditDialog(open);
                if (!open) resetForm();
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Schedule</DialogTitle>
                        <DialogDescription>
                            Update this schedule.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEditSchedule}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-title" className="text-right">
                                    Title
                                </Label>
                                <Input
                                    id="edit-title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-description" className="text-right">
                                    Description
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-dayOfWeek" className="text-right">
                                    Day
                                </Label>
                                <Select
                                    value={formData.dayOfWeek}
                                    onValueChange={(value) => handleSelectChange('dayOfWeek', value)}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a day" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {daysOfWeek.map(day => (
                                            <SelectItem key={day} value={day} className="capitalize">
                                                {day}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <TimeSelect
                                id="edit-startTime"
                                label="Start Time"
                                value={formData.startTime}
                                onChange={(value) => handleSelectChange('startTime', value)}
                            />
                            <TimeSelect
                                id="edit-endTime"
                                label="End Time"
                                value={formData.endTime}
                                onChange={(value) => handleSelectChange('endTime', value)}
                            />
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-roomId" className="text-right">
                                    Room
                                </Label>
                                <Select
                                    value={formData.roomId}
                                    onValueChange={(value) => handleSelectChange('roomId', value)}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a room" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map(room => (
                                            <SelectItem key={room.id} value={room.id}>
                                                {room.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Update Schedule</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Schedule Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this schedule? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteSchedule}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* QR Code Dialog */}
            <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Room QR Code</DialogTitle>
                        <DialogDescription>
                            Scan this QR code to access room {selectedRoom?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center py-6">
                        {selectedRoom?.qrCode ? (
                            <img
                                src={selectedRoom.qrCode}
                                alt={`QR Code for ${selectedRoom.name}`}
                                className="w-64 h-64"
                            />
                        ) : (
                            <div className="w-64 h-64 flex items-center justify-center border rounded-md bg-muted">
                                <p className="text-muted-foreground">No QR code available</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowQRDialog(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 