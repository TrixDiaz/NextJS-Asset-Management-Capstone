import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Define StorageItem type
type StorageItem = {
  id: string;
  name: string;
  itemType: string;
  quantity: number;
  unit: string | null;
  remarks: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default async function StorageInventoryPage() {
  try {
    // Check if the prisma client is properly initialized
    if (!prisma || !prisma.storageItem) {
      throw new Error(
        "Prisma client is not properly initialized. Please run 'npx prisma generate' to generate the client."
      );
    }

    // Fetch all storage items
    const storageItems = (await prisma.storageItem.findMany({
      orderBy: {
        name: 'asc'
      }
    })) as StorageItem[];

    // Use empty array if no data
    const items = storageItems || [];

    // Group items by type for better organization
    const groupedItems: Record<string, StorageItem[]> = {};
    items.forEach((item) => {
      if (!groupedItems[item.itemType]) {
        groupedItems[item.itemType] = [];
      }
      groupedItems[item.itemType].push(item);
    });

    // Sort item types alphabetically
    const sortedItemTypes = Object.keys(groupedItems).sort();

    return (
      <div className='h-[calc(100vh-100px)] overflow-y-auto p-6'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>Storage Inventory</h1>
          <div className='flex gap-2'>
            <Link href='/dashboard/inventory/storage/new'>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Add Item
              </Button>
            </Link>
            <Link href='/dashboard/inventory'>
              <Button variant='outline'>Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {items.length === 0 ? (
          <div className='rounded-lg border p-12 text-center'>
            <h3 className='mb-2 text-xl font-medium'>
              No items in storage inventory
            </h3>
            <p className='mb-4 text-gray-500'>
              Start by adding items to your storage inventory.
            </p>
            <Link href='/dashboard/inventory/storage/new'>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Add Item
              </Button>
            </Link>
          </div>
        ) : (
          <div className='space-y-8'>
            {sortedItemTypes.map((itemType) => (
              <div
                key={itemType}
                className='overflow-hidden rounded-lg border shadow-sm'
              >
                <div className='bg-primary/10 px-4 py-3'>
                  <h2 className='text-xl font-semibold'>{itemType}</h2>
                </div>
                <div className='p-0'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead className='w-[150px]'>Quantity</TableHead>
                        <TableHead className='w-[150px]'>Unit</TableHead>
                        <TableHead className='w-[200px]'>Remarks</TableHead>
                        <TableHead className='w-[100px] text-right'>
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedItems[itemType].map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className='font-medium'>
                            {item.name}
                          </TableCell>
                          <TableCell>
                            {item.quantity > 0 ? (
                              item.quantity
                            ) : (
                              <Badge variant='destructive'>Out of Stock</Badge>
                            )}
                          </TableCell>
                          <TableCell>{item.unit || '-'}</TableCell>
                          <TableCell>{item.remarks || '-'}</TableCell>
                          <TableCell className='text-right'>
                            <Link
                              href={`/dashboard/inventory/storage/${item.id}`}
                            >
                              <Button variant='ghost' size='sm'>
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error in storage inventory:', error);
    throw error; // Let the error boundary handle it
  }
}
