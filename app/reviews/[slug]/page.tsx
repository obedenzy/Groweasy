
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ReviewForm } from '@/components/reviews/ReviewForm';

// Revalidate every 30 minutes
export const revalidate = 1800;

export default async function ReviewPage({ params }: { params: { slug: string } }) {
  if (!params.slug) {
    notFound();
  }

  // Correctly fetch data from both tables using a JOIN
  const { data: subaccount, error } = await supabaseAdmin
    .from('subaccounts')
    .select(`
      id,
      name,
      logo,
      is_active,
      subaccount_settings (
        google_review_link,
        review_threshold,
        thank_you_message
      )
    `)
    .eq('slug', params.slug)
    .single();

  if (error || !subaccount) {
    console.error('Error fetching subaccount by slug:', error);
    notFound();
  }

  if (!subaccount.is_active) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <p className="text-gray-600">
            The review link you're looking for doesn't exist or has been disabled.
          </p>
        </div>
      </div>
    );
  }

  // Extract settings, providing defaults if they don't exist
  const settings = subaccount.subaccount_settings[0] || {};

  const props = {
    subaccountId: subaccount.id,
    businessName: subaccount.name,
    logoUrl: subaccount.logo,
    googleReviewLink: settings.google_review_link,
    reviewThreshold: settings.review_threshold ?? 4,
    thankYouMessage: settings.thank_you_message,
  };

  return <ReviewForm {...props} />;
}
