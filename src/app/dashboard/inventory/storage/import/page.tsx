'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, ArrowLeft } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

export default function ImportStorageItemsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a CSV file to import.',
        variant: 'destructive'
      });
      return;
    }

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file format',
        description: 'Please select a CSV file.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUploading(true);

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);

      // Send to API endpoint
      const response = await fetch('/api/import-csv?type=storage', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to import items');
      }

      toast({
        title: 'Import Successful',
        description: `${data.imported} items imported successfully.`
      });

      // Navigate back to inventory page
      router.push('/dashboard/inventory/storage');
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description:
          error instanceof Error ? error.message : 'Failed to import items',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className='container mx-auto py-10'>
      <div className='mb-6 ml-6 flex flex-col items-start justify-around'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => router.push('/dashboard/inventory/storage')}
          className='mr-4 mb-4'
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Back to Inventory
        </Button>
        <h1 className='text-3xl font-bold'>Import Storage Items</h1>
      </div>

      <Card className='mx-auto max-w-md'>
        <CardHeader>
          <CardTitle>Import CSV File</CardTitle>
          <CardDescription>
            Upload a CSV file to import storage items. Download a template first
            if you need the correct format.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid w-full items-center gap-4'>
            <div className='flex flex-col space-y-1.5'>
              <Label htmlFor='file'>CSV File</Label>
              <Input
                id='file'
                type='file'
                accept='.csv'
                onChange={handleFileChange}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button
            variant='outline'
            onClick={() => router.push('/dashboard/inventory/storage')}
          >
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              'Uploading...'
            ) : (
              <>
                <Upload className='mr-2 h-4 w-4' />
                Upload and Import
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
