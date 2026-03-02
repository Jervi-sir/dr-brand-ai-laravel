import { format, parseISO } from 'date-fns';
import { Clock, CheckCircle, Text, BoxIcon } from 'lucide-react';
import { toast } from 'sonner';
import { EditEventDialog } from './edit-event-dialog';
import * as React from 'react';
import { useCalendar } from '../calendar-context';
import { IEvent } from '../types';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface IProps {
  event: IEvent;
  children: React.ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const { deleteEvent } = useCalendar();
  const [open, setOpen] = React.useState(false);
  const endDate = parseISO(event.endDate);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(event.id as string);
        setOpen(false);
        toast.success('Event deleted successfully');
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete event');
      }
    }
  };

  const getStageStyles = (stage?: string) => {
    switch (stage) {
      case 'voice_over':
        return { label: 'Voice Over', bg: 'bg-gray-950', border: 'border-gray-800' };
      case 'creation':
        return { label: 'Creation', bg: 'bg-emerald-950', border: 'border-emerald-900' };
      case 'done':
        return { label: 'Done', bg: 'bg-stone-800', border: 'border-stone-700' };
      default:
        return { label: stage || 'Unassigned', bg: 'bg-zinc-900', border: 'border-zinc-800' };
    }
  };

  const stageStyles = getStageStyles(event.stage);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-background">
        <DialogHeader className={cn(
          "p-6 py-4 text-white relative",
          stageStyles.bg
        )}>
          <div className="flex justify-between items-center pr-4">
            <DialogTitle className="text-2xl font-bold leading-tight">{event.title}</DialogTitle>
            <Badge variant="outline" className="text-white border-white/20 bg-white/10 backdrop-blur-md">
              {stageStyles.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 -mt-4 bg-background rounded-t-3xl relative z-10 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-accent">
              <div className="p-2 rounded-lg bg-background shadow-sm">
                <Clock className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Deadline</p>
                <p className="text-sm font-semibold">{format(endDate, 'MMMM d, yyyy')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30 border border-accent">
              <div className="p-2 rounded-lg bg-background shadow-sm">
                <BoxIcon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Stage</p>
                <p className="text-sm font-semibold">{stageStyles.label}</p>
              </div>
            </div>
          </div>

          {event.userPrompt && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Text className="size-4" />
                <h4 className="text-xs font-bold uppercase tracking-widest">User Prompt</h4>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 text-sm italic leading-relaxed text-muted-foreground border border-muted">
                "{event.userPrompt}"
              </div>
            </div>
          )}

          {event.generatedScript && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="size-4" />
                <h4 className="text-xs font-bold uppercase tracking-widest">Generated Script</h4>
              </div>
              <div className="p-4 rounded-xl border bg-card/50 shadow-sm max-h-[200px] overflow-y-auto custom-scrollbar">
                <div
                  className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: event.generatedScript,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 bg-accent/10 border-t flex-row items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
              Delete Event
            </Button>
            <EditEventDialog event={event}>
              <Button variant="outline" size="sm">Edit Details</Button>
            </EditEventDialog>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
