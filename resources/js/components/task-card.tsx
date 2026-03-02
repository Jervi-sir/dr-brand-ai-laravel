import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Calendar, CheckCircle, Trash2 } from 'lucide-react';
import { stripHtml } from '@/lib/strip-html';
import { MinimalTiptapEditor } from '@/components/minimal-tiptap';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  parseISO,
  addDays,
  format,
  isSameDay,
  isBefore,
  startOfDay,
} from 'date-fns';
import { Task, TaskStage } from '@/types/task';
import axios from 'axios';

interface TaskCardProps {
  task: Task;
  apiBase: string; // e.g., "/kanban/api" or "/todo-list/api"
  onUpdateTask?: (updatedTask: Task) => void;
  onRemoveTask?: (taskId: string) => void;
  onMoveTask?: (taskId: string, direction: 'next' | 'previous') => void | Promise<void>;
  removeAfterMoveTo?: TaskStage[]; // e.g., ['script', 'done'] for Todo List
}

export function TaskCard({
  task,
  apiBase,
  onUpdateTask,
  onRemoveTask,
  onMoveTask,
  removeAfterMoveTo = []
}: TaskCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [editedScript, setEditedScript] = useState(task.generated_script);
  const [editedTitle, setEditedTitle] = useState(task.title || '');
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [suggestedDate, setSuggestedDate] = useState('');
  const [localTask, setLocalTask] = useState(task);
  const [isRescheduled, setIsRescheduled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isVanishing, setIsVanishing] = useState(false);

  const stages: TaskStage[] = ['script', 'voice_over', 'creation', 'done'];
  const currentStageIndex = stages.indexOf(localTask.stage as TaskStage);
  const hasPreviousStage = currentStageIndex > 0;
  const hasNextStage = currentStageIndex >= 0 && currentStageIndex < stages.length - 1;

  useEffect(() => {
    setLocalTask(task);
    setEditedScript(task.generated_script);
    setEditedTitle(task.title || '');
    setIsVisible(true);
    setIsVanishing(false);
  }, [task]);

  useEffect(() => {
    if (isRescheduleDialogOpen) {
      const fetchSuggestedDate = async () => {
        try {
          const response = await axios.get(
            `${apiBase}/voice-over/reschedule-date`,
          );
          const { suggestedDate } = response.data;
          setSuggestedDate(suggestedDate.split('T')[0]);
          setRescheduleDate(suggestedDate.split('T')[0]);
        } catch {
          console.error('Failed to fetch suggested reschedule date.');
        }
      };
      fetchSuggestedDate();
    }
  }, [isRescheduleDialogOpen, apiBase]);

  const getBadgeProps = () => {
    switch (localTask.stage) {
      case 'script':
        return { text: 'Script', variant: 'outline' as const };
      case 'voice_over':
        return { text: 'Voice Over', variant: 'default' as const };
      case 'creation':
        return { text: 'Creation', variant: 'secondary' as const };
      case 'done':
        return { text: 'Done', variant: 'destructive' as const };
      default:
        return { text: (localTask.stage as string).replace('_', ' '), variant: 'outline' as const };
    }
  };

  const badgeProps = getBadgeProps();

  const getStageName = (stage: TaskStage) => {
    switch (stage) {
      case 'script': return 'Script';
      case 'voice_over': return 'Voice Over';
      case 'creation': return 'Creation';
      case 'done': return 'Done';
      default: return stage;
    }
  };

  const isDeadlinePassed = localTask.deadline
    ? isSameDay(parseISO(localTask.deadline), new Date()) ||
    isBefore(
      startOfDay(parseISO(localTask.deadline)),
      startOfDay(new Date()),
    )
    : false;

  const truncatedScript =
    stripHtml(localTask.generated_script || '').slice(0, 360) +
    (stripHtml(localTask.generated_script || '').length > 360 ? '...' : '');

  const handleSaveTask = async () => {
    try {
      await axios.put(`${apiBase}/content/${localTask.id}`, {
        generated_script: editedScript,
        title: editedTitle,
      });
      const updatedTask = {
        ...localTask,
        generated_script: editedScript,
        title: editedTitle,
      };
      setLocalTask(updatedTask);
      if (onUpdateTask) {
        onUpdateTask(updatedTask);
      }
      setIsDialogOpen(false);
      setIsEditEnabled(false);
    } catch {
      console.error('Failed to update task.');
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      await axios.delete(`${apiBase}/content/${localTask.id}`);
      setIsVanishing(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onRemoveTask) {
          onRemoveTask(localTask.id);
        }
      }, 500);
    } catch {
      console.error('Failed to delete task.');
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate) return;
    try {
      const response = await axios.post(
        `${apiBase}/voice-over/reschedule`,
        {
          contentId: localTask.id,
          newDeadline: rescheduleDate,
        },
      );

      const updatedTask = response.data;
      const newTask = {
        ...localTask,
        deadline: updatedTask.deadline,
        stage: updatedTask.stage || localTask.stage,
      };
      setLocalTask(newTask);
      if (onUpdateTask) {
        onUpdateTask(newTask);
      }
      setIsRescheduleDialogOpen(false);
      setRescheduleDate('');
      setSuggestedDate('');
      setIsRescheduled(true);
    } catch {
      console.error('Failed to reschedule task.');
    }
  };

  const handleInternalMove = async (direction: 'next' | 'previous') => {
    const newStageIndex = direction === 'next' ? currentStageIndex + 1 : currentStageIndex - 1;
    const newStage = stages[newStageIndex];

    try {
      await axios.put(`${apiBase}/content/${localTask.id}`, {
        stage: newStage,
      });

      const updatedTask = { ...localTask, stage: newStage } as Task;
      setLocalTask(updatedTask);
      if (onUpdateTask) {
        onUpdateTask(updatedTask);
      }

      if (removeAfterMoveTo.includes(newStage)) {
        setIsVanishing(true);
        setTimeout(() => {
          setIsVisible(false);
          if (onRemoveTask) {
            onRemoveTask(localTask.id);
          }
        }, 500);
      }
    } catch {
      console.error('Failed to move task stage.');
    }
  };

  const handleMove = (direction: 'next' | 'previous') => {
    if (onMoveTask) {
      onMoveTask(localTask.id, direction);
    } else {
      handleInternalMove(direction);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <Card
        className={cn(
          'flex min-h-[300px] flex-col overflow-hidden p-0 transition-all duration-500 ease-out',
          isVanishing ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
          'animate-appear',
        )}
      >
        <CardHeader
          className={cn(
            'relative flex flex-row items-center justify-between gap-1 border-b-2 border-secondary p-3 py-3',
            localTask.stage === 'script' && 'bg-slate-950',
            localTask.stage === 'voice_over' && 'bg-gray-950',
            localTask.stage === 'creation' && 'bg-emerald-950',
            localTask.stage === 'done' && 'bg-stone-800',
          )}
        >
          <p className="text-sm text-white">
            {localTask.title || 'Untitled Task'}
          </p>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant={badgeProps.variant}
              className="p-0 px-3 font-semibold"
            >
              {badgeProps.text}
            </Badge>
            {localTask.deadline && (
              <small className="ml-auto text-xs text-nowrap text-muted-foreground">
                Deadline:{' '}
                {new Date(
                  localTask.deadline,
                ).toLocaleDateString()}
              </small>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-3 text-left whitespace-pre-wrap">
          <div className="flex-1">
            <span>{truncatedScript}</span>
          </div>
          <div className="mt-2 flex flex-row flex-wrap items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
              aria-label="View/Edit script"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteTask}
              className="text-destructive hover:bg-destructive/10"
              aria-label="Delete task"
            >
              <Trash2 className="size-4" />
            </Button>

            {!isDeadlinePassed && (
              <div className="space-x-2">
                {hasPreviousStage && (
                  <Button
                    onClick={() => handleMove('previous')}
                    size="sm"
                    variant="outline"
                    className="py-1"
                  >
                    Move to {getStageName(stages[currentStageIndex - 1])}
                  </Button>
                )}
                {hasNextStage && (
                  <Button
                    onClick={() => handleMove('next')}
                    size="sm"
                    className="py-1"
                    variant="secondary"
                  >
                    Move to {getStageName(stages[currentStageIndex + 1])}
                  </Button>
                )}
              </div>
            )}

            {isDeadlinePassed && (
              <div className="space-x-2">
                <Button
                  onClick={() =>
                    setIsRescheduleDialogOpen(true)
                  }
                  size="sm"
                  className="py-1"
                  variant="secondary"
                  disabled={isRescheduled}
                >
                  {isRescheduled ? (
                    <>
                      <CheckCircle className="mr-2 size-4" />
                      Scheduled
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 size-4" />
                      Reschedule
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Script Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditedScript(localTask.generated_script);
            setEditedTitle(localTask.title || '');
            setIsEditEnabled(false);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditEnabled ? 'Edit Task' : (localTask.title || 'Task Details')}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Title</Label>
              {isEditEnabled ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Task title..."
                  className="mt-1"
                />
              ) : (
                <p className="text-sm mt-1">{localTask.title || 'Untitled Task'}</p>
              )}
            </div>
            {localTask.user_prompt && (
              <div>
                <Label>My Prompt</Label>
                <p className="text-sm">
                  {localTask.user_prompt}
                </p>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-semibold">
                  Script
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setIsEditEnabled(!isEditEnabled)
                  }
                >
                  <Pencil className="mr-2 size-4" />
                  {isEditEnabled
                    ? 'Disable Edit'
                    : 'Enable Edit'}
                </Button>
              </div>
              <div className="rounded-xl border p-2 dark:border-zinc-800">
                {isEditEnabled ? (
                  <MinimalTiptapEditor
                    value={editedScript}
                    onChange={(value: any) =>
                      setEditedScript(value)
                    }
                    throttleDelay={2000}
                    className={cn(
                      'h-full min-h-[150px] w-full rounded-xl border-0',
                    )}
                    editorContentClassName="overflow-auto h-full"
                    output="html"
                    placeholder="Edit script..."
                    editable={true}
                    editorClassName="focus:outline-none px-2 py-2 h-full"
                  />
                ) : (
                  <div
                    className="min-h-[150px] w-full overflow-auto p-2 text-sm"
                    dangerouslySetInnerHTML={{
                      __html: editedScript || '',
                    }}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-wrap space-x-5">
              {localTask.scheduled_date && (
                <div className="text-sm">
                  <span className="font-semibold">
                    Scheduled:{' '}
                  </span>
                  {new Date(
                    localTask.scheduled_date,
                  ).toLocaleDateString()}
                </div>
              )}
              {localTask.deadline && (
                <div className="text-sm">
                  <span className="font-semibold">
                    Deadline:{' '}
                  </span>
                  {new Date(
                    localTask.deadline,
                  ).toLocaleDateString()}
                </div>
              )}
              <div className="text-sm">
                <span className="font-semibold">Stage: </span>
                {badgeProps.text}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditedScript(localTask.generated_script);
                setEditedTitle(localTask.title || '');
                setIsEditEnabled(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTask}
              disabled={!isEditEnabled}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={isRescheduleDialogOpen}
        onOpenChange={(open) => {
          setIsRescheduleDialogOpen(open);
          if (!open) {
            setRescheduleDate('');
            setSuggestedDate('');
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Task</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Task</Label>
              <p className="text-sm">
                {localTask.title || 'Untitled Task'}
              </p>
            </div>
            <div>
              <Label>Reschedule Date</Label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) =>
                  setRescheduleDate(e.target.value)
                }
                min={format(
                  addDays(new Date(), 1),
                  'yyyy-MM-dd',
                )}
              />
              {suggestedDate && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Suggested:{' '}
                  {new Date(
                    suggestedDate,
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRescheduleDialogOpen(false);
                setRescheduleDate('');
                setSuggestedDate('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleReschedule}>Reschedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
