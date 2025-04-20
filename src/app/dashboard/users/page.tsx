"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Trash2, Pencil, Download, ChevronDown, FilterX, FileDown, MoreHorizontal, Calendar, Lock } from 'lucide-react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { usePermissions } from '@/hooks/use-permissions';
import { USER_CREATE, USER_UPDATE, USER_DELETE } from '@/constants/permissions';

interface User {
    id: string;
    clerkId: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    username?: string | null;
    profileImageUrl?: string | null;
    role: string;
    permissions?: any[];
    createdAt: string;
    updatedAt: string;
}

type SortDirection = 'asc' | 'desc' | null;
type SortField = 'name' | 'username' | 'email' | 'role' | 'createdAt';

// Define permission types
type Permission = 'create' | 'edit' | 'delete' | 'export' | 'bulkActions';

export default function UsersPage() {
    const [ users, setUsers ] = useState<User[]>([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ currentUser, setCurrentUser ] = useState<User | null>(null);
    const [ selectedUsers, setSelectedUsers ] = useState<Record<string, boolean>>({});
    const [ searchQuery, setSearchQuery ] = useState('');
    const [ sortField, setSortField ] = useState<SortField | null>(null);
    const [ sortDirection, setSortDirection ] = useState<SortDirection>(null);
    const [ roleFilter, setRoleFilter ] = useState<string[]>([]);
    const [ visibleColumns, setVisibleColumns ] = useState({
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        actions: true,
    });
    const [ pageIndex, setPageIndex ] = useState(0);
    const [ pageSize, setPageSize ] = useState(10);

    // Dialog states
    const [ showDeleteDialog, setShowDeleteDialog ] = useState(false);
    const [ showRoleDialog, setShowRoleDialog ] = useState(false);
    const [ newRoleValue, setNewRoleValue ] = useState<string>("user");

    // Add state for individual user operations
    const [ userToEdit, setUserToEdit ] = useState<User | null>(null);
    const [ showEditDialog, setShowEditDialog ] = useState(false);
    const [ showDeleteUserDialog, setShowDeleteUserDialog ] = useState(false);
    const [ userToDelete, setUserToDelete ] = useState<string | null>(null);

    // Form state for editing user
    const [ editFormData, setEditFormData ] = useState({
        firstName: '',
        lastName: '',
        username: '',
        role: ''
    });

    // Calculate selected count
    const selectedCount = Object.values(selectedUsers).filter(Boolean).length;

    // Get array of selected IDs
    const selectedUserIds = Object.entries(selectedUsers)
        .filter(([ _, isSelected ]) => isSelected)
        .map(([ id ]) => id);

    // Get permissions from our hook
    const permissionsApi = usePermissions(currentUser as any);
    const { can } = permissionsApi;

    // Function to check if user has permission for a specific action
    const hasPermission = (action: Permission): boolean => {
        switch (action) {
            case 'create':
                return can(USER_CREATE);
            case 'edit':
                return can(USER_UPDATE);
            case 'delete':
                return can(USER_DELETE);
            case 'export':
                // Allow export for any user with READ permissions
                return currentUser?.role !== 'guest';
            case 'bulkActions':
                return can(USER_DELETE) || can(USER_UPDATE);
            default:
                return false;
        }
    };

    // Fetch current user information with permissions
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                // For testing, get a role from URL query param if available
                const urlParams = new URLSearchParams(window.location.search);
                const testRole = urlParams.get('testRole');

                if (testRole && [ 'admin', 'technician', 'member', 'guest' ].includes(testRole)) {
                    // Create a test user with the specified role
                    const testUser = {
                        id: `test-${testRole}`,
                        clerkId: `test-${testRole}`,
                        firstName: testRole.charAt(0).toUpperCase() + testRole.slice(1),
                        lastName: 'Test',
                        username: testRole,
                        email: `${testRole}@example.com`,
                        role: testRole as any,
                        permissions: [],
                        profileImageUrl: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    setCurrentUser(testUser as User);
                } else {
                    // Try to get the actual logged in user
                    const response = await fetch('/api/users/current');
                    if (response.ok) {
                        const data = await response.json();
                        setCurrentUser(data);
                    } else {
                        // Fallback to using a test admin account for demo
                        const testUser = {
                            id: 'test-admin',
                            clerkId: 'test-admin',
                            firstName: 'Admin',
                            lastName: 'User',
                            username: 'admin',
                            email: 'admin@example.com',
                            role: 'admin',
                            permissions: [],
                            profileImageUrl: null,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        setCurrentUser(testUser as User);
                    }
                }
            } catch (error) {
                console.error("Error fetching current user:", error);
                // Fallback to using a test account
                const testUser = {
                    id: 'test-admin',
                    clerkId: 'test-admin',
                    firstName: 'Admin',
                    lastName: 'User',
                    username: 'admin',
                    email: 'admin@example.com',
                    role: 'admin',
                    permissions: [],
                    profileImageUrl: null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                setCurrentUser(testUser as User);
            }
        };

        fetchCurrentUser();
    }, []);

    // Fetch users data
    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/users');
                if (!response.ok) throw new Error('Failed to fetch users');
                const data = await response.json();

                // Only update state if component is still mounted
                if (isMounted) {
                    setUsers(data);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error loading users:", error);
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchUsers();

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted = false;
        };
    }, []);

    // Filter and sort users
    const filteredAndSortedUsers = useMemo(() => {
        // First, filter the users
        let result = [ ...users ];

        // Apply role filter
        if (roleFilter.length > 0) {
            result = result.filter(user => roleFilter.includes(user.role));
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(user =>
                (user.firstName && user.firstName.toLowerCase().includes(query)) ||
                (user.lastName && user.lastName.toLowerCase().includes(query)) ||
                (user.email && user.email.toLowerCase().includes(query)) ||
                (user.username && user.username.toLowerCase().includes(query))
            );
        }

        // Apply sorting
        if (sortField && sortDirection) {
            result.sort((a, b) => {
                let valueA: any;
                let valueB: any;

                // Extract values based on sort field
                switch (sortField) {
                    case 'name':
                        valueA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
                        valueB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
                        break;
                    case 'username':
                        valueA = a.username || '';
                        valueB = b.username || '';
                        break;
                    case 'email':
                        valueA = a.email || '';
                        valueB = b.email || '';
                        break;
                    case 'role':
                        valueA = a.role;
                        valueB = b.role;
                        break;
                    case 'createdAt':
                        valueA = new Date(a.createdAt).getTime();
                        valueB = new Date(b.createdAt).getTime();
                        break;
                    default:
                        return 0;
                }

                // Compare values
                if (valueA < valueB) {
                    return sortDirection === 'asc' ? -1 : 1;
                }
                if (valueA > valueB) {
                    return sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return result;
    }, [ users, searchQuery, sortField, sortDirection, roleFilter ]);

    // Calculate pagination
    const pageCount = Math.ceil(filteredAndSortedUsers.length / pageSize);
    const paginatedUsers = useMemo(() => {
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        return filteredAndSortedUsers.slice(start, end);
    }, [ filteredAndSortedUsers, pageIndex, pageSize ]);

    // Toggle column sort
    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            // Cycle through: asc -> desc -> null
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortField(null);
                setSortDirection(null);
            }
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Toggle selection for a single user
    const toggleUserSelection = (userId: string) => {
        setSelectedUsers(prev => ({
            ...prev,
            [ userId ]: !prev[ userId ]
        }));
    };

    // Toggle selection for all users
    const toggleAllSelection = () => {
        if (selectedCount === filteredAndSortedUsers.length) {
            // If all are selected, deselect all
            setSelectedUsers({});
        } else {
            // Otherwise, select all visible users
            const newSelection: Record<string, boolean> = {};
            filteredAndSortedUsers.forEach(user => {
                newSelection[ user.id ] = true;
            });
            setSelectedUsers(newSelection);
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedUserIds.length === 0) return;
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            // Call the bulk-delete API endpoint
            const response = await fetch("/api/users/bulk-delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userIds: selectedUserIds }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete users");
            }

            // After successful delete, refresh the data
            const refreshResponse = await fetch('/api/users');
            if (!refreshResponse.ok) throw new Error('Failed to fetch users');
            const data = await refreshResponse.json();
            setUsers(data);
            setSelectedUsers({});
            setShowDeleteDialog(false);
            toast.success(`Successfully deleted ${selectedUserIds.length} users`);

            // Reset to first page if current page is now empty
            if (pageIndex > 0 && pageIndex >= Math.ceil(data.length / pageSize)) {
                setPageIndex(0);
            }
        } catch (error) {
            console.error("Error deleting users:", error);
            toast.error("Failed to delete users");
        }
    };

    const handleUpdateSelected = () => {
        if (selectedUserIds.length === 0) return;
        setShowRoleDialog(true);
    };

    const confirmRoleUpdate = async () => {
        try {
            // Call the bulk-update API endpoint
            const response = await fetch("/api/users/bulk-update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userIds: selectedUserIds,
                    role: newRoleValue
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update users");
            }

            // After successful update, refresh the data
            const refreshResponse = await fetch('/api/users');
            if (!refreshResponse.ok) throw new Error('Failed to fetch users');
            const data = await refreshResponse.json();
            setUsers(data);
            setSelectedUsers({});
            setShowRoleDialog(false);
        } catch (error) {
            console.error("Error updating users:", error);
            toast.error("Failed to update users");
        }
    };

    const handleExportSelected = () => {
        try {
            // Get the users to export (either selected or all)
            const usersToExport = selectedCount > 0
                ? filteredAndSortedUsers.filter(user => selectedUsers[ user.id ])
                : filteredAndSortedUsers;

            // Create CSV header
            const visibleFields = [];
            if (visibleColumns.name) visibleFields.push('First Name', 'Last Name');
            if (visibleColumns.username) visibleFields.push('Username');
            if (visibleColumns.email) visibleFields.push('Email');
            if (visibleColumns.role) visibleFields.push('Role');
            if (visibleColumns.createdAt) visibleFields.push('Created At');

            const headers = visibleFields.join(',');

            // Create CSV rows
            const csvRows = usersToExport.map(user => {
                const values = [];
                if (visibleColumns.name) values.push(`"${user.firstName || ''}"`, `"${user.lastName || ''}"`);
                if (visibleColumns.username) values.push(`"${user.username || ''}"`);
                if (visibleColumns.email) values.push(`"${user.email || ''}"`);
                if (visibleColumns.role) values.push(`"${user.role}"`);
                if (visibleColumns.createdAt) values.push(`"${new Date(user.createdAt).toLocaleDateString()}"`);

                return values.join(',');
            });

            // Combine headers and rows
            const csv = [ headers, ...csvRows ].join('\n');

            // Create download
            const blob = new Blob([ csv ], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute(
                'download',
                `users_export_${new Date().toISOString().split('T')[ 0 ]}.csv`
            );
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error exporting users:", error);
            toast.error("Failed to export users");
        }
    };

    // Get role badge variant
    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case "admin": return "destructive";
            case "member": return "default";
            case "moderator": return "secondary";
            case "guest": return "outline";
            default: return "secondary";
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setRoleFilter([]);
    };

    const toggleRoleFilter = (role: string) => {
        setRoleFilter(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [ ...prev, role ]
        );
    };

    // Add individual user edit handler
    const handleEditUser = (user: User) => {
        setUserToEdit(user);
        setShowEditDialog(true);
    };

    // Add individual user delete handler
    const handleDeleteUser = (userId: string) => {
        setUserToDelete(userId);
        setShowDeleteUserDialog(true);
    };

    // Add individual user delete confirmation
    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(`/api/users/${userToDelete}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Failed to delete user");
            }

            // Refresh the data
            const refreshResponse = await fetch('/api/users');
            if (!refreshResponse.ok) throw new Error('Failed to fetch users');
            const data = await refreshResponse.json();
            setUsers(data);
            setUserToDelete(null);
            setShowDeleteUserDialog(false);
            toast.success("User deleted successfully");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    // Update edit form when a user is selected for editing
    useEffect(() => {
        if (userToEdit) {
            setEditFormData({
                firstName: userToEdit.firstName || '',
                lastName: userToEdit.lastName || '',
                username: userToEdit.username || '',
                role: userToEdit.role || 'member'
            });
        }
    }, [ userToEdit ]);

    // Handle input changes in the edit form
    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [ name ]: value
        }));
    };

    // Handle edit form submission
    const handleEditFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userToEdit) return;

        try {
            const response = await fetch(`/api/users/${userToEdit.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFormData),
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            // Refresh the data
            const refreshResponse = await fetch('/api/users');
            if (!refreshResponse.ok) throw new Error('Failed to fetch users');
            const data = await refreshResponse.json();
            setUsers(data);

            // Close the dialog and reset state
            setUserToEdit(null);
            setShowEditDialog(false);
            toast.success("User updated successfully");
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error("Failed to update user");
        }
    };

    const router = useRouter();

    // Add a permissions link/button in the dropdown menu for each user
    const renderActionMenu = (user: User) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {can(USER_UPDATE) && (
                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push(`/dashboard/users/${user.id}/permissions`)}>
                    <span className="flex items-center">
                        <Lock className="mr-2 h-4 w-4" />
                        Manage Permissions
                    </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {can(USER_DELETE) && (
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteUser(user.id)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    // Add a function to seed permissions
    const handleSeedPermissions = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/seed-permissions', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to seed permissions');
            }

            const data = await response.json();
            if (data.success) {
                toast.success(`${data.message}. User permissions are now available.`);
            } else {
                toast.error('Failed to seed permissions');
            }
        } catch (error) {
            console.error('Error seeding permissions:', error);
            toast.error('Failed to seed permissions');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 w-full relative">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Users</h1>
                <div className="flex gap-2">
                    {hasPermission('create') && (
                        <Link href="/dashboard/users/new">
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                New User
                            </Button>
                        </Link>
                    )}
                    {hasPermission('create') && (
                        <Button variant="outline" onClick={handleSeedPermissions}>
                            <Lock className="mr-2 h-4 w-4" />
                            Seed Permissions
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                {isLoading ? (
                    <div className="p-8 text-center">Loading users...</div>
                ) : (
                    <>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex flex-1 items-center space-x-2">
                                <Input
                                    placeholder="Filter users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 w-[150px] lg:w-[250px]"
                                />

                                {/* Role filter */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 border-dashed">
                                            Role
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuCheckboxItem
                                            checked={roleFilter.includes("admin")}
                                            onCheckedChange={() => toggleRoleFilter("admin")}
                                        >
                                            Admin
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={roleFilter.includes("member")}
                                            onCheckedChange={() => toggleRoleFilter("member")}
                                        >
                                            Member
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={roleFilter.includes("moderator")}
                                            onCheckedChange={() => toggleRoleFilter("moderator")}
                                        >
                                            Moderator
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={roleFilter.includes("guest")}
                                            onCheckedChange={() => toggleRoleFilter("guest")}
                                        >
                                            Guest
                                        </DropdownMenuCheckboxItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {(searchQuery || roleFilter.length > 0) && (
                                    <Button
                                        variant="ghost"
                                        onClick={resetFilters}
                                        className="h-8 px-2 lg:px-3"
                                    >
                                        <FilterX className="mr-2 h-4 w-4" />
                                        Reset filters
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                {hasPermission('export') && (
                                    <Button
                                        size="sm"
                                        onClick={handleExportSelected}
                                        variant="outline"
                                        className="h-8"
                                    >
                                        <FileDown className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                )}

                                {/* Column visibility */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8">
                                            Columns
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuCheckboxItem
                                            checked={visibleColumns.name}
                                            onCheckedChange={(checked) =>
                                                setVisibleColumns(prev => ({ ...prev, name: !!checked }))
                                            }
                                        >
                                            Name
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={visibleColumns.username}
                                            onCheckedChange={(checked) =>
                                                setVisibleColumns(prev => ({ ...prev, username: !!checked }))
                                            }
                                        >
                                            Username
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={visibleColumns.email}
                                            onCheckedChange={(checked) =>
                                                setVisibleColumns(prev => ({ ...prev, email: !!checked }))
                                            }
                                        >
                                            Email
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={visibleColumns.role}
                                            onCheckedChange={(checked) =>
                                                setVisibleColumns(prev => ({ ...prev, role: !!checked }))
                                            }
                                        >
                                            Role
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            checked={visibleColumns.createdAt}
                                            onCheckedChange={(checked) =>
                                                setVisibleColumns(prev => ({ ...prev, createdAt: !!checked }))
                                            }
                                        >
                                            Created At
                                        </DropdownMenuCheckboxItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="w-full overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedCount > 0 && selectedCount === filteredAndSortedUsers.length}
                                                onCheckedChange={toggleAllSelection}
                                                aria-label="Select all users"
                                            />
                                        </TableHead>
                                        {visibleColumns.name && (
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => toggleSort('name')}
                                                    className="p-0 hover:bg-transparent"
                                                >
                                                    Name
                                                    <ChevronDown className={`ml-2 h-4 w-4 ${sortField === 'name' ? 'opacity-100' : 'opacity-50'} 
                                                    ${sortField === 'name' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </TableHead>
                                        )}
                                        {visibleColumns.username && (
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => toggleSort('username')}
                                                    className="p-0 hover:bg-transparent"
                                                >
                                                    Username
                                                    <ChevronDown className={`ml-2 h-4 w-4 ${sortField === 'username' ? 'opacity-100' : 'opacity-50'} 
                                                    ${sortField === 'username' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </TableHead>
                                        )}
                                        {visibleColumns.email && (
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => toggleSort('email')}
                                                    className="p-0 hover:bg-transparent"
                                                >
                                                    Email
                                                    <ChevronDown className={`ml-2 h-4 w-4 ${sortField === 'email' ? 'opacity-100' : 'opacity-50'} 
                                                    ${sortField === 'email' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </TableHead>
                                        )}
                                        {visibleColumns.role && (
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => toggleSort('role')}
                                                    className="p-0 hover:bg-transparent"
                                                >
                                                    Role
                                                    <ChevronDown className={`ml-2 h-4 w-4 ${sortField === 'role' ? 'opacity-100' : 'opacity-50'} 
                                                    ${sortField === 'role' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </TableHead>
                                        )}
                                        {visibleColumns.createdAt && (
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => toggleSort('createdAt')}
                                                    className="p-0 hover:bg-transparent"
                                                >
                                                    Created
                                                    <ChevronDown className={`ml-2 h-4 w-4 ${sortField === 'createdAt' ? 'opacity-100' : 'opacity-50'} 
                                                    ${sortField === 'createdAt' && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                                                </Button>
                                            </TableHead>
                                        )}
                                        {visibleColumns.actions && (
                                            <TableHead className="w-[80px]">Actions</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="h-24 text-center">
                                                No users found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedUsers.map(user => (
                                            <TableRow key={user.id} data-state={selectedUsers[ user.id ] ? "selected" : undefined}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={!!selectedUsers[ user.id ]}
                                                        onCheckedChange={() => toggleUserSelection(user.id)}
                                                        aria-label={`Select user ${user.firstName || ''} ${user.lastName || ''}`}
                                                    />
                                                </TableCell>
                                                {visibleColumns.name && (
                                                    <TableCell>
                                                        {user.firstName && user.lastName
                                                            ? `${user.firstName} ${user.lastName}`
                                                            : "Unnamed User"
                                                        }
                                                    </TableCell>
                                                )}
                                                {visibleColumns.username && (
                                                    <TableCell>{user.username || "-"}</TableCell>
                                                )}
                                                {visibleColumns.email && (
                                                    <TableCell>{user.email || "-"}</TableCell>
                                                )}
                                                {visibleColumns.role && (
                                                    <TableCell>
                                                        <Badge variant={getRoleBadgeVariant(user.role)}>
                                                            {user.role}
                                                        </Badge>
                                                    </TableCell>
                                                )}
                                                {visibleColumns.createdAt && (
                                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                                )}
                                                {visibleColumns.actions && (
                                                    <TableCell>
                                                        {renderActionMenu(user)}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-4 border-t">
                            <div className="flex-1 text-sm text-muted-foreground">
                                {selectedCount > 0 ? (
                                    <span className="font-medium">{selectedCount} of {filteredAndSortedUsers.length} row(s) selected.</span>
                                ) : (
                                    <span className="font-medium">{filteredAndSortedUsers.length} rows</span>
                                )}
                            </div>
                            <div className="flex items-center space-x-6 lg:space-x-8">
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium">Rows per page</p>
                                    <select
                                        className="h-8 w-[70px] rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                                        value={pageSize}
                                        onChange={e => {
                                            setPageSize(Number(e.target.value));
                                            setPageIndex(0);
                                        }}
                                    >
                                        {[ 5, 10, 20, 30, 40, 50 ].map(size => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center justify-center text-sm font-medium">
                                    Page {pageIndex + 1} of {Math.max(1, pageCount)}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setPageIndex(0)}
                                        disabled={pageIndex === 0}
                                        aria-label="Go to first page"
                                    >
                                        <span className="sr-only">Go to first page</span>
                                        <span>«</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setPageIndex(pageIndex - 1)}
                                        disabled={pageIndex === 0}
                                        aria-label="Go to previous page"
                                    >
                                        <span className="sr-only">Go to previous page</span>
                                        <span>‹</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setPageIndex(pageIndex + 1)}
                                        disabled={pageIndex >= pageCount - 1}
                                        aria-label="Go to next page"
                                    >
                                        <span className="sr-only">Go to next page</span>
                                        <span>›</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-8 w-8 p-0"
                                        onClick={() => setPageIndex(pageCount - 1)}
                                        disabled={pageIndex >= pageCount - 1}
                                        aria-label="Go to last page"
                                    >
                                        <span className="sr-only">Go to last page</span>
                                        <span>»</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Selection action buttons */}
            {selectedCount > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-background border shadow-md rounded-lg p-2 flex space-x-2 z-10">
                    <span className="py-2 px-3 bg-muted rounded-md text-sm font-medium">
                        {selectedCount} selected
                    </span>
                    {hasPermission('delete') && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteSelected}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    )}
                    {hasPermission('edit') && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUpdateSelected}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Change Role
                        </Button>
                    )}
                    {hasPermission('export') && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportSelected}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                    )}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Users</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedUserIds.length} users? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Role Update Dialog */}
            <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Update User Roles</AlertDialogTitle>
                        <AlertDialogDescription>
                            Change the role for {selectedUserIds.length} selected users.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Select
                            value={newRoleValue}
                            onValueChange={setNewRoleValue}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="guest">Guest</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRoleUpdate}>
                            Update Roles
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Single User Dialog */}
            <AlertDialog open={showDeleteUserDialog} onOpenChange={setShowDeleteUserDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteUser}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit User Dialog */}
            <Dialog open={showEditDialog} onOpenChange={(open) => {
                setShowEditDialog(open);
                if (!open) setUserToEdit(null);
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Make changes to the user&apos;s information.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditFormSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="firstName" className="text-right">
                                    First Name
                                </Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={editFormData.firstName}
                                    onChange={handleEditFormChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="lastName" className="text-right">
                                    Last Name
                                </Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={editFormData.lastName}
                                    onChange={handleEditFormChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="username" className="text-right">
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={editFormData.username}
                                    onChange={handleEditFormChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">
                                    Role
                                </Label>
                                <Select
                                    value={editFormData.role}
                                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, role: value }))}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                        <SelectItem value="moderator">Moderator</SelectItem>
                                        <SelectItem value="guest">Guest</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
} 