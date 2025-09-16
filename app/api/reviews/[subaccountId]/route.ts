
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { subaccountId: string } }
) {
  try {
    const subaccountId = params.subaccountId;

    // Step 1: Fetch core subaccount details
    const { data: subaccount, error: subaccountError } = await supabaseAdmin
      .from('subaccounts')
      .select('id, name, logo, is_active')
      .eq('id', subaccountId)
      .single();

    if (subaccountError || !subaccount) {
      console.error('Subaccount fetch error:', subaccountError);
      return NextResponse.json({ error: 'Subaccount not found' }, { status: 404 });
    }

    // Step 2: Fetch review-specific settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('subaccount_settings')
      .select('google_review_link, review_threshold, thank_you_message')
      .eq('subaccount_id', subaccountId)
      .single();
      
    // It's okay if settings don't exist; we can use defaults.
    if (settingsError) {
      console.warn(`No settings found for subaccount ${subaccountId}, using default values.`);
    }

    // Step 3: Combine data for the response
    const responseData = {
      id: subaccount.id,
      businessName: subaccount.name,
      logoUrl: subaccount.logo, // Use the correct 'logo' field
      isActive: subaccount.is_active,
      googleReviewLink: settings?.google_review_link,
      reviewThreshold: settings?.review_threshold ?? 4,
      thankYouMessage: settings?.thank_you_message,
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

    // Validate subaccount
    const { data: subaccount, error: subaccountError } = await supabaseAdmin
      .from('subaccounts')
      .select('id, is_active')
      .eq('id', subaccountId)
      .single();

    if (subaccountError || !subaccount) {
      return NextResponse.json({ error: 'Subaccount not found' }, { status: 404 });
    }

    if (!subaccount.is_active) {
      return NextResponse.json(
        { error: 'This business is not currently accepting reviews.' },
        { status: 403 }
      );
    }

    // Check if customer already submitted a review
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('subaccount_id', subaccountId)
      .eq('customer_email', customerEmail)
      .single();

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
