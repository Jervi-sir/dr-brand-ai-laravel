import { AppSidebar } from './app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import { SidebarToggle } from './sidebar-toggle';

export default function ChatLayout({
  children,
  header,
  title,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  title?: string;
}) {
  const { auth } = usePage<{ auth: { user: any } }>().props;

  return (
    <>
      <SidebarProvider>
        <AppSidebar user={auth.user} />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex items-center gap-2 bg-background px-2 py-2 md:px-2">
            <SidebarToggle />
            {title
              &&
              <h1>{title}</h1>}
            {header}
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
