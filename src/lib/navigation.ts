import { User } from '@/types/user';
import { NavItem } from '@/types';
import { navItems } from '@/constants/data';
import { hasPermission } from './permissions';
import {
    SCHEDULE_CREATE,
    BUILDING_CREATE,
    FLOOR_CREATE,
    ROOM_CREATE,
    ASSET_DEPLOY
} from '@/constants/permissions';

/**
 * Filter navigation items based on user permissions
 */
export function getFilteredNavItems(user: User | null | undefined): NavItem[] {
    if (!user) return [];

    // Admin can see everything
    if (user.role === 'admin') return navItems;

    // Get user role for role-based checks
    const userRole = user.role;
    console.log('Navigation filter - User role:', userRole);

    // Check if user is moderator/technician
    const isModeratorOrAdmin = [ 'admin', 'technician', 'moderator', 'manager' ].includes(userRole);
    console.log('Is moderator or admin:', isModeratorOrAdmin);

    // Create a new array with filtered navigation items
    return navItems.filter(item => {
        // Check if item requires specific permission
        if (item.permissionRequired) {
            return hasPermission(user, item.permissionRequired);
        }

        // Keep all other items by default
        return true;
    }).map(item => {
        // If the item has sub-items, filter those too
        if (item.items && item.items.length > 0) {
            const filteredItems = item.items.filter(subItem => {
                // Check if sub-item requires specific permission
                if (subItem.permissionRequired) {
                    return hasPermission(user, subItem.permissionRequired);
                }

                // Keep other sub-items by default
                return true;
            });

            return {
                ...item,
                items: filteredItems
            };
        }

        return item;
    });
}

/**
 * Check if user can create schedules
 */
export function canCreateSchedule(user: User | null | undefined): boolean {
    return hasPermission(user, SCHEDULE_CREATE);
}

/**
 * Check if user can create buildings
 */
export function canCreateBuilding(user: User | null | undefined): boolean {
    return hasPermission(user, BUILDING_CREATE);
}

/**
 * Check if user can create floors
 */
export function canCreateFloor(user: User | null | undefined): boolean {
    return hasPermission(user, FLOOR_CREATE);
}

/**
 * Check if user can create rooms
 */
export function canCreateRoom(user: User | null | undefined): boolean {
    return hasPermission(user, ROOM_CREATE);
}

/**
 * Check if user can deploy assets
 */
export function canDeployAsset(user: User | null | undefined): boolean {
    return hasPermission(user, ASSET_DEPLOY);
} 