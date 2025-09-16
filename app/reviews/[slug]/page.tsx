import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ReviewForm } from '@/components/reviews/ReviewForm';

// Fetch data using a URL-friendly slug
async function getSubaccountData(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('subaccounts')
    .select(
      'id, name, logo, google_review_link, is_active, review_threshold, thank_you_message'
    )
    .eq('slug', slug) // Query by slug instead of ID
    .single();

  if (error || !data) {
    console.error(`Error fetching subaccount with slug ${slug}:`, error);
    return null;
  }

  // Convert snake_case to camelCase for the component
  return {
    id: data.id,
    businessName: data.name,
    logoUrl: data.logo,
    googleReviewLink: data.google_review_link,
    isActive: data.is_active,
    reviewThreshold: data.review_threshold,
    thankYouMessage: data.thank_you_message,
  };
}

// The page now uses the [slug] parameter from the URL
export default async function ReviewPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  if (!slug) {
    notFound();
  }

  const subaccountData = await getSubaccountData(slug);

  if (!subaccountData) {
    notFound();
  }

  return <ReviewForm subaccountData={subaccountData} />;
}
