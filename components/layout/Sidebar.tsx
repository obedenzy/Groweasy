'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  Users,
  Star,
  ChevronLeft,
  LayoutDashboard,
  Building,
  Settings,
  UserCircle,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const getAgencyNavigation = (agencyId: string) => [
  {
    name: 'Dashboard',
    href: `/agency/${agencyId}/dashboard`,
    icon: LayoutDashboard,
  },
  {
    name: 'Subaccounts',
    href: `/agency/${agencyId}/subaccounts`,
    icon: Building,
  },
  {
    name: 'Users',
    href: `/agency/${agencyId}/users`,
    icon: Users,
  },
  {
    name: 'Analytics',
    href: `/agency/${agencyId}/analytics`,
    icon: BarChart3,
  },
  {
    name: 'Profile',
    href: `/agency/${agencyId}/profile`,
    icon: UserCircle,
  },
  {
    name: 'Settings',
    href: `/agency/${agencyId}/settings`,
    icon: Settings,
  },
];

const getSubaccountNavigation = (subaccountId: string) => [
  {
    name: 'Dashboard',
    href: `/subaccount/${subaccountId}/dashboard`,
    icon: LayoutDashboard,
  },
  {
    name: 'Reviews',
    href: `/subaccount/${subaccountId}/reviews`,
    icon: Star,
  },
  {
    name: 'Users',
    href: `/subaccount/${subaccountId}/users`,
    icon: Users,
  },
  {
    name: 'Calendar',
    href: `/subaccount/${subaccountId}/calendar`,
    icon: Calendar,
  },
  {
    name: 'Customers',
    href: `/subaccount/${subaccountId}/customers`,
    icon: Users,
  },
  {
    name: 'Profile',
    href: `/subaccount/${subaccountId}/profile`,
    icon: UserCircle,
  },
  {
    name: 'Settings',
    href: `/subaccount/${subaccountId}/settings`,
    icon: Settings,
  },
];

interface SidebarProps {
  userRole?: 'AGENCY_ADMIN' | 'SUBACCOUNT_USER';
  agencyId?: string;
  subaccountId?: string;
}

export default function Sidebar({ userRole, agencyId, subaccountId }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  
  const getNavigation = () => {
    if (!session?.user) return [];

    if (userRole === 'AGENCY_ADMIN' && agencyId && !subaccountId) {
      return getAgencyNavigation(agencyId);
    }
    
    if (subaccountId) {
      return getSubaccountNavigation(subaccountId);
    }
    
    return [];
  };

  const navigation = getNavigation();
  const badgeText = userRole === 'AGENCY_ADMIN' ? 'Agency Admin' : 'Business User';
  const badgeVariant = userRole === 'AGENCY_ADMIN' ? 'default' : 'secondary';

  const profileLink = subaccountId 
    ? `/subaccount/${subaccountId}/profile?userId=${session?.user.id}`
    : agencyId 
    ? `/agency/${agencyId}/profile?userId=${session?.user.id}`
    : '#';

  return (
    <div className={cn(
      "flex h-full flex-col bg-slate-900 text-white transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
        <button onClick={() => setCollapsed(!collapsed)} className={cn("flex items-center space-x-2", collapsed && "justify-center")}>
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Star className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white">
              Grow Easy
            </span>
          )}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.name !== 'Dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-slate-800 hover:text-blue-300",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-300",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className={cn("h-4 w-4", !collapsed && "mr-3")} />
                {!collapsed && item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-slate-700 mt-auto">
        {/* User Info Footer */}
        <Link href={profileLink} className="block p-3 hover:bg-slate-800">
          <div className={cn(
            "flex items-center space-x-2",
            collapsed && "justify-center"
          )}>
            {!collapsed && session?.user && (
              <div className="flex items-center space-x-2">
                <UserCircle className="h-6 w-6 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-sm text-white">{session.user.name}</span>
                  <Badge 
                    variant={badgeVariant}
                    className="text-xs w-fit"
                  >
                    {badgeText}
                  </Badge>
                </div>
              </div>
            )}
            {collapsed && (
              <UserCircle className="h-6 w-6 text-slate-400" />
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
