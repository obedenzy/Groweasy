import 'server-only';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read environment variables directly from .env.local file, ignoring Replit Secrets
function getEnvFromFile(key: string): string | undefined {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(key + '=')) {
        return trimmed.substring(key.length + 1);
      }
    }
  } catch (error) {
    console.error('Error reading .env.local:', error);
  }
  return undefined;
}

// Get Supabase config directly from .env.local, bypassing Replit Secrets completely
const supabaseUrl = getEnvFromFile('NEXT_PUBLIC_SUPABASE_URL') || 'https://vijdtxytcngumvljxjfd.supabase.co';
const supabaseServiceRoleKey = getEnvFromFile('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpamR0eHl0Y25ndW12bGp4amZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM5NzEwNiwiZXhwIjoyMDcyOTczMTA2fQ.-SP2rwIcXlnKb7KMm8c60hDU6GrYuemuVx8pEcVDxac';

// Validate environment variables
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required Supabase server environment variables:', {
    url: supabaseUrl || 'MISSING',
    serviceKey: supabaseServiceRoleKey ? 'SET' : 'MISSING',
    serviceKeyFirst10: supabaseServiceRoleKey ? supabaseServiceRoleKey.substring(0, 10) + '...' : 'NONE'
  });
  throw new Error('Missing required Supabase server environment variables');
}

// Server-side Supabase client (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Database types for better TypeScript support
export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: string;
          logo: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: string;
          logo?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          status?: string;
          logo?: string | null;
          website?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subaccounts: {
        Row: {
          id: string;
          agency_id: string;
          name: string;
          slug: string;
          status: string;
          logo: string | null;
          website: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          name: string;
          slug: string;
          status?: string;
          logo?: string | null;
          website?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          name?: string;
          slug?: string;
          status?: string;
          logo?: string | null;
          website?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subaccount_settings: {
        Row: {
          id: string;
          subaccount_id: string;
          google_review_link: string | null;
          review_threshold: number;
          thank_you_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subaccount_id: string;
          google_review_link?: string | null;
          review_threshold?: number;
          thank_you_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subaccount_id?: string;
          google_review_link?: string | null;
          review_threshold?: number;
          thank_you_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          subaccount_id: string;
          rating: number;
          subject: string;
          comment: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subaccount_id: string;
          rating: number;
          subject: string;
          comment: string;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subaccount_id?: string;
          rating?: number;
          subject?: string;
          comment?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          image: string | null;
          password: string | null;
          phone: string | null;
          locale: string;
          preferences: any | null;
          email_verified: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          image?: string | null;
          password?: string | null;
          phone?: string | null;
          locale?: string;
          preferences?: any | null;
          email_verified?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          image?: string | null;
          password?: string | null;
          phone?: string | null;
          locale?: string;
          preferences?: any | null;
          email_verified?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_agency_memberships: {
        Row: {
          id: string;
          user_id: string;
          agency_id: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          agency_id: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          agency_id?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subaccount_users: {
        Row: {
          id: string;
          user_id: string;
          subaccount_id: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subaccount_id: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subaccount_id?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}