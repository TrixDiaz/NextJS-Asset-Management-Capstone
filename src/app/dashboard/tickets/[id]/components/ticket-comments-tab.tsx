'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Eye, EyeOff, User, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface Comment {
    id: string;
    content: string;
    authorId: string;
    isPrivate: boolean;
    createdAt: string;
}

interface TicketCommentsTabProps {
    ticketId: string;
}

const commentSchema = z.object({
    content: z.string().min(1, 'Comment is required'),
    isPrivate: z.boolean().default(false),
});

type CommentFormValues = z.infer<typeof commentSchema>;

export default function TicketCommentsTab({ ticketId }: TicketCommentsTabProps) {
    const [ comments, setComments ] = useState<Comment[]>([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);
    const [ submitting, setSubmitting ] = useState(false);
    const router = useRouter();

    const form = useForm<CommentFormValues>({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            content: '',
            isPrivate: false,
        },
    });

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/tickets/${ticketId}/comments`);

            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }

            const data = await response.json();
            setComments(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching comments:', err);
            toast.error('Error', {
                description: 'Failed to load comments',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [ ticketId ]);

    const onSubmit = async (data: CommentFormValues) => {
        setSubmitting(true);
        try {
            const response = await fetch(`/api/tickets/${ticketId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to add comment');
            }

            await fetchComments();
            form.reset({ content: '', isPrivate: false });
            router.refresh();

            toast.success('Comment added', {
                description: data.isPrivate
                    ? 'Your private comment has been added'
                    : 'Your comment has been added',
            });
        } catch (error) {
            toast.error('Error', {
                description: error instanceof Error ? error.message : 'Failed to add comment',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <p>Loading comments...</p>;
    }

    if (error) {
        return <p className="text-destructive">Error: {error}</p>;
    }

    return (
        <div className="space-y-4">
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                        No comments yet. Be the first to add a comment.
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="space-y-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">
                                        User #{comment.authorId.substring(0, 6)}
                                    </span>
                                    {comment.isPrivate && (
                                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                                            <EyeOff className="h-3 w-3" />
                                            Private
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </div>
                            </div>
                            <p className="text-sm whitespace-pre-line pl-6">{comment.content}</p>
                            <Separator className="mt-2" />
                        </div>
                    ))
                )}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        placeholder="Add a comment..."
                                        className="min-h-[80px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-between items-center">
                        <FormField
                            control={form.control}
                            name="isPrivate"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <div className="flex items-center gap-1 text-sm font-medium">
                                            <EyeOff className="h-3 w-3" />
                                            Private comment
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Only visible to moderators and assigned technicians
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" size="sm" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
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