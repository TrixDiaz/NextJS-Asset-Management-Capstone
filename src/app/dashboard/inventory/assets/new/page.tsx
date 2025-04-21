import AssetForm from '@/components/forms/asset-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewAssetPage() {
  return (
    <div className='container mx-auto p-4 md:p-6'>
      <div className='mb-6'>
        <Link href='/dashboard/inventory/assets'>
          <Button variant='ghost' size='sm' className='mb-4'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Assets
          </Button>
        </Link>
        <h1 className='text-2xl font-bold md:text-3xl'>Add New Asset</h1>
        <p className='text-muted-foreground'>
          Add a new equipment asset to a room in the inventory system.
        </p>
      </div>

      <div className='mx-auto max-w-2xl'>
        <AssetForm />
      </div>
    </div>
  );
}
