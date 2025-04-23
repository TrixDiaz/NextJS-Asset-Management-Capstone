'use client';
import { ChevronsDown, Github, Menu } from 'lucide-react';
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '../ui/sheet';
import { Separator } from '../ui/separator';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '../ui/navigation-menu';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: '#testimonials',
    label: 'Testimonials'
  },
  {
    href: '#team',
    label: 'Team'
  },
  {
    href: '#contact',
    label: 'Contact'
  },
  {
    href: '#faq',
    label: 'FAQ'
  }
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className='fixed top-0 right-0 left-0 z-50'>
      <header className='z-40 w-full'>
        <div className='mx-auto my-6 flex max-w-6xl items-center justify-between rounded-lg bg-black px-8 py-3'>
          <Link href='/' className='flex items-center text-lg font-bold'>
            <div className='mr-2 rounded-md bg-orange-600 p-2'>
              <ChevronsDown className='h-5 w-5 text-white' />
            </div>
            Shadcn
          </Link>

          {/* Mobile Menu */}
          <div className='flex items-center lg:hidden'>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Menu
                  onClick={() => setIsOpen(!isOpen)}
                  className='cursor-pointer text-white'
                />
              </SheetTrigger>

              <SheetContent
                side='left'
                className='flex flex-col justify-between bg-black text-white'
              >
                <div>
                  <SheetHeader className='mb-4 ml-4'>
                    <SheetTitle className='flex items-center text-white'>
                      <Link href='/' className='flex items-center'>
                        <div className='mr-2 rounded-md bg-orange-600 p-2'>
                          <ChevronsDown className='h-5 w-5 text-white' />
                        </div>
                        Shadcn
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  <div className='flex flex-col gap-2'>
                    <Button
                      asChild
                      variant='ghost'
                      className='justify-start text-base text-white'
                    >
                      <Link href='#'>Features</Link>
                    </Button>
                    {routeList.map(({ href, label }) => (
                      <Button
                        key={href}
                        onClick={() => setIsOpen(false)}
                        asChild
                        variant='ghost'
                        className='justify-start text-base text-white'
                      >
                        <Link href={href}>{label}</Link>
                      </Button>
                    ))}
                  </div>
                </div>

                <SheetFooter className='flex-col items-start justify-start sm:flex-col'>
                  <Separator className='mb-2 bg-gray-700' />
                  <ModeToggle />
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Menu */}
          <div className='hidden items-center space-x-6 lg:flex'>
            <NavigationMenu>
              <NavigationMenuList className='flex items-center space-x-6'>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className='bg-transparent text-white hover:bg-gray-800 hover:text-white'>
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className='bg-black text-white'>
                    <div className='grid w-[400px] gap-3 p-4'>
                      <div className='rounded-md p-3 hover:bg-gray-800'>
                        <p className='font-medium'>Showcase Your Value</p>
                        <p className='text-sm text-gray-400'>
                          Highlight how your product solves user problems.
                        </p>
                      </div>
                      <div className='rounded-md p-3 hover:bg-gray-800'>
                        <p className='font-medium'>Build Trust</p>
                        <p className='text-sm text-gray-400'>
                          Leverages social proof elements to establish trust.
                        </p>
                      </div>
                      <div className='rounded-md p-3 hover:bg-gray-800'>
                        <p className='font-medium'>Capture Leads</p>
                        <p className='text-sm text-gray-400'>
                          Make your lead capture form visually appealing.
                        </p>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {routeList.map(({ href, label }) => (
                  <NavigationMenuItem key={href}>
                    <Link
                      href={href}
                      className='text-white transition-colors hover:text-gray-300'
                    >
                      {label}
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className='hidden items-center space-x-2 lg:flex'>
            <ModeToggle />
            <Button asChild size='sm' variant='ghost' className='text-white'>
              <Link
                aria-label='View on GitHub'
                href='https://github.com/nobruf/shadcn-landing-page.git'
                target='_blank'
              >
                <Github className='h-5 w-5' />
              </Link>
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
};
