import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Building,
  Cpu,
  Database,
  HardDrive,
  Home,
  Layers,
  Monitor,
  Package,
  Server,
  Plus
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export default function WelcomePage() {
  return (
    <div className='container mx-auto h-screen overflow-y-auto px-4 sm:px-6'>
      <div className='mb-8 py-4 text-center'>
        <h1 className='mb-2 text-2xl font-bold sm:mb-4 sm:text-3xl lg:text-4xl'>
          Inventory Management System
        </h1>
        <p className='text-muted-foreground mx-auto max-w-3xl text-sm sm:text-base lg:text-lg'>
          Track assets, manage rooms, and keep inventory of your IT equipment
          with this comprehensive system
        </p>
      </div>

      <div className='mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3'>
        <Card className='flex flex-col'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <Building className='h-4 w-4 sm:h-5 sm:w-5' />
              Buildings & Rooms
            </CardTitle>
          </CardHeader>
          <CardContent className='flex-grow'>
            <p className='text-sm sm:text-base'>
              Manage your organization&apos;s buildings, floors, and rooms in a
              hierarchical structure.
            </p>
          </CardContent>
          <CardFooter>
            <Link href='/dashboard/inventory' className='w-full'>
              <Button variant='outline' className='w-full'>
                View Buildings
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className='flex flex-col'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <Monitor className='h-4 w-4 sm:h-5 sm:w-5' />
              Asset Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className='flex-grow'>
            <p className='text-sm sm:text-base'>
              Track computers, monitors, and other equipment with details on
              their location and status.
            </p>
          </CardContent>
          <CardFooter>
            <Link href='/dashboard/inventory/assets' className='w-full'>
              <Button variant='outline' className='w-full'>
                View Assets
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className='flex flex-col'>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
              <Package className='h-4 w-4 sm:h-5 sm:w-5' />
              Storage Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className='flex-grow'>
            <p className='text-sm sm:text-base'>
              Maintain inventory of cables, software, hardware, and other items
              in your storage.
            </p>
          </CardContent>
          <CardFooter>
            <Link href='/dashboard/inventory/storage' className='w-full'>
              <Button variant='outline' className='w-full'>
                View Storage
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className='mb-6 rounded-lg border p-4 sm:mb-8 sm:p-6'>
        <h2 className='mb-4 flex items-center gap-2 text-xl font-bold sm:text-2xl'>
          <BookOpen className='h-4 w-4 sm:h-5 sm:w-5' />
          Getting Started
        </h2>
        <div className='space-y-4'>
          <div className='flex items-start gap-3 sm:gap-4'>
            <div className='bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm sm:h-8 sm:w-8 sm:text-base'>
              1
            </div>
            <div>
              <h3 className='text-md font-medium sm:text-lg'>
                Create Buildings
              </h3>
              <p className='text-muted-foreground text-sm sm:text-base'>
                Start by adding buildings to your system (e.g.,
                &quot;KorPhil&quot;). Each building serves as the top-level
                container for your inventory structure.
              </p>
            </div>
          </div>

          <div className='flex items-start gap-3 sm:gap-4'>
            <div className='bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm sm:h-8 sm:w-8 sm:text-base'>
              2
            </div>
            <div>
              <h3 className='text-md font-medium sm:text-lg'>Add Floors</h3>
              <p className='text-muted-foreground text-sm sm:text-base'>
                For each building, add the floors that exist (e.g., &quot;3rd
                Floor&quot;). This helps organize your spaces hierarchically.
              </p>
            </div>
          </div>

          <div className='flex items-start gap-3 sm:gap-4'>
            <div className='bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm sm:h-8 sm:w-8 sm:text-base'>
              3
            </div>
            <div>
              <h3 className='text-md font-medium sm:text-lg'>Create Rooms</h3>
              <p className='text-muted-foreground text-sm sm:text-base'>
                Add rooms to each floor (e.g., &quot;Room 302&quot;). Rooms are
                where assets will be located and tracked.
              </p>
            </div>
          </div>

          <div className='flex items-start gap-3 sm:gap-4'>
            <div className='bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm sm:h-8 sm:w-8 sm:text-base'>
              4
            </div>
            <div>
              <h3 className='text-md font-medium sm:text-lg'>
                Enter Storage Inventory
              </h3>
              <p className='text-muted-foreground text-sm sm:text-base'>
                Add items to your storage inventory with details like quantity,
                unit, and type (e.g., VGA cables, patch panels, mice).
              </p>
            </div>
          </div>

          <div className='flex items-start gap-3 sm:gap-4'>
            <div className='bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm sm:h-8 sm:w-8 sm:text-base'>
              5
            </div>
            <div>
              <h3 className='text-md font-medium sm:text-lg'>
                Add Assets to Rooms
              </h3>
              <p className='text-muted-foreground text-sm sm:text-base'>
                Add computers and other equipment to specific rooms, including
                details like system unit, monitor, and UPS information.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg sm:text-xl'>
              System Structure
            </CardTitle>
            <CardDescription>
              Hierarchical organization of your inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Building className='text-primary h-4 w-4 sm:h-5 sm:w-5' />
                <span className='text-sm font-medium sm:text-base'>
                  Buildings
                </span>
                <span className='text-muted-foreground text-xs sm:text-sm'>
                  (e.g., KorPhil)
                </span>
              </div>
              <div className='flex items-center gap-2 pl-4 sm:pl-5'>
                <Layers className='text-primary h-4 w-4 sm:h-5 sm:w-5' />
                <span className='text-sm font-medium sm:text-base'>Floors</span>
                <span className='text-muted-foreground text-xs sm:text-sm'>
                  (e.g., 3rd Floor)
                </span>
              </div>
              <div className='flex items-center gap-2 pl-8 sm:pl-10'>
                <Home className='text-primary h-4 w-4 sm:h-5 sm:w-5' />
                <span className='text-sm font-medium sm:text-base'>Rooms</span>
                <span className='text-muted-foreground text-xs sm:text-sm'>
                  (e.g., Room 302)
                </span>
              </div>
              <div className='flex items-center gap-2 pl-12 sm:pl-16'>
                <Cpu className='text-primary h-4 w-4 sm:h-5 sm:w-5' />
                <span className='text-sm font-medium sm:text-base'>
                  Computers
                </span>
                <span className='text-muted-foreground text-xs sm:text-sm'>
                  (PCs with details)
                </span>
              </div>
              <div className='flex items-center gap-2 pl-12 sm:pl-16'>
                <HardDrive className='text-primary h-4 w-4 sm:h-5 sm:w-5' />
                <span className='text-sm font-medium sm:text-base'>
                  Other Equipment
                </span>
                <span className='text-muted-foreground text-xs sm:text-sm'>
                  (Printers, projectors, etc.)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-lg sm:text-xl'>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these essential actions
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Link href='/dashboard/inventory/buildings/new' className='w-full'>
              <Button
                variant='default'
                className='flex w-full items-center justify-between gap-2'
                size='sm'
              >
                <span className='flex items-center'>
                  <Building className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                  Create New Building
                </span>
                <Plus className='h-4 w-4' />
              </Button>
            </Link>
            <Link href='/dashboard/inventory/assets/new' className='w-full'>
              <Button
                variant='outline'
                className='flex w-full items-center justify-between gap-2'
                size='sm'
              >
                <span className='flex items-center'>
                  <Monitor className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                  Add New Asset
                </span>
                <Plus className='h-4 w-4' />
              </Button>
            </Link>
            <Link href='/dashboard/inventory/storage/new' className='w-full'>
              <Button
                variant='outline'
                className='flex w-full items-center justify-between gap-2'
                size='sm'
              >
                <span className='flex items-center'>
                  <Package className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                  Add Storage Item
                </span>
                <Plus className='h-4 w-4' />
              </Button>
            </Link>
            <Link href='/dashboard/users/new' className='w-full'>
              <Button
                variant='outline'
                className='flex w-full items-center justify-between gap-2'
                size='sm'
              >
                <span className='flex items-center'>
                  <Server className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                  Create User
                </span>
                <Plus className='h-4 w-4' />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
