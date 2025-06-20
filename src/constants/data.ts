import { NavItem } from '@/types';

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: [ 'd', 'd' ],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Inventory',
    url: '#',
    icon: 'laptop',
    shortcut: [ 'i', 'i' ],
    isActive: false,
    items: [
      {
        title: 'Buildings & Rooms',
        url: '/dashboard/inventory',
        icon: 'settings',
        shortcut: [ 'i', 'b' ]
      },
      {
        title: 'Storage',
        url: '/dashboard/inventory/storage',
        icon: 'product',
        shortcut: [ 'i', 's' ]
      }
    ]
  },
  {
    title: 'Tickets',
    url: '/dashboard/tickets',
    icon: 'ticket',
    shortcut: [ 't', 't' ],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Attendance',
    url: '/dashboard/attendance-list',
    icon: 'check',
    shortcut: [ 'a', 'l' ],
    isActive: false,
  },
  {
    title: 'Reports',
    url: '/dashboard/reports',
    icon: 'activity',
    shortcut: [ 'r', 'r' ],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Users',
    url: '/dashboard/users',
    icon: 'user',
    shortcut: [ 'u', 'u' ],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Schedules',
    url: '/dashboard/schedules',
    icon: 'calendar',
    shortcut: [ 's', 's' ],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Logs',
    url: '/dashboard/logs',
    icon: 'activity',
    shortcut: [ 'l', 'l' ],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Account',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: true,

    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: [ 'm', 'm' ]
      }
    ]
  },
  {
    title: 'Kanban',
    url: '/dashboard/kanban',
    icon: 'kanban',
    shortcut: [ 'k', 'k' ],
    isActive: false,
    items: [] // No child items
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
