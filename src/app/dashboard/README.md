# Dashboard Permission Management

## Overview

This dashboard uses a role-based permission system. Users are assigned roles (admin, moderator, technician, member, etc.) which determines their base level of access. Additionally, specific permissions can be granted to individual users.

## User Roles

- **Admin**: Full access to all features
- **Technician/Moderator/Manager**: Extended access to most features
- **Member/User**: Limited access to basic features
- **Guest**: Minimal access

## How to Manage Permissions

1. **Access User Management**:

   - Navigate to Users section from the sidebar
   - Or click on the User Management option in your profile dropdown (admin only)

2. **Initialize Permissions** (first time setup):

   - Click the "Seed Permissions" button on the Users page
   - This creates all the necessary permission records in the database

3. **Manage Individual User Permissions**:

   - Find the user in the users table
   - Click the three dots menu (•••) at the end of their row
   - Select "Manage Permissions"
   - On the permissions page, you can:
     - See the default permissions based on the user's role
     - Grant additional permissions by checking the boxes
     - Remove permissions by unchecking the boxes
     - Reset to role defaults if needed

4. **Different permission areas include**:
   - User Management
   - Logs
   - Ticketing
   - Kanban
   - Scheduling
   - Reports
   - Storage
   - Buildings
   - Floors
   - Rooms
   - Assets

## Navigation Access

The sidebar navigation automatically adjusts based on the user's role and permissions:

- **Admin**: Can see all navigation items
- **Moderators/Technicians**: Can see most items including logs, reports, and storage
- **Members/Users**: Limited sidebar with no access to logs, reports or storage

## Troubleshooting

If you still can't see certain UI elements or perform actions:

1. Verify the user's role in their profile
2. Check individual permissions for that user
3. Try seeding permissions again if they appear to be missing
4. Logout and log back in to refresh your session
