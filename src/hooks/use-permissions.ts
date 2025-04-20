'use client';

import { useMemo } from 'react';
import { User } from '@/types/user';
import {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canCreate,
    canEdit,
    canDelete
} from '@/lib/permissions';

/**
 * Hook for checking permissions in React components
 * @param user The current user object
 * @returns Object with permission checking functions
 */
export function usePermissions(user: User | null | undefined) {
    return useMemo(() => ({
        /**
         * Check if the user has a specific permission
         */
        can: (permissionCode: string) => hasPermission(user, permissionCode),

        /**
         * Check if the user has any of the specified permissions
         */
        canAny: (permissionCodes: string[]) => hasAnyPermission(user, permissionCodes),

        /**
         * Check if the user has all of the specified permissions
         */
        canAll: (permissionCodes: string[]) => hasAllPermissions(user, permissionCodes),

        /**
         * Check if the user has a specific role
         */
        isRole: (role: string) => user?.role === role,

        /**
         * Check if the user has any of the specified roles
         */
        isAnyRole: (roles: string[]) => user ? roles.includes(user.role) : false,

        /**
         * Check if user can see create/add buttons
         */
        canShowCreateButton: () => canCreate(user),

        /**
         * Check if user can see edit buttons/actions
         */
        canShowEditButton: () => canEdit(user),

        /**
         * Check if user can see delete buttons/actions
         */
        canShowDeleteButton: () => canDelete(user),

        /**
         * Check if user is an admin
         */
        isAdmin: () => user?.role === 'admin',

        /**
         * Check if user is a technician (moderator)
         */
        isTechnician: () => user?.role === 'technician' || user?.role === 'manager',

        /**
         * Check if user is a member (professor)
         */
        isMember: () => user?.role === 'member' || user?.role === 'user',

        /**
         * Check if user can manage (admin or technician)
         */
        canManage: () => user?.role === 'admin' || user?.role === 'technician' || user?.role === 'manager'
    }), [ user ]);
} 