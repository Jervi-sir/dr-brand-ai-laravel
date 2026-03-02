
import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from '../../../components/icons';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { memo, useEffect } from 'react';
import equal from 'fast-deep-equal';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: any;
  vote: any | undefined;
  isLoading: boolean;
}) {
  const isAdmin = true;

  if (isLoading) return null;
  if (message.role === 'user') return null;
  if (message.toolInvocations && message.toolInvocations.length > 0)
    return null;

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
      } else {
        toast.error('Clipboard API not supported');
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground"
              variant="outline"
              onClick={async () => {
                await copyToClipboard(message.content as string);
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        <div className="mt-1 flex flex-row gap-3 text-xs text-gray-500">
          {isAdmin && <small>Prompt: {message.promptTokens || 0}</small>}
          {isAdmin && <small>Completion: {message.completionTokens || 0}</small>}
          {isAdmin && <small>Total: {message.totalTokens || 0}</small>}
          <small>Duration: {Number(message.duration || 0).toFixed(2)}s</small>
        </div>

      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);
