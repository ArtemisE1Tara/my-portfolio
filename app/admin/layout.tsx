// app/admin/layout.tsx
import { checkAuth } from '../utils/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAuth();
  
  return <>{children}</>;
}