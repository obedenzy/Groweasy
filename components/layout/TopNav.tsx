'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Search, Settings, User, LogOut, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Sidebar from './Sidebar';

const pathNames: Record<string, string> = {
  'dashboard': 'Dashboard',
  'reviews': 'Reviews',
  'calendar': 'Calendar',
  'customers': 'Customers',
};

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const pathSegments = pathname ? pathname.split('/').filter(Boolean) : [];
  
  const agencyId = pathSegments.includes('agency') ? pathSegments[pathSegments.indexOf('agency') + 1] : undefined;
  const subaccountId = pathSegments.includes('subaccount') ? pathSegments[pathSegments.indexOf('subaccount') + 1] : undefined;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden"> 
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <Sidebar userRole={session?.user?.role} agencyId={agencyId} subaccountId={subaccountId} />
        </SheetContent>
      </Sheet>

      {/* Desktop Breadcrumb */}
      <div className="hidden md:flex items-center space-x-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
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
                      <BreadcrumbPage>{displayName}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href}>{displayName}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>

      <div className="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || '/avatars/01.png'} alt={session?.user?.name || 'User'} />
                <AvatarFallback>{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{session?.user?.name}</DropdownMenuLabel>
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
    </header>
  );
}
