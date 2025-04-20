'use client';

import { ReactNode } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { User } from '@/types/user';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionButtonProps extends ButtonProps {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    role?: string;
    roles?: string[];
    user: User | null | undefined;
    children: ReactNode;
}

/**
 * Button that is only shown to users with the required permissions
 */
export function PermissionButton({
    permission,
    permissions = [],
    requireAll = false,
    role,
    roles = [],
    user,
    children,
    ...props
}: PermissionButtonProps) {
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
        return null;
    }

    return <Button {...props}>{children}</Button>;
} 