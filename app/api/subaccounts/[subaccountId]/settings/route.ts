
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser, hasSubaccountAccess } from '@/lib/session-stub';

// GET request handler to fetch combined settings
export async function GET(
  request: NextRequest,
  { params }: { params: { subaccountId: string } }
) {
  try {
    // Fetch main subaccount data including the correct logo column
    const { data: subaccount, error: subaccountError } = await supabaseAdmin
      .from('subaccounts')
      .select('id, name, logo') // Correctly select 'logo' from 'subaccounts'
      .eq('id', params.subaccountId)
      .single();

    if (subaccountError || !subaccount) {
      return NextResponse.json(
        { error: 'Subaccount not found' },
        { status: 404 }
      );
    }

    // Fetch additional settings
    const { data: settings } = await supabaseAdmin
      .from('subaccount_settings')
      .select('*')
      .eq('subaccount_id', params.subaccountId)
      .single();

    // Combine data, using subaccount.logo as the single source of truth for the logo
    const settingsData = {
      businessName: settings?.business_name || subaccount.name,
      businessType: settings?.business_type || null,
      address: settings?.address || null,
      city: settings?.city || null,
      state: settings?.state || null,
      zipCode: settings?.zip_code || null,
      country: settings?.country || null,
      logoUrl: subaccount.logo || null, // Use the correct logo source
      googleReviewLink: settings?.google_review_link || null,
      reviewThreshold: settings?.review_threshold || 4,
      primaryColor: settings?.primary_color || '#3B82F6',
      thankYouMessage: settings?.thank_you_message || null,
      timezone: settings?.timezone || 'UTC',
      enableReviews: settings?.enable_reviews !== false,
      emailNotifications: settings?.email_notifications !== false,
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

// PATCH request handler to update settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: { subaccountId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasAccess = await hasSubaccountAccess(params.subaccountId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { logoUrl, ...otherSettings } = body;

    // 1. Handle logo update separately in the 'subaccounts' table
    if (logoUrl !== undefined) {
      const { error: logoError } = await supabaseAdmin
        .from('subaccounts')
        .update({ logo: logoUrl?.trim() || null })
        .eq('id', params.subaccountId);

      if (logoError) {
        console.error('Logo update error:', logoError);
        return NextResponse.json({ error: 'Failed to save logo' }, { status: 500 });
      }
    }

    // 2. Handle all other settings in the 'subaccount_settings' table
    const settingsUpdatePayload: { [key: string]: any } = {};
    const fields = [
      'businessName', 'businessType', 'address', 'city', 'state',
      'zipCode', 'country', 'googleReviewLink', 'reviewThreshold',
      'primaryColor', 'thankYouMessage', 'timezone', 'enableReviews',
      'emailNotifications'
    ];

    const keyMap: { [key: string]: string } = {
        businessName: 'business_name',
        googleReviewLink: 'google_review_link',
        reviewThreshold: 'review_threshold',
        primaryColor: 'primary_color',
        thankYouMessage: 'thank_you_message',
        enableReviews: 'enable_reviews',
        emailNotifications: 'email_notifications',
    };

    for (const key of fields) {
        if (otherSettings[key] !== undefined) {
            const dbKey = keyMap[key] || key;
            settingsUpdatePayload[dbKey] = otherSettings[key];
        }
    }

    if (Object.keys(settingsUpdatePayload).length > 0) {
        const { error: settingsError } = await supabaseAdmin
            .from('subaccount_settings')
            .upsert(
                {
                    subaccount_id: params.subaccountId,
                    ...settingsUpdatePayload,
                },
                {
                    onConflict: 'subaccount_id',
                }
            );

        if (settingsError) {
            console.error('Settings upsert error:', settingsError);
            return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
        }
    }

    // 3. Refetch and return the complete, updated settings
    const { data: finalSubaccount } = await supabaseAdmin.from('subaccounts').select('name, logo').eq('id', params.subaccountId).single();
    const { data: finalSettings } = await supabaseAdmin.from('subaccount_settings').select('*').eq('subaccount_id', params.subaccountId).single();

    return NextResponse.json({
      success: true,
      settings: {
        businessName: finalSettings?.business_name || finalSubaccount.name,
        businessType: finalSettings?.business_type,
        address: finalSettings?.address,
        city: finalSettings?.city,
        state: finalSettings?.state,
        zipCode: finalSettings?.zip_code,
        country: finalSettings?.country,
        logoUrl: finalSubaccount.logo,
        googleReviewLink: finalSettings?.google_review_link,
        reviewThreshold: finalSettings?.review_threshold,
        primaryColor: finalSettings?.primary_color,
        thankYouMessage: finalSettings?.thank_you_message,
        timezone: finalSettings?.timezone,
        enableReviews: finalSettings?.enable_reviews,
        emailNotifications: finalSettings?.email_notifications,
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
