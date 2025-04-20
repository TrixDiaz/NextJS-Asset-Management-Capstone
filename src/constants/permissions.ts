// Resource-based permissions for the application
// Each permission follows the format: ${resource}_${action}

// User permissions
export const USER_READ = 'user_read';
export const USER_CREATE = 'user_create';
export const USER_UPDATE = 'user_update';
export const USER_DELETE = 'user_delete';

// Logs permissions
export const LOGS_READ = 'logs_read';

// Ticketing permissions
export const TICKET_READ = 'ticket_read';
export const TICKET_CREATE = 'ticket_create';
export const TICKET_UPDATE = 'ticket_update';
export const TICKET_DELETE = 'ticket_delete';
export const TICKET_ASSIGN = 'ticket_assign';
export const TICKET_RESOLVE = 'ticket_resolve';

// Kanban permissions
export const KANBAN_READ = 'kanban_read';
export const KANBAN_CREATE = 'kanban_create';
export const KANBAN_UPDATE = 'kanban_update';
export const KANBAN_DELETE = 'kanban_delete';

// Schedule permissions
export const SCHEDULE_READ = 'schedule_read';
export const SCHEDULE_CREATE = 'schedule_create';
export const SCHEDULE_UPDATE = 'schedule_update';
export const SCHEDULE_DELETE = 'schedule_delete';

// Report permissions
export const REPORT_READ = 'report_read';
export const REPORT_CREATE = 'report_create';
export const REPORT_EXPORT = 'report_export';

// Storage permissions
export const STORAGE_READ = 'storage_read';
export const STORAGE_CREATE = 'storage_create';
export const STORAGE_UPDATE = 'storage_update';
export const STORAGE_DELETE = 'storage_delete';

// Building permissions
export const BUILDING_READ = 'building_read';
export const BUILDING_CREATE = 'building_create';
export const BUILDING_UPDATE = 'building_update';
export const BUILDING_DELETE = 'building_delete';

// Floor permissions
export const FLOOR_READ = 'floor_read';
export const FLOOR_CREATE = 'floor_create';
export const FLOOR_UPDATE = 'floor_update';
export const FLOOR_DELETE = 'floor_delete';

// Room permissions
export const ROOM_READ = 'room_read';
export const ROOM_CREATE = 'room_create';
export const ROOM_UPDATE = 'room_update';
export const ROOM_DELETE = 'room_delete';

// Asset permissions
export const ASSET_READ = 'asset_read';
export const ASSET_CREATE = 'asset_create';
export const ASSET_UPDATE = 'asset_update';
export const ASSET_DELETE = 'asset_delete';
export const ASSET_DEPLOY = 'asset_deploy';

// Permission groups by role
export const ADMIN_PERMISSIONS = [
    // Admin has all permissions
    USER_READ, USER_CREATE, USER_UPDATE, USER_DELETE,
    LOGS_READ,
    TICKET_READ, TICKET_CREATE, TICKET_UPDATE, TICKET_DELETE, TICKET_ASSIGN, TICKET_RESOLVE,
    KANBAN_READ, KANBAN_CREATE, KANBAN_UPDATE, KANBAN_DELETE,
    SCHEDULE_READ, SCHEDULE_CREATE, SCHEDULE_UPDATE, SCHEDULE_DELETE,
    REPORT_READ, REPORT_CREATE, REPORT_EXPORT,
    STORAGE_READ, STORAGE_CREATE, STORAGE_UPDATE, STORAGE_DELETE,
    BUILDING_READ, BUILDING_CREATE, BUILDING_UPDATE, BUILDING_DELETE,
    FLOOR_READ, FLOOR_CREATE, FLOOR_UPDATE, FLOOR_DELETE,
    ROOM_READ, ROOM_CREATE, ROOM_UPDATE, ROOM_DELETE,
    ASSET_READ, ASSET_CREATE, ASSET_UPDATE, ASSET_DELETE, ASSET_DEPLOY
];

export const TECHNICIAN_PERMISSIONS = [
    // Technician/Moderator can do everything except delete
    USER_READ, USER_CREATE, USER_UPDATE,
    LOGS_READ,
    TICKET_READ, TICKET_CREATE, TICKET_UPDATE, TICKET_ASSIGN, TICKET_RESOLVE,
    KANBAN_READ, KANBAN_CREATE, KANBAN_UPDATE,
    SCHEDULE_READ, SCHEDULE_CREATE, SCHEDULE_UPDATE,
    REPORT_READ, REPORT_CREATE, REPORT_EXPORT,
    STORAGE_READ, STORAGE_CREATE, STORAGE_UPDATE,
    BUILDING_READ, BUILDING_CREATE, BUILDING_UPDATE,
    FLOOR_READ, FLOOR_CREATE, FLOOR_UPDATE,
    ROOM_READ, ROOM_CREATE, ROOM_UPDATE,
    ASSET_READ, ASSET_CREATE, ASSET_UPDATE, ASSET_DEPLOY
];

export const MEMBER_PERMISSIONS = [
    // Member/Professor can only read specific resources
    TICKET_READ, TICKET_CREATE,
    KANBAN_READ,
    SCHEDULE_READ,
    BUILDING_READ,
    FLOOR_READ,
    ROOM_READ,
    ASSET_READ, ASSET_DEPLOY
];

// Legacy permission arrays - kept for backward compatibility
export const MANAGER_PERMISSIONS = TECHNICIAN_PERMISSIONS;
export const USER_PERMISSIONS = MEMBER_PERMISSIONS;
export const GUEST_PERMISSIONS = [];

