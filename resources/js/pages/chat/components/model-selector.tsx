import { startTransition, useMemo, useOptimistic, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CheckCircleFillIcon, ChevronDownIcon } from '../../../components/icons';

interface AiModel {
  id: number; // This is the numeric ID from database
  name: string; // This is the display name (e.g. GPT-4o)
  description?: string;
  provider?: string;
  display_name?: string;
  capability?: string;
}

export function ModelSelector({
  selectedModelId,
  availableModels = [],
  onModelChange,
  className,
}: {
  selectedModelId: number | null;
  availableModels?: AiModel[];
  onModelChange?: (modelId: number) => void;
  className?: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] = useOptimistic(selectedModelId);

  const selectedModel = useMemo(
    () => availableModels.find((m) => m.id === optimisticModelId),
    [optimisticModelId, availableModels],
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
        <Button
          data-testid="model-selector"
          variant="outline"
          className="md:px-2 md:h-[34px]"
        >
          {selectedModel ? (
            <div className="flex items-center gap-1">
              <span className="capitalize">{selectedModel.provider || 'Provider'}</span>
              <span className="text-muted-foreground text-xs">•</span>
              <span>{selectedModel.display_name}</span>
            </div>
          ) : (
            'Select Mode'
          )}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {availableModels.length === 0 ? (
          <DropdownMenuItem disabled>No mode available</DropdownMenuItem>
        ) : (
          availableModels.map((model) => (
            <DropdownMenuItem
              key={model.id}
              data-testid={`model-selector-item-${model.id}`}
              onSelect={() => {
                setOpen(false);
                startTransition(() => {
                  setOptimisticModelId(model.id);
                  onModelChange?.(model.id);
                });
              }}
              data-active={model.id === optimisticModelId}
              asChild
            >
              <button
                type="button"
                className="gap-4 group/item flex flex-row justify-between items-center w-full text-left"
              >
                <div className="flex flex-col gap-1 items-start">
                  <div>{model.display_name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {model.capability || 'No description available'}
                  </div>
                </div>
                <div className="text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                  <CheckCircleFillIcon />
                </div>
              </button>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}