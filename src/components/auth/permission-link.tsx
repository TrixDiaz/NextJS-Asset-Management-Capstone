'use client';

import { ReactNode } from 'react';
import Link, { LinkProps } from 'next/link';
import { User } from '@/types/user';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionLinkProps extends LinkProps {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    role?: string;
    roles?: string[];
    user: User | null | undefined;
    children: ReactNode;
    className?: string;
}

/**
 * Link component that only renders if the user has the required permissions
 */
export function PermissionLink({
    permission,
    permissions = [],
    requireAll = false,
    role,
    roles = [],
    user,
    children,
    className,
    ...props
}: PermissionLinkProps) {
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

    return (
        <Link className={className} {...props}>
            {children}
        </Link>
    );
} 