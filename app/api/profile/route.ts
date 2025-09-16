'use client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase, supabaseAdmin } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

async function uploadImage(image: File) {
    const fileNmae = `${uuidv4()}-${image.name}`;
    const { data, error } = await supabase.storage
        .from('avatars') 
        .upload(fileNmae, image);

    if (error) {
        throw new Error(`Image upload failed: ${error.message}`);
    }

    return data.path;
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get('userId') || session?.user?.id;

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const canEdit = session?.user?.id === userId || session?.user?.role === 'SUBACCOUNT_ADMIN';

  if (!canEdit) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
  }

  const formData = await req.formData();
  const name = formData.get('name') as string;
  const password = formData.get('password') as string | null;
  const image = formData.get('image') as File | null;

  const updateData: { name: string; password?: string, image?: string } = { name };

  if (password) {
      // In a real app, you would hash the password here
      updateData.password = password;
  }

  if (image) {
      try {
          const imagePath = await uploadImage(image);
          const publicUrl = supabase.storage.from('avatars').getPublicUrl(imagePath).data.publicUrl;
          updateData.image = publicUrl;
      } catch (error) {
        return new NextResponse(JSON.stringify({ error: 'Image upload failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
      }
  }

  try {
    const { data: updatedUser, error } = await supabaseAdmin
      .from('Users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new NextResponse(JSON.stringify(updatedUser), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
