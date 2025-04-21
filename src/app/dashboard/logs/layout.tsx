import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Logs',
  description: 'View and manage system activity logs'
};

export default function LogsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
