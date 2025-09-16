import { getCurrentUser, hasSubaccountAccess } from '@/lib/session-stub';
import { notFound, redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ReviewsClientPage } from '@/components/reviews/ReviewsClientPage';

export default async function SubaccountReviewsPage({
  params,
}: {
  params: { subaccountId: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }

  const hasAccess = await hasSubaccountAccess(params.subaccountId);
  if (!hasAccess) {
    notFound();
  }

  const { data: subaccount, error } = await supabaseAdmin
    .from('subaccounts')
    .select('id, name, reviews (*, created_at, rating, status, customer_name, subject, comment)')
    .eq('id', params.subaccountId)
    .single();

  if (error || !subaccount) {
    console.error('Error fetching subaccount reviews:', error);
    notFound();
  }

  return (
    <ReviewsClientPage 
      subaccountId={params.subaccountId} 
      initialReviews={subaccount.reviews || []} 
      subaccountName={subaccount.name}
    />
  );
}
