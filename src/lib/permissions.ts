import { User, UserPermission, Role } from "@/types/user";
import {
    ADMIN_PERMISSIONS,
    TECHNICIAN_PERMISSIONS,
    MEMBER_PERMISSIONS,
    GUEST_PERMISSIONS,
    CREATE_PERMISSIONS,
    EDIT_PERMISSIONS,
    DELETE_PERMISSIONS
} from "@/constants/permissions";

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | undefined | null, permissionCode: string): boolean {
    if (!user) return false;

    // Admins have all permissions
    if (user.role === 'admin') return true;

    // Check role-based permissions
    if ((user.role === 'technician' || user.role === 'manager') && TECHNICIAN_PERMISSIONS.includes(permissionCode)) return true;
    if ((user.role === 'member' || user.role === 'user') && MEMBER_PERMISSIONS.includes(permissionCode)) return true;
    if (user.role === 'guest' && GUEST_PERMISSIONS.includes(permissionCode)) return true;

    // Check user-specific permissions
    if (user.permissions) {
        return user.permissions.some(p => p.permission.code === permissionCode);
    }

    return false;
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(user: User | undefined | null, permissionCodes: string[]): boolean {
    if (!user) return false;
    return permissionCodes.some(code => hasPermission(user, code));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(user: User | undefined | null, permissionCodes: string[]): boolean {
    if (!user) return false;
    return permissionCodes.every(code => hasPermission(user, code));
}

/**
 * Get all permission codes from a user
 */
export function getUserPermissionCodes(user: User | undefined | null): string[] {
    if (!user) return [];

    // Get role-based permissions
    let permissions: string[] = [];
    if (user.role === 'admin') permissions = [ ...ADMIN_PERMISSIONS ];
    else if (user.role === 'technician' || user.role === 'manager') permissions = [ ...TECHNICIAN_PERMISSIONS ];
    else if (user.role === 'member' || user.role === 'user') permissions = [ ...MEMBER_PERMISSIONS ];
    else if (user.role === 'guest') permissions = [ ...GUEST_PERMISSIONS ];

    // Add user-specific permissions
    if (user.permissions) {
        const userSpecificPermissions = user.permissions.map(p => p.permission.code);
        // Add any permissions not already included
        userSpecificPermissions.forEach(p => {
            if (!permissions.includes(p)) {
                permissions.push(p);
            }
        });
    }

    return permissions;
}

/**
 * Get default permissions for a role
 */
export function getDefaultPermissionsForRole(role: Role): string[] {
    switch (role) {
        case 'admin': return ADMIN_PERMISSIONS;
        case 'technician':
        case 'manager': return TECHNICIAN_PERMISSIONS;
        case 'member':
        case 'user': return MEMBER_PERMISSIONS;
        case 'guest': return GUEST_PERMISSIONS;
        default: return [];
    }
}

/**
 * Check if user can create resources
 */
export function canCreate(user: User | undefined | null): boolean {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'technician' || user.role === 'manager') return true;
    return hasAnyPermission(user, CREATE_PERMISSIONS);
}

/**
 * Check if user can edit resources
 */
export function canEdit(user: User | undefined | null): boolean {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'technician' || user.role === 'manager') return true;
    return hasAnyPermission(user, EDIT_PERMISSIONS);
}

/**
 * Check if user can delete resources
 */
export function canDelete(user: User | undefined | null): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return hasAnyPermission(user, DELETE_PERMISSIONS);
} 