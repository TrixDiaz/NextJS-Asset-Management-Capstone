import StorageItemForm from '@/components/forms/storage-item-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface EditStorageItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStorageItemPage({
  params
}: EditStorageItemPageProps) {
  const { id } = await params;

  try {
    // Fetch storage item details for pre-filling the form
    const storageItem = await prisma.storageItem.findUnique({
      where: { id }
    });

    if (!storageItem) {
      notFound();
    }

    // Convert to format expected by StorageItemForm
    const formData = {
      name: storageItem.name,
      itemType: storageItem.itemType,
      quantity: storageItem.quantity,
      unit: storageItem.unit || '',
      remarks: storageItem.remarks || ''
    };

    return (
      <div className='container mx-auto p-4 md:p-6'>
        <div className='mb-6'>
          <Link href={`/dashboard/inventory/storage/${id}`}>
            <Button variant='ghost' size='sm' className='mb-4'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Item
            </Button>
          </Link>
          <h1 className='text-2xl font-bold md:text-3xl'>Edit Storage Item</h1>
          <p className='text-muted-foreground'>
            Update information for {storageItem.name}.
          </p>
        </div>

        <div className='mx-auto max-w-2xl'>
          <StorageItemForm initialData={formData} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in edit storage item page:', error);
    throw error;
  }
}
