'use client';

import { ReactNode, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  CheckCircleFillIcon,
  ChevronDownIcon,
  GlobeIcon,
  LockIcon,
} from '../../../components/icons';

export type VisibilityType = 'private' | 'public';

const visibilities: Array<{
  id: VisibilityType;
  label: string;
  description: string;
  icon: ReactNode;
}> = [
    {
      id: 'private',
      label: 'Private',
      description: 'Only you can access this chat',
      icon: <LockIcon />,
    },
    {
      id: 'public',
      label: 'Public',
      description: 'Anyone with the link can access this chat',
      icon: <GlobeIcon />,
    },
  ];

export function VisibilitySelector({
  chatId,
  className,
  selectedVisibilityType,
  handleOnSelected,
}: {
  chatId?: string;
  selectedVisibilityType?: VisibilityType;
  handleOnSelected?: (visibility: VisibilityType) => void;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);


  const handleSelect = async (visibilityId: VisibilityType) => {
    if (handleOnSelected) {
      handleOnSelected(visibilityId); // Call parent callback for local state update
    }

    setOpen(false);

    if (chatId) {
      try {
        const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'));
        const csrfToken = match ? decodeURIComponent(match[2]) : '';

        const response = await fetch(`/chat/${chatId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-XSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            visibility: visibilityId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('Failed to update visibility:', error);
        // Optionally revert local state if needed, but for now we'll just log
      }
    }
  };

  const selectedVisibility = useMemo(
    () => visibilities.find((v) => v.id === selectedVisibilityType) ?? visibilities[0],
    [selectedVisibilityType],
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button variant="outline" className="hidden md:flex md:px-2 md:h-[34px]">
          {selectedVisibility.icon}
          {selectedVisibility.label}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-[300px]">
        {visibilities.map((visibility) => (
          <DropdownMenuItem
            key={visibility.id}
            onSelect={() => handleSelect(visibility.id)} // Use new handler
            className="gap-4 group/item flex flex-row justify-between items-center"
            data-active={visibility.id === selectedVisibilityType}
          >
            <div className="flex flex-col gap-1 items-start">
              {visibility.label}
              {visibility.description && (
                <div className="text-xs text-muted-foreground">
                  {visibility.description}
                </div>
              )}
            </div>
            <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
              <CheckCircleFillIcon />
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}