
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser, hasSubaccountAccess } from '@/lib/session-stub';

// Corrected GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: { subaccountId: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('subaccounts')
      .select(`
        id,
        name,
        logo,
        slug,
        subaccount_settings (*)
      `)
      .eq('id', params.subaccountId)
      .single();

    if (error || !data) {
      console.error('Settings fetch error:', error);
      return NextResponse.json({ error: 'Subaccount not found' }, { status: 404 });
    }

    const settings = Array.isArray(data.subaccount_settings) && data.subaccount_settings.length > 0
      ? data.subaccount_settings[0]
      : {};

    const responseData = {
      businessName: data.name,
      logoUrl: data.logo,
      reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reviews/${data.slug}`,
      businessType: settings.business_type,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      zipCode: settings.zip_code,
      country: settings.country,
      enable_reviews: settings.enable_reviews !== false, // Use the correct column name
      googleReviewLink: settings.google_review_link,
      reviewThreshold: settings.review_threshold ?? 4,
      thankYouMessage: settings.thank_you_message,
      primaryColor: settings.primary_color || '#3B82F6',
      timezone: settings.timezone || 'UTC',
      emailNotifications: settings.email_notifications !== false,
    };

    return NextResponse.json({ settings: responseData });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Corrected PATCH handler
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
    const { businessName, logoUrl, ...settingsFields } = body;

    const subaccountUpdate: { [key: string]: any } = {};
    if (businessName !== undefined) subaccountUpdate.name = businessName;
    if (logoUrl !== undefined) subaccountUpdate.logo = logoUrl;

    if (Object.keys(subaccountUpdate).length > 0) {
      const { error: subaccountError } = await supabaseAdmin
        .from('subaccounts')
        .update(subaccountUpdate)
        .eq('id', params.subaccountId);

      if (subaccountError) {
        console.error('Subaccount update error:', subaccountError);
        return NextResponse.json({ error: 'Failed to save business information' }, { status: 500 });
      }
    }

    const settingsUpdatePayload: { [key: string]: any } = {};
    // Map frontend field names to the correct database column names
    const keyMap: { [key: string]: string } = {
      enable_reviews: 'enable_reviews', // Correct mapping
      googleReviewLink: 'google_review_link',
      reviewThreshold: 'review_threshold',
      thankYouMessage: 'thank_you_message',
      primaryColor: 'primary_color',
      emailNotifications: 'email_notifications',
      businessType: 'business_type',
    };

    for (const key in settingsFields) {
        const dbKey = keyMap[key] || key;
        settingsUpdatePayload[dbKey] = settingsFields[key];
    }

    if (Object.keys(settingsUpdatePayload).length > 0) {
      const { error: settingsError } = await supabaseAdmin
        .from('subaccount_settings')
        .upsert(
          { subaccount_id: params.subaccountId, ...settingsUpdatePayload },
          { onConflict: 'subaccount_id' }
        );

      if (settingsError) {
        console.error('Settings upsert error:', settingsError);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
