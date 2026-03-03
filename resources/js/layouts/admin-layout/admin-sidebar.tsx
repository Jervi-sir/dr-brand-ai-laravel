import { Link } from '@inertiajs/react';
import { ChartBar, AppWindow, Database, Key, Lock, MessageCircle, Users, SplitIcon, Settings } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import admin from '@/routes/admin';


const mainNavItems: NavItem[] = [
  {
    title: 'Analytics',
    href: admin.analytics.index().url,
    icon: ChartBar,
  },
  {
    title: 'Users',
    href: admin.users.index().url,
    icon: Users,
  },
  {
    title: 'AI Usage',
    href: admin.aiUsage.index().url,
    icon: Database,
  },
  {
    title: 'AI Models',
    href: admin.aiModels.index().url,
    icon: AppWindow,
  },
  {
    title: 'Prompt History',
    href: admin.aiPromptHistory.index().url,
    icon: MessageCircle,
  },
  {
    title: 'API Tokens',
    href: admin.apiTokens.index().url,
    icon: Key,
  },
  {
    title: 'Unlocking Codes',
    href: admin.unlockingCodes.index().url,
    icon: Lock,
  },
  {
    title: 'Split 2 Config',
    href: admin.split2Config.index().url,
    icon: SplitIcon,
  },
  {
    title: 'Google Settings',
    href: '/admin/google-settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={admin.analytics.index().url} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
