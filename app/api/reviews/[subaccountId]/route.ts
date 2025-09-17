
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { subaccountId: string } }
) {
  try {
    const subaccountId = params.subaccountId;

    const { data, error } = await supabaseAdmin
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
      .eq('id', subaccountId)
      .single();

    if (error || !data) {
      console.error('Subaccount fetch error:', error);
      return NextResponse.json({ error: 'Subaccount not found' }, { status: 404 });
    }

    const settings = Array.isArray(data.subaccount_settings) && data.subaccount_settings.length > 0
      ? data.subaccount_settings[0]
      : {};

    const responseData = {
      id: data.id,
      businessName: data.name,
      logoUrl: data.logo,
      isActive: settings.enable_reviews !== false, // Correctly use 'enable_reviews'
      googleReviewLink: settings.google_review_link,
      reviewThreshold: settings.review_threshold ?? 4,
      thankYouMessage: settings.thank_you_message,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { subaccountId: string } }
) {
  try {
    const subaccountId = params.subaccountId;
    const body = await request.json();

    const { data: subaccount, error: subaccountError } = await supabaseAdmin
      .from('subaccounts')
      .select('id, subaccount_settings(enable_reviews)') // Correctly select 'enable_reviews'
      .eq('id', subaccountId)
      .single();

    if (subaccountError || !subaccount) {
      return NextResponse.json({ error: 'Subaccount not found' }, { status: 404 });
    }

    const settings = Array.isArray(subaccount.subaccount_settings) && subaccount.subaccount_settings.length > 0
      ? subaccount.subaccount_settings[0]
      : { enable_reviews: false };

    if (!settings.enable_reviews) {
      return NextResponse.json(
        { error: 'This business is not currently accepting reviews.' },
        { status: 403 }
      );
    }

    // ... (rest of the logic for creating the review remains the same)
    const { data: newReview, error: createError } = await supabaseAdmin
      .from('reviews')
      .insert({
        subaccount_id: subaccountId,
        rating: body.rating,
        subject: body.subject,
        comment: body.comment,
        customer_name: body.customerName,
        customer_email: body.customerEmail,
        customer_phone: body.customerPhone,
        status: 'PENDING',
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating review:', createError);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviewId: newReview.id }, { status: 201 });
  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
