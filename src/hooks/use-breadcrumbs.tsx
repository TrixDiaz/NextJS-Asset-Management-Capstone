'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [ { title: 'Dashboard', link: '/dashboard' } ],
  '/dashboard/employee': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Employee', link: '/dashboard/employee' }
  ],
  '/dashboard/product': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Product', link: '/dashboard/product' }
  ],
  '/dashboard/inventory': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Inventory', link: '/dashboard/inventory' }
  ]
  // Add more custom mappings as needed
};

// Helper function to safely check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined';

// Helper function to get entity details from localStorage
const getEntityNameFromStorage = (type: string, id: string): string | null => {
  try {
    if (!isBrowser()) return null;

    const storageKey = `${type}_${id}`;
    return localStorage.getItem(storageKey);
  } catch (error) {
    console.error(`Error retrieving ${type} name from localStorage:`, error);
    return null;
  }
};

// Helper function to set entity details in localStorage
export const setEntityNameInStorage = (type: string, id: string, name: string): void => {
  try {
    if (!isBrowser()) return;

    const storageKey = `${type}_${id}`;
    localStorage.setItem(storageKey, name);
  } catch (error) {
    console.error(`Error storing ${type} name in localStorage:`, error);
  }
};

export function useBreadcrumbs() {
  const pathname = usePathname();
  const [ breadcrumbs, setBreadcrumbs ] = useState<BreadcrumbItem[]>([]);
  const [ isClient, setIsClient ] = useState(false);

  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Skip running this effect during SSR or when pathname is not available
    if (!isClient || !pathname) return;

    const generateBreadcrumbs = async () => {
      // Check if we have a custom mapping for this exact path
      if (routeMapping[ pathname ]) {
        setBreadcrumbs(routeMapping[ pathname ]);
        return;
      }

      // If no exact match, generate breadcrumbs from the path
      const segments = pathname.split('/').filter(Boolean);
      const newBreadcrumbs: BreadcrumbItem[] = [];

      // Add Dashboard as the first item if we're in a dashboard route
      if (segments[ 0 ] === 'dashboard') {
        newBreadcrumbs.push({ title: 'Dashboard', link: '/dashboard' });
      }

      // Process other segments
      for (let i = 1; i < segments.length; i++) {
        const segment = segments[ i ];
        const path = `/${segments.slice(0, i + 1).join('/')}`;

        // Check if this segment is an ID (for buildings, floors, rooms)
        const prevSegment = segments[ i - 1 ];

        if (prevSegment === 'buildings' && i === segments.length - 1) {
          // This is a building ID
          const buildingName = getEntityNameFromStorage('building', segment);
          newBreadcrumbs.push({
            title: buildingName || `Building (${segment})`,
            link: path
          });
        } else if (prevSegment === 'floors' && i === segments.length - 1) {
          // This is a floor ID
          const floorName = getEntityNameFromStorage('floor', segment);
          newBreadcrumbs.push({
            title: floorName || `Floor (${segment})`,
            link: path
          });
        } else if (prevSegment === 'rooms' && i === segments.length - 1) {
          // This is a room ID
          const roomName = getEntityNameFromStorage('room', segment);
          newBreadcrumbs.push({
            title: roomName || `Room (${segment})`,
            link: path
          });
        } else if (prevSegment === 'storage' && i === segments.length - 1) {
          // This is a storage item ID
          const itemName = getEntityNameFromStorage('storage', segment);
          newBreadcrumbs.push({
            title: itemName || `Item (${segment})`,
            link: path
          });
        } else {
          // Regular segment
          const title = segment.charAt(0).toUpperCase() + segment.slice(1);
          newBreadcrumbs.push({ title, link: path });
        }
      }

      setBreadcrumbs(newBreadcrumbs);
    };

    generateBreadcrumbs();
  }, [ pathname, isClient ]);

  return breadcrumbs;
}
