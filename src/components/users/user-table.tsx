'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    ChevronDown,
    Check,
    User,
    ShieldCheck,
    Clock
} from 'lucide-react';
import { UserTableItem, Role } from '@/types/user';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface UserTableProps {
    data: UserTableItem[];
}

export function UserTable({ data }: UserTableProps) {
    const [ selectedUsers, setSelectedUsers ] = useState<string[]>([]);
    const [ searchTerm, setSearchTerm ] = useState('');
    const [ showDeleteDialog, setShowDeleteDialog ] = useState(false);
    const [ userToDelete, setUserToDelete ] = useState<string | null>(null);
    const [ showBulkDeleteDialog, setShowBulkDeleteDialog ] = useState(false);

    // Filter users based on search term
    const filteredUsers = data.filter(user =>
        (user.firstName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // Handle bulk selection
    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(user => user.id));
        }
    };

    const toggleSelectUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([ ...selectedUsers, userId ]);
        }
    };

    // Handle single user deletion
    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(`/api/users/${userToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            toast.success('User deleted successfully');
            setUserToDelete(null);
            setShowDeleteDialog(false);
            // In a real app, you would refresh the data here
        } catch (error) {
            toast.error('Failed to delete user', {
                description: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        }
    };

    // Handle bulk deletion
    const handleBulkDelete = async () => {
        try {
            const response = await fetch('/api/users/bulk-delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userIds: selectedUsers }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete users');
            }

            toast.success(`${selectedUsers.length} users deleted successfully`);
            setSelectedUsers([]);
            setShowBulkDeleteDialog(false);
            // In a real app, you would refresh the data here
        } catch (error) {
            toast.error('Failed to delete users', {
                description: error instanceof Error ? error.message : 'Unknown error occurred',
            });
        }
    };

    // User role badge color mapping
    const getRoleBadgeVariant = (role: Role) => {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'manager':
                return 'default';
            case 'user':
                return 'secondary';
            case 'guest':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    return (
        <div className="w-full">
            <div className="p-4 flex justify-between items-center border-b">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={selectedUsers.length === 0}
                        onClick={() => setShowBulkDeleteDialog(true)}
                        className="h-8 px-2 text-xs"
                    >
                        {selectedUsers.length > 0 ? `Delete (${selectedUsers.length})` : 'Delete Selected'}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        {selectedUsers.length > 0
                            ? `${selectedUsers.length} of ${data.length} selected`
                            : `${data.length} users total`}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs h-8 text-xs"
                    />
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">
                            <Checkbox
                                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                onCheckedChange={toggleSelectAll}
                                aria-label="Select all users"
                            />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                                No users found
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedUsers.includes(user.id)}
                                        onCheckedChange={() => toggleSelectUser(user.id)}
                                        aria-label={`Select user ${user.firstName || 'Unknown'}`}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div className="flex items-center space-x-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            {user.profileImageUrl ? (
                                                <img
                                                    src={user.profileImageUrl}
                                                    alt={`${user.firstName || ''} ${user.lastName || ''}`}
                                                    className="h-8 w-8 rounded-full"
                                                />
                                            ) : (
                                                <User className="h-4 w-4 text-slate-500" />
                                            )}
                                        </div>
                                        <div>
                                            {user.firstName && user.lastName
                                                ? `${user.firstName} ${user.lastName}`
                                                : 'Unnamed User'}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{user.username || '-'}</TableCell>
                                <TableCell>{user.email || '-'}</TableCell>
                                <TableCell>
                                    <Badge variant={getRoleBadgeVariant(user.role as Role)}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell title={new Date(user.createdAt).toLocaleString()}>
                                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <Link href={`/dashboard/users/${user.id}`}>
                                                <DropdownMenuItem>
                                                    <User className="mr-2 h-4 w-4" />
                                                    View Profile
                                                </DropdownMenuItem>
                                            </Link>
                                            <Link href={`/dashboard/users/${user.id}/edit`}>
                                                <DropdownMenuItem>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                            </Link>
                                            <Link href={`/dashboard/users/${user.id}/permissions`}>
                                                <DropdownMenuItem>
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    Permissions
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setUserToDelete(user.id);
                                                    setShowDeleteDialog(true);
                                                }}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Delete single user confirmation dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk delete confirmation dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete multiple users?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to delete {selectedUsers.length} users. This action cannot be undone. Are you sure you want to continue?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete {selectedUsers.length} Users
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 