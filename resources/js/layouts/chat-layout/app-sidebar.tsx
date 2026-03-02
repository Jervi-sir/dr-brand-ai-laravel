import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from './sidebar-history';
import { SidebarUserNav } from './sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SplitSquareHorizontalIcon, KanbanSquareIcon, CalendarIcon, ListIcon } from 'lucide-react';
import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { NavUser } from '@/components/nav-user';

export function AppSidebar({ user }: { user: any | undefined }) {
  const { setOpenMobile } = useSidebar();
  const { url } = usePage();
  const currentPath = url.split('?')[0];

  return (
    <Sidebar variant="floating" className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between">
            <Link
              href="/"
              onClick={() => setOpenMobile(false)}
              className="flex flex-row items-center gap-3"
            >
              <span className="cursor-pointer rounded-md px-2 text-lg font-semibold hover:bg-muted">
                Dr-brandlin
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="h-fit p-2"
                  onClick={() => {
                    setOpenMobile(false);
                    router.visit('/chat');
                  }}
                >
                  <PlusIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="px-2 py-1 text-xs text-sidebar-foreground/50">Tools</div>
          <SidebarGroupContent>
            {[
              { name: 'Split', icon: <SplitSquareHorizontalIcon />, url: '/split' },
              { name: 'Split v2', icon: <SplitSquareHorizontalIcon />, url: '/split-2' },
              { name: 'Kanban', icon: <KanbanSquareIcon />, url: '/kanban' },
              { name: 'Calendar', icon: <CalendarIcon />, url: '/calendar' },
              { name: 'Todo List', icon: <ListIcon />, url: '/todo-list' },
            ].map((item, index) => (
              <React.Fragment key={index}>
                <SidebarMenuButton asChild className="mb-1" isActive={currentPath === item.url}>
                  <Link href={item.url} onClick={() => setOpenMobile(false)}>
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </React.Fragment>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{
        user && <NavUser />
      }
      </SidebarFooter>
    </Sidebar>
  );
}