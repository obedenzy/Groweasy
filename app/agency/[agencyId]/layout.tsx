import { notFound } from 'next/navigation';
import { getCurrentUser, hasAgencyAccess } from '@/lib/session';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';

export default async function AgencyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { agencyId: string };
}) {
  const user = await getCurrentUser();
  
  // The middleware is already handling the redirect for unauthenticated users,
  // so the check here is primarily for type-safety and access control.
  if (!user) {
    // The middleware should have already redirected, but as a fallback.
    return notFound();
  }

  // Verify user has access to this agency
  const hasAccess = await hasAgencyAccess(params.agencyId);
  if (!hasAccess) {
    return notFound();
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={user.role} agencyId={params.agencyId} />
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
