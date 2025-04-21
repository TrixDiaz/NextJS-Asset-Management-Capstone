'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

export function SonnerToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      position='top-right'
      theme={theme as 'light' | 'dark' | 'system'}
      closeButton
      richColors
    />
  );
}
