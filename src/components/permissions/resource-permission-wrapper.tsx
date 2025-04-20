'use client';

import React from 'react';
import { useCurrentUser } from '@/components/providers/current-user-provider';
import { useResourcePermissions } from '@/hooks/use-resource-permissions';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ResourcePermissionWrapperProps {
    resourceType: string;
    children: React.ReactNode;
    title: string;
    createHref?: string;
    showCreateButton?: boolean;
    onCreateClick?: () => void;
}

export function ResourcePermissionWrapper({
    resourceType,
    children,
    title,
    createHref,
    showCreateButton = true,
    onCreateClick
}: ResourcePermissionWrapperProps) {
    const { user, isLoading } = useCurrentUser();
    const { canCreate } = useResourcePermissions(user, resourceType);

    // If loading, show a simple loading state
    if (isLoading) {
        return <div className="p-6 flex justify-center">Loading...</div>;
    }

    return (
        <div className="p-6 space-y-6 w-full relative">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{title}</h1>

                {showCreateButton && canCreate() && (
                    <div>
                        {createHref ? (
                            <Link href={createHref}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add {resourceType}
                                </Button>
                            </Link>
                        ) : onCreateClick ? (
                            <Button onClick={onCreateClick}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add {resourceType}
                            </Button>
                        ) : null}
                    </div>
                )}
            </div>

            {children}
        </div>
    );
}

interface ResourceActionButtonsProps {
    resourceType: string;
    onEdit?: () => void;
    onDelete?: () => void;
    editHref?: string;
    deleteHref?: string;
    showEdit?: boolean;
    showDelete?: boolean;
}

export function ResourceActionButtons({
    resourceType,
    onEdit,
    onDelete,
    editHref,
    deleteHref,
    showEdit = true,
    showDelete = true
}: ResourceActionButtonsProps) {
    const { user } = useCurrentUser();
    const { canEdit, canDelete } = useResourcePermissions(user, resourceType);

    return (
        <div className="flex space-x-2">
            {showEdit && canEdit() && (
                <>
                    {editHref ? (
                        <Link href={editHref}>
                            <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>
                    ) : onEdit ? (
                        <Button variant="outline" size="sm" onClick={onEdit}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                    ) : null}
                </>
            )}

            {showDelete && canDelete() && (
                <>
                    {deleteHref ? (
                        <Link href={deleteHref}>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </Link>
                    ) : onDelete ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onDelete}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    ) : null}
                </>
            )}
        </div>
    );
} 