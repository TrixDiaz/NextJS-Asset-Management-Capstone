'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileIcon,
  Upload,
  Loader2,
  PaperclipIcon,
  FileText,
  FileImage,
  File,
  Download,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { formatBytes } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

interface TicketAttachmentsTabProps {
  ticketId: string;
}

export default function TicketAttachmentsTab({
  ticketId
}: TicketAttachmentsTabProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fetchAttachments = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/attachments`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication error - please sign in again');
        }
        throw new Error('Failed to fetch attachments');
      }

      const data = await response.json();
      setAttachments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching attachments:', err);
      toast.error('Error', {
        description: 'Failed to fetch attachments'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
  }, [ticketId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/tickets/${ticketId}/attachments`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication error - please sign in again');
        }
        throw new Error('Failed to upload attachment');
      }

      await fetchAttachments();
      setFile(null);

      toast.success('File uploaded', {
        description: 'Your file has been uploaded successfully'
      });
    } catch (error) {
      toast.error('Error', {
        description:
          error instanceof Error ? error.message : 'Failed to upload file'
      });
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return FileImage;
    if (fileType === 'application/pdf') return FileText;
    if (fileType.includes('document') || fileType.includes('text'))
      return FileText;
    return File;
  };

  if (loading) {
    return <p>Loading attachments...</p>;
  }

  if (error) {
    return <p className='text-destructive'>Error: {error}</p>;
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col gap-2'>
        {attachments.length === 0 ? (
          <p className='text-muted-foreground py-4 text-center'>
            No attachments yet. Upload a file to get started.
          </p>
        ) : (
          attachments.map((attachment) => {
            const FileTypeIcon = getFileIcon(attachment.fileType);
            return (
              <div
                key={attachment.id}
                className='flex items-center justify-between rounded-md border p-2'
              >
                <div className='flex items-center gap-2'>
                  <FileTypeIcon className='text-muted-foreground h-4 w-4' />
                  <div>
                    <p className='max-w-[150px] truncate text-sm font-medium'>
                      {attachment.fileName}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {formatBytes(attachment.fileSize)}
                    </p>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() =>
                          window.open(attachment.fileUrl, '_blank')
                        }
                      >
                        <Download className='h-4 w-4' />
                        <span className='sr-only'>Download</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download file</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })
        )}
      </div>

      <div className='space-y-2'>
        <div className='flex items-center gap-2'>
          <Input
            type='file'
            onChange={handleFileChange}
            disabled={uploading}
            className='w-full'
          />
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Uploading...
              </>
            ) : (
              <>
                <Upload className='mr-2 h-4 w-4' />
                Upload
              </>
            )}
          </Button>
        </div>
        {file && (
          <p className='text-muted-foreground text-xs'>
            Selected file: {file.name} ({formatBytes(file.size)})
          </p>
        )}
      </div>
    </div>
  );
}
