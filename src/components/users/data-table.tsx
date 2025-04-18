"use client"

import React, { useState } from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import {
    ChevronDown,
    Download,
    FileDown,
    FilterX,
    MoreHorizontal,
    Pencil,
    Settings,
    Trash2,
    User,
} from "lucide-react"
import Link from "next/link"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { UserTableItem, Role } from "@/types/user"

interface DataTableProps {
    data: UserTableItem[]
}

export function DataTable({ data }: DataTableProps) {
    const [ sorting, setSorting ] = useState<SortingState>([])
    const [ columnFilters, setColumnFilters ] = useState<ColumnFiltersState>([])
    const [ columnVisibility, setColumnVisibility ] = useState<VisibilityState>({})
    const [ rowSelection, setRowSelection ] = useState({})
    const [ showDeleteDialog, setShowDeleteDialog ] = useState(false)
    const [ userToDelete, setUserToDelete ] = useState<string | null>(null)
    const [ showBulkDeleteDialog, setShowBulkDeleteDialog ] = useState(false)
    const [ showBulkStatusDialog, setShowBulkStatusDialog ] = useState(false)
    const [ bulkStatusValue, setBulkStatusValue ] = useState<Role>("user")

    // User role badge color mapping
    const getRoleBadgeVariant = (role: Role) => {
        switch (role) {
            case "admin":
                return "destructive"
            case "manager":
                return "default"
            case "user":
                return "secondary"
            case "guest":
                return "outline"
            default:
                return "secondary"
        }
    }

    const columns: ColumnDef<UserTableItem>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const user = row.original
                return (
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                            {user.profileImageUrl ? (
                                <img
                                    src={user.profileImageUrl}
                                    alt={`${user.firstName || ""} ${user.lastName || ""}`}
                                    className="h-8 w-8 rounded-full"
                                />
                            ) : (
                                <User className="h-4 w-4 text-slate-500" />
                            )}
                        </div>
                        <div>
                            {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : "Unnamed User"}
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "username",
            header: "Username",
            cell: ({ row }) => <div>{row.original.username || "-"}</div>,
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div>{row.original.email || "-"}</div>,
        },
        {
            accessorKey: "role",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Role
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const role = row.original.role as Role
                return (
                    <Badge variant={getRoleBadgeVariant(role)}>
                        {role}
                    </Badge>
                )
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
            enableSorting: true,
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Added
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const date = new Date(row.original.createdAt)
                return (
                    <div title={date.toLocaleString()}>
                        {formatDistanceToNow(date, { addSuffix: true })}
                    </div>
                )
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const user = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/users/${user.id}`}>
                                    <User className="mr-2 h-4 w-4" />
                                    View Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/users/${user.id}/edit`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit User
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setUserToDelete(user.id)
                                    setShowDeleteDialog(true)
                                }}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        try {
            const response = await fetch(`/api/users/${userToDelete}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete user")
            }

            toast.success("User deleted successfully")
            setUserToDelete(null)
            setShowDeleteDialog(false)
            // In a real app, you would refresh the data here
        } catch (error) {
            toast.error("Failed to delete user", {
                description:
                    error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    }

    const handleBulkDelete = async () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        const userIds = selectedRows.map((row) => row.original.id)

        try {
            const response = await fetch("/api/users/bulk-delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userIds }),
            })

            if (!response.ok) {
                throw new Error("Failed to delete users")
            }

            toast.success(`${userIds.length} users deleted successfully`)
            setRowSelection({})
            setShowBulkDeleteDialog(false)
            // In a real app, you would refresh the data here
        } catch (error) {
            toast.error("Failed to delete users", {
                description:
                    error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    }

    const handleBulkStatusChange = async () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        const userIds = selectedRows.map((row) => row.original.id)

        try {
            const response = await fetch("/api/users/bulk-update", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userIds, role: bulkStatusValue }),
            })

            if (!response.ok) {
                throw new Error("Failed to update users")
            }

            toast.success(
                `${userIds.length} users updated to ${bulkStatusValue} successfully`
            )
            setRowSelection({})
            setShowBulkStatusDialog(false)
            // In a real app, you would refresh the data here
        } catch (error) {
            toast.error("Failed to update users", {
                description:
                    error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    }

    const handleExportCSV = () => {
        try {
            // Get visible columns that aren't actions
            const exportColumns = table
                .getAllColumns()
                .filter(
                    (column) =>
                        column.getIsVisible() &&
                        column.id !== "actions" &&
                        column.id !== "select"
                )

            // Get either all rows or just the selected ones
            const rows =
                Object.keys(rowSelection).length > 0
                    ? table.getFilteredSelectedRowModel().rows
                    : table.getFilteredRowModel().rows

            // Create CSV header
            const headers = exportColumns.map((column) => {
                return column.id === "name"
                    ? "First Name,Last Name"
                    : column.id.charAt(0).toUpperCase() + column.id.slice(1)
            }).join(",")

            // Create CSV rows
            const csvRows = rows.map((row) => {
                return exportColumns
                    .map((column) => {
                        // Handle special case for name (needs to be split)
                        if (column.id === "name") {
                            return `"${row.original.firstName || ""}","${row.original.lastName || ""}"`
                        }

                        // Handle all other columns
                        const value = column.accessorFn?.(row.original) ?? ""
                        return typeof value === "object" ? `"${JSON.stringify(value)}"` : `"${value}"`
                    })
                    .join(",")
            })

            // Combine headers and rows
            const csv = [ headers, ...csvRows ].join("\n")

            // Create download
            const blob = new Blob([ csv ], { type: "text/csv;charset=utf-8;" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute(
                "download",
                `users_export_${new Date().toISOString().split("T")[ 0 ]}.csv`
            )
            link.style.visibility = "hidden"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success("Users exported successfully")
        } catch (error) {
            toast.error("Failed to export users", {
                description:
                    error instanceof Error ? error.message : "Unknown error occurred",
            })
        }
    }

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    })

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    <Input
                        placeholder="Filter users..."
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                    {table.getColumn("role") && (
                        <DataTableFacetedFilter
                            column={table.getColumn("role")}
                            title="Role"
                            options={[
                                { label: "Admin", value: "admin" },
                                { label: "Manager", value: "manager" },
                                { label: "User", value: "user" },
                                { label: "Guest", value: "guest" },
                            ]}
                        />
                    )}
                    {table.getState().columnFilters.length > 0 && (
                        <Button
                            variant="ghost"
                            onClick={() => table.resetColumnFilters()}
                            className="h-8 px-2 lg:px-3"
                        >
                            <FilterX className="mr-2 h-4 w-4" />
                            Reset filters
                        </Button>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {Object.keys(rowSelection).length > 0 && (
                        <div className="flex items-center space-x-2">
                            <Button
                                size="sm"
                                onClick={() => setShowBulkDeleteDialog(true)}
                                variant="destructive"
                                className="h-8"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete ({Object.keys(rowSelection).length})
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setShowBulkStatusDialog(true)}
                                variant="outline"
                                className="h-8"
                            >
                                <Settings className="mr-2 h-4 w-4" />
                                Change Role
                            </Button>
                        </div>
                    )}
                    <Button
                        size="sm"
                        onClick={handleExportCSV}
                        variant="outline"
                        className="h-8"
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <DataTableViewOptions table={table} />
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />

            {/* Delete single user confirmation dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            and remove their data from our servers.
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
            <AlertDialog
                open={showBulkDeleteDialog}
                onOpenChange={setShowBulkDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Multiple Users</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {Object.keys(rowSelection).length}{" "}
                            users? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Users
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk status change dialog */}
            <AlertDialog
                open={showBulkStatusDialog}
                onOpenChange={setShowBulkStatusDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Change Role for Multiple Users</AlertDialogTitle>
                        <AlertDialogDescription>
                            Select a new role for the {Object.keys(rowSelection).length} selected users.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <div className="flex flex-col gap-4">
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={bulkStatusValue}
                                onChange={(e) => setBulkStatusValue(e.target.value as Role)}
                            >
                                <option value="admin">Admin</option>
                                <option value="manager">Manager</option>
                                <option value="user">User</option>
                                <option value="guest">Guest</option>
                            </select>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkStatusChange}>
                            Update Role
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
} 