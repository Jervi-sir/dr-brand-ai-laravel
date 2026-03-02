import * as React from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { useCalendar } from '../calendar-context';
import { IEvent } from '../types';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MinimalTiptapEditor } from '@/components/minimal-tiptap';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface IProps {
  children: React.ReactNode;
  event: IEvent;
}

export function EditEventDialog({ children, event }: IProps) {
  const { updateEvent } = useCalendar();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(event.title);
  const [userPrompt, setUserPrompt] = React.useState(event.userPrompt || '');
  const [generatedScript, setGeneratedScript] = React.useState(event.generatedScript || '');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateEvent({
        ...event,
        title,
        userPrompt,
        generatedScript,
      });
      setOpen(false);
      toast.success('Event updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update event');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-4 bg-zinc-950 text-white">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <span>Edit Event</span>
            <Badge variant="outline" className="text-[10px] border-white/20 text-white/70">
              {event.stage?.replace('_', ' ') || 'Draft'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="p-6 space-y-6 bg-background">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-12 rounded-xl">
                <TabsTrigger value="details" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Details</TabsTrigger>
                <TabsTrigger value="description" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Script Editor</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title"
                    required
                    className="h-11 rounded-xl bg-muted/30 border-muted focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Deadline</Label>
                    <div className="h-11 flex items-center px-3 rounded-xl bg-muted/20 border border-muted/50 text-sm font-medium text-muted-foreground/70">
                      {format(parseISO(event.endDate), 'MMM d, yyyy')}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stage" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stage</Label>
                    <div className="h-11 flex items-center px-3 rounded-xl bg-muted/20 border border-muted/50 text-sm font-medium text-muted-foreground/70 capitalize">
                      {event.stage?.replace('_', ' ') || 'Script'}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="description" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="generatedScript" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Generated Script</Label>
                  <div className="rounded-xl border border-muted overflow-hidden bg-muted/5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <MinimalTiptapEditor
                      value={generatedScript}
                      onChange={(value) => setGeneratedScript((value as string) || '')}
                      className="min-h-[250px] w-full border-none focus:outline-none"
                      editorClassName="p-4"
                      output="html"
                      editable={true}
                      placeholder="Fine-tune your script here..."
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="p-6 py-4 bg-muted/20 border-t flex-row items-center justify-end gap-3">
            <DialogClose asChild>
              <Button variant="ghost" className="rounded-xl">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Update Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
