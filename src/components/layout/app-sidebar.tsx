'use client';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useUser } from '@clerk/nextjs';
import {
  IconChevronRight,
  IconChevronsDown,
  IconLogout,
  IconPhotoUp,
  IconUserCircle
} from '@tabler/icons-react';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { OrgSwitcher } from '../org-switcher';
import dynamic from 'next/dynamic';
// Dynamically import UserAvatarProfile without SSR to avoid hydration mismatch
const UserAvatarProfile = dynamic(
  () => import('@/components/user-avatar-profile').then((mod) => mod.UserAvatarProfile),
  { ssr: false }
);
export const company = {
  name: 'Acme Inc',
  logo: IconPhotoUp,
  plan: 'Enterprise'
};

const tenants = [
  { id: '1', name: 'Acme Inc' },
  { id: '2', name: 'Beta Corp' },
  { id: '3', name: 'Gamma Ltd' }
];

export default function AppSidebar() {
  // Add mount guard to ensure SSR and client initial render match
  const [ mounted, setMounted ] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { user } = useUser();
  const router = useRouter();
  const handleSwitchTenant = (_tenantId: string) => {
    // Tenant switching functionality would be implemented here
  };

  const activeTenant = tenants[ 0 ];

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [ isOpen ]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <OrgSwitcher
          tenants={tenants}
          defaultTenant={activeTenant}
          onTenantSwitch={handleSwitchTenant}
        />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon ? Icons[ item.icon ] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon />}
                        <span>{item.title}</span>
                        <IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  {mounted && user && (
                    <UserAvatarProfile
                      className='h-8 w-8 rounded-lg'
                      showInfo
                      user={user}
                    />
                  )}
                  <IconChevronsDown className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='px-1 py-1.5'>
                    {mounted && user && (
                      <UserAvatarProfile
                        className='h-8 w-8 rounded-lg'
                        showInfo
                        user={user}
                      />
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/profile')}
                  >
                    <IconUserCircle className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
