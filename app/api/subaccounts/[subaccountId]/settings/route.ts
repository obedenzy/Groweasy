
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser, hasSubaccountAccess } from '@/lib/session-stub';

// GET request handler to fetch combined settings
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
      return NextResponse.json({ error: 'Subaccount not found' }, { status: 404 });
    }

    const settings = Array.isArray(data.subaccount_settings) && data.subaccount_settings.length > 0
      ? data.subaccount_settings[0]
      : {};

    // Combine data into a unified, consistent structure
    const responseData = {
      id: data.id,
      name: data.name,
      logo: data.logo,
      slug: data.slug,
      ...settings,
      is_active: settings.is_active !== false, // Default to true if null/undefined
      review_threshold: settings.review_threshold ?? 4,
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const { logo, name, ...settingsFields } = body;

    // 1. Update the 'subaccounts' table (name and logo)
    const subaccountUpdate: { [key: string]: any } = {};
    if (name !== undefined) subaccountUpdate.name = name;
    if (logo !== undefined) subaccountUpdate.logo = logo;

    if (Object.keys(subaccountUpdate).length > 0) {
      const { error: subaccountError } = await supabaseAdmin
        .from('subaccounts')
        .update(subaccountUpdate)
        .eq('id', params.subaccountId);

      if (subaccountError) {
        console.error('Subaccount update error:', subaccountError);
        return NextResponse.json({ error: 'Failed to save subaccount details' }, { status: 500 });
      }
    }

    // 2. Upsert the 'subaccount_settings' table
    if (Object.keys(settingsFields).length > 0) {
      const { error: settingsError } = await supabaseAdmin
        .from('subaccount_settings')
        .upsert(
          {
            subaccount_id: params.subaccountId,
            ...settingsFields,
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

    // 3. Refetch and return the complete, updated data
    const { data: finalData, error: finalError } = await supabaseAdmin
      .from('subaccounts')
      .select('id, name, logo, slug, subaccount_settings(*)')
      .eq('id', params.subaccountId)
      .single();
      
    if (finalError) {
        return NextResponse.json({ error: 'Failed to refetch data' }, { status: 500 });
    }

    const finalSettings = Array.isArray(finalData.subaccount_settings) && finalData.subaccount_settings.length > 0
      ? finalData.subaccount_settings[0]
      : {};

    return NextResponse.json({
      success: true,
      settings: {
          ...finalData,
          ...finalSettings
      }
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
