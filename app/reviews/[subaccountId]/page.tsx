import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ReviewForm } from '@/components/reviews/ReviewForm';

async function getSubaccountData(subaccountId: string) {
  const { data, error } = await supabaseAdmin
    .from('subaccounts')
    .select(
      'id, name, logo_url, google_review_link, is_active, review_threshold, thank_you_message'
    )
    .eq('id', subaccountId)
    .single();

  if (error || !data) {
    console.error(`Error fetching subaccount ${subaccountId}:`, error);
    return null;
  }

  return {
    id: data.id,
    businessName: data.name,
    logoUrl: data.logo_url,
    googleReviewLink: data.google_review_link,
    isActive: data.is_active,
    reviewThreshold: data.review_threshold,
    thankYouMessage: data.thank_you_message,
  };
}

export default async function ReviewPage({ params }: { params: { subaccountId: string } }) {
  const { subaccountId } = params;

  const subaccountData = await getSubaccountData(subaccountId);

  if (!subaccountData) {
    notFound();
  }

  return <ReviewForm subaccountData={subaccountData} />;
}
