import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser, hasSubaccountAccess } from '@/lib/session-stub';

export async function GET(
  request: NextRequest,
  { params }: { params: { subaccountId: string } }
) {
  try {
    // Verify subaccount exists and get settings
    const { data: subaccount, error: subaccountError } = await supabaseAdmin
      .from('subaccounts')
      .select('id, name')
      .eq('id', params.subaccountId)
      .single();

    if (subaccountError || !subaccount) {
      return NextResponse.json(
        { error: 'Subaccount not found' },
        { status: 404 }
      );
    }

    const { data: settings } = await supabaseAdmin
      .from('subaccount_settings')
      .select('*')
      .eq('subaccount_id', params.subaccountId)
      .single();

    // Return relevant settings for the review form
    const settingsData = {
      businessName: settings?.business_name || subaccount.name,
      businessType: settings?.business_type || null,
      address: settings?.address || null,
      city: settings?.city || null,
      state: settings?.state || null,
      zipCode: settings?.zip_code || null,
      country: settings?.country || null,
      logoUrl: settings?.logo_url || null,
      googleReviewLink: settings?.google_review_link || null,
      reviewThreshold: settings?.review_threshold || 4,
      primaryColor: settings?.primary_color || '#3B82F6',
      thankYouMessage: settings?.thank_you_message || null,
      timezone: settings?.timezone || 'UTC',
    };

    return NextResponse.json({ settings: settingsData });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { subaccountId: string } }
) {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check access to this subaccount
    const hasAccess = await hasSubaccountAccess(params.subaccountId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    const updatePayload: { [key: string]: any } = {};

    if (body.businessName !== undefined) updatePayload.business_name = body.businessName.trim();
    if (body.businessType !== undefined) updatePayload.business_type = body.businessType?.trim() || null;
    if (body.address !== undefined) updatePayload.address = body.address?.trim() || null;
    if (body.city !== undefined) updatePayload.city = body.city?.trim() || null;
    if (body.state !== undefined) updatePayload.state = body.state?.trim() || null;
    if (body.zipCode !== undefined) updatePayload.zip_code = body.zipCode?.trim() || null;
    if (body.country !== undefined) updatePayload.country = body.country?.trim() || 'US';
    if (body.logoUrl !== undefined) updatePayload.logo_url = body.logoUrl?.trim() || null;
    if (body.googleReviewLink !== undefined) updatePayload.google_review_link = body.googleReviewLink?.trim() || null;
    if (body.reviewThreshold !== undefined) updatePayload.review_threshold = parseInt(body.reviewThreshold);
    if (body.primaryColor !== undefined) updatePayload.primary_color = body.primaryColor || '#3B82F6';
    if (body.thankYouMessage !== undefined) updatePayload.thank_you_message = body.thankYouMessage?.trim() || null;
    if (body.timezone !== undefined) updatePayload.timezone = body.timezone?.trim() || 'UTC';
    if (body.enableReviews !== undefined) updatePayload.enable_reviews = Boolean(body.enableReviews);
    if (body.emailNotifications !== undefined) updatePayload.email_notifications = Boolean(body.emailNotifications);


    // Verify subaccount exists
    const { data: subaccount } = await supabaseAdmin
      .from('subaccounts')
      .select('id')
      .eq('id', params.subaccountId)
      .single();

    if (!subaccount) {
      return NextResponse.json(
        { error: 'Subaccount not found' },
        { status: 404 }
      );
    }
    
    const { data: settings, error } = await supabaseAdmin
      .from('subaccount_settings')
      .upsert(
        {
          subaccount_id: params.subaccountId,
          ...updatePayload,
        },
        {
          onConflict: 'subaccount_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Settings upsert error:', error);
      return NextResponse.json(
        { error: 'Failed to save settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      settings: {
        businessName: settings.business_name,
        businessType: settings.business_type,
        address: settings.address,
        city: settings.city,
        state: settings.state,
        zipCode: settings.zip_code,
        country: settings.country,
        logoUrl: settings.logo_url,
        googleReviewLink: settings.google_review_link,
        reviewThreshold: settings.review_threshold,
        primaryColor: settings.primary_color,
        thankYouMessage: settings.thank_you_message,
        timezone: settings.timezone,
        emailNotifications: settings.email_notifications,
        enableReviews: settings.enable_reviews,
      }
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
