'use client';

import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { useState } from 'react';

type DownloadCsvButtonProps = {
  templateType: string;
};

export function DownloadCsvButton({ templateType }: DownloadCsvButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const onDownload = async () => {
    try {
      setIsDownloading(true);

      // Generate the filename based on template type
      const filename = `${templateType.toLowerCase().replace(/\s+/g, '_')}_template.csv`;

      // Fetch the CSV content from our API
      const response = await fetch(
        `/api/download-csv?filename=${filename}&template=${templateType}`
      );

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      // Get the CSV content
      const csvContent = await response.text();

      // Create a blob and download it
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button onClick={onDownload} variant='outline' disabled={isDownloading}>
      <Download className='mr-2 h-4 w-4' />
      {isDownloading ? 'Downloading...' : 'Download CSV Template'}
    </Button>
  );
}
