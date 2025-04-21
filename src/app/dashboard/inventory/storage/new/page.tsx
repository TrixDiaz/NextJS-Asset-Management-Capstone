import StorageItemForm from '@/components/forms/storage-item-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewStorageItemPage() {
  return (
    <div className='container mx-auto p-4 md:p-6'>
      <div className='mb-6'>
        <Link href='/dashboard/inventory/storage'>
          <Button variant='ghost' size='sm' className='mb-4'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Storage
          </Button>
        </Link>
        <h1 className='text-2xl font-bold md:text-3xl'>Add New Storage Item</h1>
        <p className='text-muted-foreground'>
          Create a new item for inventory storage.
        </p>
      </div>

      <div className='mx-auto max-w-2xl'>
        <StorageItemForm />
      </div>
    </div>
  );
}
