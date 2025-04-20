'use client';

import { ReactNode } from 'react';
import { User } from '@/types/user';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionGuardProps {
    children: ReactNode;
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    role?: string;
    roles?: string[];
    user: User | null | undefined;
    fallback?: ReactNode;
}

/**
 * Component that conditionally renders content based on user permissions
 */
export function PermissionGuard({
    children,
    permission,
    permissions = [],
    requireAll = false,
    role,
    roles = [],
    user,
    fallback = null
}: PermissionGuardProps) {
    const { can, canAny, canAll, isRole, isAnyRole } = usePermissions(user);

    // Check permissions
    const allPermissionsToCheck = permission ? [ permission, ...permissions ] : permissions;

    let hasAccess = true;

    if (allPermissionsToCheck.length > 0) {
        hasAccess = requireAll
            ? canAll(allPermissionsToCheck)
            : canAny(allPermissionsToCheck);
    }

    // Check roles
    const allRolesToCheck = role ? [ role, ...roles ] : roles;

    if (allRolesToCheck.length > 0) {
        const hasRole = isAnyRole(allRolesToCheck);
        hasAccess = hasAccess && hasRole;
    }

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
} 