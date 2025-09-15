import { getCurrentUser, hasSubaccountAccess } from '@/lib/session';
import { supabaseAdmin } from '@/lib/supabase-server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserX } from 'lucide-react';

export default async function SubaccountUsersPage({
  params,
}: {
  params: { subaccountId: string };
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  const hasAccess = await hasSubaccountAccess(params.subaccountId);
  if (!hasAccess) {
    notFound();
  }

  const { data: subaccount, error } = await supabaseAdmin
    .from('subaccounts')
    .select(`
      name,
      subaccount_users:subaccount_users(*, users:user_id(id, name, email, image))
    `)
    .eq('id', params.subaccountId)
    .single();

  if (error || !subaccount) {
    notFound();
  }

  const users = subaccount.subaccount_users.map(su => ({
    ...su.users,
    role: su.role,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage users for {subaccount.name}
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Invite User
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img src={u.image || '/images/placeholder-user.png'} alt={u.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                   <Badge variant={u.role === 'SUBACCOUNT_ADMIN' ? 'destructive' : 'outline'}>{u.role}</Badge>
                   <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
                      <UserX className="h-4 w-4"/>
                   </Button>
                </div>
              </div>
            ))}
             {users.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    <p>No users found for this subaccount.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
