import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, Settings, LayoutDashboard, User as UserIcon, Sun, Moon, Monitor } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout, dashboard } from '@/routes';
import { edit } from '@/routes/profile';
import admin from '@/routes/admin';
import type { User } from '@/types';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import chat from '@/routes/chat';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const { url } = usePage();
    const cleanup = useMobileNavigation();
    const { appearance, updateAppearance } = useAppearance();

    const isAdmin = user.role?.code === 'admin';
    const isInAdmin = url.startsWith('/admin');

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                {isAdmin && (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full cursor-pointer"
                            href={isInAdmin ? chat.index().url : admin.users.index().url}
                            onClick={cleanup}
                        >
                            {isInAdmin ? (
                                <>
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    Client Side
                                </>
                            ) : (
                                <>
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Administration
                                </>
                            )}
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <div className="flex items-center gap-1 p-1">
                    <button
                        onClick={() => updateAppearance('light')}
                        className={cn(
                            'flex flex-1 items-center justify-center rounded-md py-1.5 transition-colors',
                            appearance === 'light' ? 'bg-neutral-100 shadow-sm dark:bg-neutral-800' : 'text-neutral-500 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50',
                        )}
                        title="Light Mode"
                    >
                        <Sun className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => updateAppearance('dark')}
                        className={cn(
                            'flex flex-1 items-center justify-center rounded-md py-1.5 transition-colors',
                            appearance === 'dark' ? 'bg-neutral-100 shadow-sm dark:bg-neutral-800' : 'text-neutral-500 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50',
                        )}
                        title="Dark Mode"
                    >
                        <Moon className="h-4 w-4" />
                    </button>
                </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
