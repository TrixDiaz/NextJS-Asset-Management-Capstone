// Adapted from shadcn/ui: https://ui.shadcn.com/docs/components/toast
import { toast as sonnerToast } from 'sonner';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function toast({ title, description, variant = 'default' }: ToastProps) {
  if (variant === 'destructive') {
    return sonnerToast.error(title, {
      description
    });
  }

  return sonnerToast.success(title, {
    description
  });
}
