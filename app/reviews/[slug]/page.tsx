
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ReviewForm } from '@/components/reviews/ReviewForm';

// Revalidate every 30 minutes
export const revalidate = 1800;

export default async function ReviewPage({ params }: { params: { slug: string } }) {
  if (!params.slug) {
    notFound();
  }

  // Fetch subaccount data along with its settings
  const { data: subaccount, error } = await supabaseAdmin
    .from('subaccounts')
    .select(`
      id,
      name,
      logo,
      subaccount_settings (
        enable_reviews,
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

  // Correctly determine the settings, defaulting to enabled if not explicitly configured
  const settings = Array.isArray(subaccount.subaccount_settings) && subaccount.subaccount_settings.length > 0
    ? subaccount.subaccount_settings[0]
    : { enable_reviews: true }; // Default to true if no settings exist

  // Use the 'enable_reviews' flag to disable the page
  if (settings.enable_reviews === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Reviews Unavailable</h1>
          <p className="text-gray-600">
            This business is not currently accepting reviews through this platform.
          </p>
        </div>
      </div>
    );
  }

  // Construct the props for the ReviewForm component
  const subaccountData = {
    id: subaccount.id,
    businessName: subaccount.name,
    logoUrl: subaccount.logo,
    isActive: settings.enable_reviews,
    googleReviewLink: settings.google_review_link,
    reviewThreshold: settings.review_threshold ?? 4,
    thankYouMessage: settings.thank_you_message || 'Thank you for your feedback!',
  };

  return <ReviewForm subaccountData={subaccountData} />;
}
