import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { User } from 'next-auth';

// This is the shape of the user object in the session, based on lib/auth.ts
export type SessionUser = User & {
  id: string;
  role: string;
  agencyId?: string;
  subaccountId?: string;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  // Ensure we have a user object and not just a plain session
  if (session && session.user) {
    return session.user as SessionUser;
  }
  return null;
}

export async function hasAgencyAccess(agencyId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }
  
  // Agency admins have access to their own agency
  if (user.role === 'AGENCY_ADMIN' && user.agencyId === agencyId) {
    return true;
  }
  
  return false;
}

export async function hasSubaccountAccess(subaccountId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }
  
  // Agency admins have access to all subaccounts under their agency
  if (user.role === 'AGENCY_ADMIN' && user.agencyId) {
      const { data, error } = await supabaseAdmin
          .from('subaccounts')
          .select('id')
          .eq('id', subaccountId)
          .eq('agency_id', user.agencyId)
          .single();
      return !error && !!data;
  }
  
  // Subaccount users only have access to their assigned subaccount
  if ((user.role === 'SUBACCOUNT_USER' || user.role === 'AGENCY_ADMIN') && user.subaccountId) {
    return user.subaccountId === subaccountId;
  }
  
  return false;
}

// This function keeps the same name as the one in the stub for an easier swap.
export async function getCurrentUserWithDetails() {
    return getCurrentUser();
}
