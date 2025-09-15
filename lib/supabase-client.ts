'use client';
import { createClient } from '@supabase/supabase-js';

// Use hardcoded values from .env.local to bypass Replit Secrets completely
const supabaseUrl = 'https://vijdtxytcngumvljxjfd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpamR0eHl0Y25ndW12bGp4amZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczOTcxMDYsImV4cCI6MjA3Mjk3MzEwNn0.6KyvJdMBaGvJfVgZY-QH3hLalLKEjEbVqMe1c0p6oYA';

// Client-side Supabase client (for public operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);