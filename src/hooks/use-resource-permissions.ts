'use client';

import { usePermissions } from './use-permissions';
import { User } from '@/types/user';
import * as permConstants from '@/constants/permissions';

/**
 * Hook to check permissions for specific resources
 * Simplifies permission checking across different resource pages
 * 
 * @param user The current user
 * @param resourceType The type of resource (building, floor, room, etc.)
 */
export function useResourcePermissions(user: User | null | undefined, resourceType: string) {
    // Get the base permissions API
    const permissionsApi = usePermissions(user as any);
    const { can } = permissionsApi;

    // Construct permission codes for this resource
    const readPermission = `${resourceType.toUpperCase()}_READ`;
    const createPermission = `${resourceType.toUpperCase()}_CREATE`;
    const updatePermission = `${resourceType.toUpperCase()}_UPDATE`;
    const deletePermission = `${resourceType.toUpperCase()}_DELETE`;

    // Filter out only string-type permission constants (not arrays or objects)
    const getPermissionConstant = (key: string): string | null => {
        const value = (permConstants as any)[ key ];
        return typeof value === 'string' ? value : null;
    };

    return {
        // Permission check functions
        canRead: () => {
            const permission = getPermissionConstant(readPermission);
            return permission ? can(permission) : false;
        },
        canCreate: () => {
            const permission = getPermissionConstant(createPermission);
            return permission ? can(permission) : false;
        },
        canEdit: () => {
            const permission = getPermissionConstant(updatePermission);
            return permission ? can(permission) : false;
        },
        canDelete: () => {
            const permission = getPermissionConstant(deletePermission);
            return permission ? can(permission) : false;
        },

        // Direct access to specific permission codes
        readPermission: getPermissionConstant(readPermission),
        createPermission: getPermissionConstant(createPermission),
        updatePermission: getPermissionConstant(updatePermission),
        deletePermission: getPermissionConstant(deletePermission),

        // Pass through other permission methods
        ...permissionsApi,
    };
} 