// Resource groups for UI organization
export const PERMISSION_GROUPS = [
    {
        name: 'User Management',
        permissions: [ USER_READ, USER_CREATE, USER_UPDATE, USER_DELETE ]
    },
    {
        name: 'Logs',
        permissions: [ LOGS_READ ]
    },
    {
        name: 'Ticketing',
        permissions: [ TICKET_READ, TICKET_CREATE, TICKET_UPDATE, TICKET_DELETE, TICKET_ASSIGN, TICKET_RESOLVE ]
    },
    {
        name: 'Kanban',
        permissions: [ KANBAN_READ, KANBAN_CREATE, KANBAN_UPDATE, KANBAN_DELETE ]
    },
    {
        name: 'Scheduling',
        permissions: [ SCHEDULE_READ, SCHEDULE_CREATE, SCHEDULE_UPDATE, SCHEDULE_DELETE ]
    },
    {
        name: 'Reports',
        permissions: [ REPORT_READ, REPORT_CREATE, REPORT_EXPORT ]
    },
    {
        name: 'Storage',
        permissions: [ STORAGE_READ, STORAGE_CREATE, STORAGE_UPDATE, STORAGE_DELETE ]
    },
    {
        name: 'Buildings',
        permissions: [ BUILDING_READ, BUILDING_CREATE, BUILDING_UPDATE, BUILDING_DELETE ]
    },
    {
        name: 'Floors',
        permissions: [ FLOOR_READ, FLOOR_CREATE, FLOOR_UPDATE, FLOOR_DELETE ]
    },
    {
        name: 'Rooms',
        permissions: [ ROOM_READ, ROOM_CREATE, ROOM_UPDATE, ROOM_DELETE ]
    },
    {
        name: 'Assets',
        permissions: [ ASSET_READ, ASSET_CREATE, ASSET_UPDATE, ASSET_DELETE, ASSET_DEPLOY ]
    }
];

// Permission display names for UI
export const PERMISSION_DISPLAY_NAMES: Record<string, string> = {
    [ USER_READ ]: 'View Users',
    [ USER_CREATE ]: 'Create Users',
    [ USER_UPDATE ]: 'Edit Users',
    [ USER_DELETE ]: 'Delete Users',

    [ LOGS_READ ]: 'View Logs',

    [ TICKET_READ ]: 'View Tickets',
    [ TICKET_CREATE ]: 'Create Tickets',
    [ TICKET_UPDATE ]: 'Edit Tickets',
    [ TICKET_DELETE ]: 'Delete Tickets',
    [ TICKET_ASSIGN ]: 'Assign Tickets',
    [ TICKET_RESOLVE ]: 'Resolve Tickets',

    [ KANBAN_READ ]: 'View Kanban Boards',
    [ KANBAN_CREATE ]: 'Create Kanban Items',
    [ KANBAN_UPDATE ]: 'Edit Kanban Items',
    [ KANBAN_DELETE ]: 'Delete Kanban Items',

    [ SCHEDULE_READ ]: 'View Schedules',
    [ SCHEDULE_CREATE ]: 'Create Schedules',
    [ SCHEDULE_UPDATE ]: 'Edit Schedules',
    [ SCHEDULE_DELETE ]: 'Delete Schedules',

    [ REPORT_READ ]: 'View Reports',
    [ REPORT_CREATE ]: 'Create Reports',
    [ REPORT_EXPORT ]: 'Export Reports',

    [ STORAGE_READ ]: 'View Storage Items',
    [ STORAGE_CREATE ]: 'Create Storage Items',
    [ STORAGE_UPDATE ]: 'Edit Storage Items',
    [ STORAGE_DELETE ]: 'Delete Storage Items',

    [ BUILDING_READ ]: 'View Buildings',
    [ BUILDING_CREATE ]: 'Create Buildings',
    [ BUILDING_UPDATE ]: 'Edit Buildings',
    [ BUILDING_DELETE ]: 'Delete Buildings',

    [ FLOOR_READ ]: 'View Floors',
    [ FLOOR_CREATE ]: 'Create Floors',
    [ FLOOR_UPDATE ]: 'Edit Floors',
    [ FLOOR_DELETE ]: 'Delete Floors',

    [ ROOM_READ ]: 'View Rooms',
    [ ROOM_CREATE ]: 'Create Rooms',
    [ ROOM_UPDATE ]: 'Edit Rooms',
    [ ROOM_DELETE ]: 'Delete Rooms',

    [ ASSET_READ ]: 'View Assets',
    [ ASSET_CREATE ]: 'Create Assets',
    [ ASSET_UPDATE ]: 'Edit Assets',
    [ ASSET_DELETE ]: 'Delete Assets',
    [ ASSET_DEPLOY ]: 'Deploy Assets'
};

// Permission groups for actions
export const CREATE_PERMISSIONS = [
    USER_CREATE,
    TICKET_CREATE,
    KANBAN_CREATE,
    SCHEDULE_CREATE,
    REPORT_CREATE,
    STORAGE_CREATE,
    BUILDING_CREATE,
    FLOOR_CREATE,
    ROOM_CREATE,
    ASSET_CREATE
];

export const EDIT_PERMISSIONS = [
    USER_UPDATE,
    TICKET_UPDATE,
    KANBAN_UPDATE,
    SCHEDULE_UPDATE,
    STORAGE_UPDATE,
    BUILDING_UPDATE,
    FLOOR_UPDATE,
    ROOM_UPDATE,
    ASSET_UPDATE
];

export const DELETE_PERMISSIONS = [
    USER_DELETE,
    TICKET_DELETE,
    KANBAN_DELETE,
    SCHEDULE_DELETE,
    STORAGE_DELETE,
    BUILDING_DELETE,
    FLOOR_DELETE,
    ROOM_DELETE,
    ASSET_DELETE
]; 