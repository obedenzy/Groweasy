'use client';

import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, Settings, User, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';

const pathNames: Record<string, string> = {
  'dashboard': 'Dashboard',
  'reviews': 'Reviews',
  'calendar': 'Calendar',
  'customers': 'Customers',
};

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const pathSegments = pathname ? pathname.split('/').filter(Boolean) : [];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="h-16 border-b border-slate-200 bg-slate-800 text-white">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left side - Breadcrumb */}
        <div className="flex items-center space-x-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-slate-300 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              {pathSegments.map((segment, index) => {
                const href = '/' + pathSegments.slice(0, index + 1).join('/');
                const isLast = index === pathSegments.length - 1;
                const displayName = pathNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
                const isNonClickable = segment === 'subaccount' || segment === 'agency';

                return (
                  <div key={segment} className="flex items-center">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast || isNonClickable ? (
                        <BreadcrumbPage className="text-white">{displayName}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={href} className="text-slate-300 hover:text-white">{displayName}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Right side - Search, Notifications, User Menu */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search..."
              className="w-64 pl-9 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-300 hover:text-white hover:bg-slate-700">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-700">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback className="bg-blue-600 text-white">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Admin User</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}