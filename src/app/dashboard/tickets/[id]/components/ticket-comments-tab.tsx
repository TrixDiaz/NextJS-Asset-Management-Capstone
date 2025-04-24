'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Eye, EyeOff, User, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  isPrivate: boolean;
  createdAt: string;
  author?: {
    firstName?: string;
    lastName?: string;
    username?: string;
  };
}

interface TicketCommentsTabProps {
  ticketId: string;
}

const commentSchema = z.object({
  content: z.string().min(1, 'Comment is required'),
  isPrivate: z.boolean().default(false)
});

type CommentFormValues = z.infer<typeof commentSchema>;

export default function TicketCommentsTab({
  ticketId
}: TicketCommentsTabProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
      isPrivate: false
    }
  });

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication error - please sign in again');
        }
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching comments:', err);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [ticketId]);

  const onSubmit = async (values: CommentFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      const newComment = await response.json();
      setComments([newComment, ...comments]);
      form.reset();
      router.refresh();

      toast({
        title: 'Comment added',
        description: 'Your comment has been added successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add comment',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP p');
  };

  const getAuthorName = (comment: Comment) => {
    if (comment.author) {
      if (comment.author.firstName && comment.author.lastName) {
        return `${comment.author.firstName} ${comment.author.lastName}`;
      }
      if (comment.author.username) {
        return comment.author.username;
      }
    }
    return 'User';
  };

  if (loading) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <Loader2 className='text-primary h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error) {
    return <p className='text-destructive'>Error: {error}</p>;
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        {comments.length === 0 ? (
          <div className='text-muted-foreground py-8 text-center'>
            No comments yet
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-md border p-4 ${
                comment.isPrivate ? 'bg-muted/30' : ''
              }`}
            >
              <div className='mb-2 flex items-center justify-between'>
                <div className='flex items-center'>
                  <User className='text-muted-foreground mr-2 h-5 w-5' />
                  <span className='font-medium'>{getAuthorName(comment)}</span>
                  {comment.isPrivate && (
                    <div className='text-muted-foreground ml-2 flex items-center text-xs'>
                      <EyeOff className='mr-1 h-3 w-3' />
                      Private
                    </div>
                  )}
                </div>
                <span className='text-muted-foreground text-xs'>
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className='whitespace-pre-wrap'>{comment.content}</p>
            </div>
          ))
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder='Add a comment...'
                    className='min-h-[80px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex items-center justify-between'>
            <FormField
              control={form.control}
              name='isPrivate'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center space-y-0 space-x-2'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <div className='flex items-center gap-1 text-sm font-medium'>
                      <EyeOff className='h-3 w-3' />
                      Private comment
                    </div>
                    <p className='text-muted-foreground text-xs'>
                      Only visible to moderators and assigned technicians
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <Button type='submit' size='sm' disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Sending...
                </>
              ) : (
                <>
                  <Send className='mr-2 h-4 w-4' />
                  Send
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
