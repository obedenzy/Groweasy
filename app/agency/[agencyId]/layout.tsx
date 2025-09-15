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
  
  if (!user) {
    return notFound();
  }

  const hasAccess = await hasAgencyAccess(params.agencyId);
  if (!hasAccess) {
    return notFound();
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <Sidebar userRole={user.role} agencyId={params.agencyId} />
        </div>
      </div>
      <div className="flex flex-col">
        <TopNav />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
