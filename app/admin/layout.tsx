// app/admin/layout.tsx
import { checkAuth } from '@/app/utils/auth';
import { redirect } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
