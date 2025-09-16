
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { subaccountId: string } }
) {
  try {
    const subaccountId = params.subaccountId;

    // Correctly fetch all data, including settings, in a single query
    const { data, error } = await supabaseAdmin
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
      .eq('id', subaccountId)
      .single();

    if (error || !data) {
      console.error('Subaccount fetch error:', error);
      return NextResponse.json({ error: 'Subaccount not found' }, { status: 404 });
    }

    // Safely extract settings and provide default values
    const settings = Array.isArray(data.subaccount_settings) && data.subaccount_settings.length > 0
      ? data.subaccount_settings[0]
      : { is_active: false }; // Default to inactive

    // Construct the response with data from the correct sources
    const responseData = {
      id: data.id,
      businessName: data.name,
      logoUrl: data.logo,
      isActive: settings.is_active, // Use is_active from settings
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
    const {
      rating,
      subject,
      comment,
      customerName,
      customerEmail,
      customerPhone,
    } = await request.json();

    // Validate subaccount and its active status from the settings table
    const { data: subaccount, error: subaccountError } = await supabaseAdmin
      .from('subaccounts')
      .select('id, subaccount_settings(is_active)')
      .eq('id', subaccountId)
      .single();

    if (subaccountError || !subaccount) {
      return NextResponse.json({ error: 'Subaccount not found' }, { status: 404 });
    }
    
    const settings = Array.isArray(subaccount.subaccount_settings) && subaccount.subaccount_settings.length > 0
    ? subaccount.subaccount_settings[0]
    : { is_active: false };

    if (!settings.is_active) {
      return NextResponse.json(
        { error: 'This business is not currently accepting reviews.' },
        { status: 403 }
      );
    }

    // Check if customer already submitted a review
    const { data: existingReview, error: existingReviewError } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('subaccount_id', subaccountId)
      .eq('customer_email', customerEmail)
      .maybeSingle(); // Use maybeSingle to avoid error if no review exists

    if (existingReviewError && existingReviewError.code !== 'PGRST116') { // Ignore 'Not found' error
      throw existingReviewError;
    }

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this business' },
        { status: 400 }
      );
    }

    // Create the new review
    const { data: newReview, error: createError } = await supabaseAdmin
      .from('reviews')
      .insert({
        subaccount_id: subaccountId,
        rating,
        subject,
        comment,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        status: 'PENDING', // Default status
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
