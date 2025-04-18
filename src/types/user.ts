export type Role = 'admin' | 'manager' | 'user' | 'guest';

export interface Permission {
    id: string;
    name: string;
    description: string;
    code: string;
}

export interface UserPermission {
    userId: string;
    permissionId: string;
    permission: Permission;
}

export interface User {
    id: string;
    clerkId: string;
    firstName: string | null;
    lastName: string | null;
    username: string | null;
    email: string | null;
    profileImageUrl: string | null;
    role: Role;
    permissions?: UserPermission[];
    createdAt: Date;
    updatedAt: Date;
}

export interface UserTableItem extends Omit<User, 'permissions' | 'createdAt' | 'updatedAt'> {
    createdAt: string;
    updatedAt: string;
    permissions?: string[];
} 