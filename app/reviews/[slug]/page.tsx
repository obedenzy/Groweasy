
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ReviewForm } from '@/components/reviews/ReviewForm';

// Revalidate every 30 minutes
export const revalidate = 1800;

export default async function ReviewPage({ params }: { params: { slug: string } }) {
  if (!params.slug) {
    notFound();
  }

  // Correctly fetch data, including is_active from the settings table
  const { data: subaccount, error } = await supabaseAdmin
    .from('subaccounts')
    .select(`
      id,
      name,
      logo,
      subaccount_settings (
        is_active,
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

  // Safely extract settings, providing defaults
  const settings = Array.isArray(subaccount.subaccount_settings) && subaccount.subaccount_settings.length > 0
    ? subaccount.subaccount_settings[0]
    : { is_active: false }; // Default to inactive if no settings exist

  // Use the is_active flag from the settings to disable the page
  if (!settings.is_active) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <p className="text-gray-600">
            The review link you're looking for doesn't exist or has been disabled.
          </p>
        </div>
      </div>
    );
  }

  // Construct the props object for the ReviewForm component
  const subaccountData = {
    id: subaccount.id,
    businessName: subaccount.name,
    logoUrl: subaccount.logo,
    isActive: settings.is_active,
    googleReviewLink: settings.google_review_link,
    reviewThreshold: settings.review_threshold ?? 4,
    thankYouMessage: settings.thank_you_message || 'Thank you for your feedback!',
  };

  return <ReviewForm subaccountData={subaccountData} />;
}
