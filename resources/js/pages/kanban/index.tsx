import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { stripHtml } from '@/lib/strip-html';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MinimalTiptapEditor } from '@/components/minimal-tiptap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, startOfDay, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { TaskCard } from '@/components/task-card';
import { Task } from '@/types/task';
import { Column, ColumnId, defaultCols } from './types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BreadcrumbItem } from '@/types';
import ChatLayout from '@/layouts/chat-layout/layout';
import axios from 'axios';

const perPage = 7;

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kanban', href: '/kanban' }];

export default function Page() {
  const [columns] = useState<Column[]>(defaultCols);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedScripts, setSelectedScripts] = useState<
    { id: string; order: number }[]
  >([]);
  const [scripts, setScripts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalScripts, setTotalScripts] = useState(0);
  const [editingScript, setEditingScript] = useState<{
    id: string;
    content: string;
    title: string;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDoneCollapsed, setIsDoneCollapsed] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<{ from: Date; to: Date }>({
    from: startOfDay(new Date()),
    to: addDays(startOfDay(new Date()), 6),
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchContent = async () => {
    try {
      const from = selectedWeek.from.toISOString();
      const to = selectedWeek.to.toISOString();
      const response = await axios.get(
        `/kanban/api/kanban?from=${from}&to=${to}`,
      );
      setTasks(response.data);
    } catch {
      console.error('Failed to load content.');
    }
  };

  useEffect(() => {
    fetchContent();
  }, [selectedWeek]);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await axios.get(
          `/kanban/api/content?page=${page}&limit=${perPage}`,
        );
        const { scripts: fetchedScripts, total } = response.data;
        setScripts(fetchedScripts);
        setTotalScripts(total);
      } catch {
        console.error('Failed to load scripts.');
      }
    };
    if (isDialogOpen) {
      fetchScripts();
    }
  }, [page, isDialogOpen]);

  const handleAddScripts = async () => {
    try {
      const response = await axios.post('/kanban/api/voice-over', {
        contentIds: selectedScripts.map((s) => s.id),
      });

      const updatedContent = response.data;
      const newTasks: Task[] = updatedContent.map((item: any) => ({
        id: item.id,
        title: item.title,
        stage: item.stage,
        generated_script: item.generated_script,
        scheduled_date: item.scheduled_date,
        deadline: item.deadline,
      }));
      setTasks((prev) => [...prev, ...newTasks]);
      setIsDialogOpen(false);
      setSelectedScripts([]);
      setScripts([]);
    } catch {
      console.error('Failed to schedule voice-overs.');
    }
  };

  const handleDeleteScript = async (scriptId: string) => {
    if (!window.confirm('Are you sure you want to delete this script?')) {
      return;
    }
    try {
      await axios.delete(`/kanban/api/content/${scriptId}`);
      setScripts((prev) =>
        prev.filter((script) => script.id !== scriptId),
      );
      setSelectedScripts((prev) => prev.filter((s) => s.id !== scriptId));
    } catch {
      console.error('Failed to delete script.');
    }
  };

  const handleEditScript = (script: any) => {
    setEditingScript({ id: script.id, content: script.generated_script, title: script.title });
  };

  const handleSaveEdit = async () => {
    if (!editingScript) return;
    try {
      await axios.put(`/kanban/api/content/${editingScript.id}`, {
        generated_script: editingScript.content,
        title: editingScript.title,
      });
      setScripts((prev) =>
        prev.map((script) =>
          script.id === editingScript.id
            ? { ...script, generated_script: editingScript.content, title: editingScript.title }
            : script,
        ),
      );
      setEditingScript(null);
    } catch {
      console.error('Failed to update script.');
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
    );
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const moveTaskToStage = async (
    taskId: string,
    direction: 'next' | 'previous',
  ) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      let newStage: ColumnId | null = null;
      if (direction === 'next') {
        if (task.stage === 'voice_over') newStage = 'creation';
        else if (task.stage === 'creation') newStage = 'done';
      } else {
        if (task.stage === 'done') newStage = 'creation';
        else if (task.stage === 'creation') newStage = 'voice_over';
        else if (task.stage === 'voice_over') newStage = 'script' as ColumnId;
      }

      if (!newStage) return;

      await axios.put(`/kanban/api/content/${taskId}`, {
        stage: newStage,
      });

      if (newStage === 'script') {
        setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
      } else {
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === taskId ? { ...t, stage: newStage! } : t,
          ),
        );
      }
    } catch {
      console.error('Failed to move task.');
    }
  };

  const goToPreviousWeek = () => {
    setSelectedWeek({
      from: subDays(selectedWeek.from, 7),
      to: subDays(selectedWeek.to, 7),
    });
  };

  const goToNextWeek = () => {
    setSelectedWeek({
      from: addDays(selectedWeek.from, 7),
      to: addDays(selectedWeek.to, 7),
    });
  };

  const formatWeekRange = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return `${selectedWeek.from.toLocaleDateString(undefined, options)} - ${selectedWeek.to.toLocaleDateString(undefined, options)} `;
  };

  return (
    <ChatLayout title="Kanban">
      <Head title="Kanban" />
      <div className="p-2">
        <style>{`
        @keyframes appear {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
        }
                    .animate - appear { animation: appear 500ms ease - out; }
        `}</style>
        <div
          className={cn(
            'flex flex-col gap-4 md:flex-row',
            'items-center justify-between',
            'mx-auto ',
            'pb-4 pr-4',
          )}
        >
          <div className=" md:w-auto">
            <Button
              className="text-white"
              onClick={() => setIsDialogOpen(true)}
            >
              Add Script
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={goToPreviousWeek}
              variant="outline"
              size="icon"
            >
              <ChevronLeft />
            </Button>
            <span className="min-w-[140px] text-center text-sm font-medium">
              {formatWeekRange()}
            </span>
            <Button
              onClick={goToNextWeek}
              variant="outline"
              size="icon"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
        <BoardContainer isDoneCollapsed={isDoneCollapsed}>
          {isMobile ? (
            <BoardColumn
              key="all-tasks"
              column={{ id: 'all-tasks', title: 'All Tasks' }}
              tasks={[...tasks].sort((a, b) => {
                const order = [
                  'voice_over',
                  'creation',
                  'done',
                ];
                return (
                  order.indexOf(a.stage) -
                  order.indexOf(b.stage)
                );
              })}
              moveTaskToStage={moveTaskToStage}
              onUpdateTask={handleUpdateTask}
              onRemoveTask={handleRemoveTask}
            />
          ) : (
            columns.map((col) => (
              <BoardColumn
                key={col.id}
                column={col}
                tasks={tasks.filter(
                  (task) => task.stage === col.id,
                )}
                moveTaskToStage={moveTaskToStage}
                onUpdateTask={handleUpdateTask}
                onRemoveTask={handleRemoveTask}
                isCollapsed={
                  col.id === 'done' && isDoneCollapsed
                }
                onToggleCollapse={
                  col.id === 'done'
                    ? () =>
                      setIsDoneCollapsed(
                        !isDoneCollapsed,
                      )
                    : undefined
                }
              />
            ))
          )}
        </BoardContainer>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Select Scripts</DialogTitle>
            </DialogHeader>
            {editingScript ? (
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editingScript.title}
                    onChange={(e) =>
                      setEditingScript((prev: any) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Edit title..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Script</Label>
                  <MinimalTiptapEditor
                    value={editingScript.content}
                    onChange={(value) =>
                      setEditingScript((prev: any) => ({
                        ...prev,
                        content: value,
                      }))
                    }
                    className="min-h-[200px] w-full mt-1"
                    output="html"
                    editable={true}
                    placeholder="Edit script..."
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={handleSaveEdit}>
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingScript(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <ScrollArea className="max-h-[300px] md:max-h-[400px] w-full pr-4">
                  <div className="grid grid-cols-1 gap-3 p-1 w-full pb-4">
                    {scripts.map((script) => {
                      const selection = selectedScripts.find((s) => s.id === script.id);
                      const isSelected = !!selection;

                      return (
                        <Card
                          key={script.id}
                          className={`
                            group relative overflow - hidden transition - all duration - 300 ease -in -out border
                            ${isSelected ? 'bg-primary/5 ring-1 ring-primary/30 border-primary/30' : 'bg-card hover:bg-muted/50 border-border shadow-sm hover:border-primary/20'}
animate - appear w - full min - w - 0 flex flex - row items - center p - 3 sm: p - 4 gap - 4
  `}
                        >
                          {/* Actions */}
                          <div
                            className={`
                              flex flex - col gap - 2 shrink - 0 transition - opacity duration - 200
                              ${isSelected ? 'opacity-100' : 'opacity-20 md:group-hover:opacity-100'}
`}
                          >
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 px-3 text-xs shadow-sm bg-background/50 hover:bg-background border"
                              onClick={() => handleEditScript(script)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 px-3 text-xs shadow-sm bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-destructive/20"
                              onClick={() => handleDeleteScript(script.id)}
                            >
                              Delete
                            </Button>
                          </div>


                          {/* Content */}
                          <div className="grid grid-cols-1 gap-1.5 flex-1 min-w-0 w-full py-1">
                            <h4
                              className={`font - semibold text - sm sm: text - base truncate block w - full transition - colors ${isSelected ? 'text-primary' : 'text-foreground'} `}
                              dir="auto"
                            >
                              {script.title || 'Untitled Script'}
                            </h4>
                            <p
                              className="text-xs sm:text-sm text-muted-foreground/80 truncate block w-full leading-snug"
                              dir="auto"
                            >
                              {stripHtml(script.generated_script)}
                            </p>
                          </div>

                          {/* Selection UI */}
                          <div className="flex flex-col items-center justify-center gap-1 shrink-0 w-8">
                            <Checkbox
                              checked={isSelected}
                              className={`transition - colors ${isSelected ? 'border-primary' : 'border-muted-foreground/30 group-hover:border-primary/50'} `}
                              onCheckedChange={(checked) =>
                                setSelectedScripts((prev) => {
                                  if (checked) {
                                    return [
                                      ...prev,
                                      {
                                        id: script.id,
                                        order: prev.length + 1,
                                      },
                                    ];
                                  }
                                  return prev.filter((s) => s.id !== script.id);
                                })
                              }
                            />
                            <span className={cn(
                              "text-[10px] font-bold text-primary bg-primary/10 rounded-full px-1.5 py-0.5 mt-1 leading-none shadow-sm animate-appear",
                              isSelected ? "opacity-100" : "opacity-30"
                            )}>
                              #{selection?.order}
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
                <div className='flex justify-between'>
                  <div className='flex gap-2'>
                    <Button
                      disabled={page === 1}
                      onClick={() =>
                        setPage((prev) => prev - 1)
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      disabled={
                        page * perPage >= totalScripts
                      }
                      onClick={() =>
                        setPage((prev) => prev + 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                  <Button
                    onClick={handleAddScripts}
                    disabled={selectedScripts.length === 0}
                  >
                    Add Selected Scripts
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ChatLayout>
  );
}

function BoardColumn({
  column,
  tasks,
  moveTaskToStage,
  onUpdateTask,
  onRemoveTask,
  isCollapsed,
  onToggleCollapse,
}: {
  column: { id: string; title: string };
  tasks: Task[];
  moveTaskToStage?: (taskId: string, direction: 'next' | 'previous') => void;
  onUpdateTask?: (updatedTask: Task) => void;
  onRemoveTask?: (taskId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  if (isCollapsed) {
    return (
      <Card className="flex h-[calc(100vh-200px)] min-h-[500px] w-full flex-col items-center overflow-hidden border-none bg-sidebar/40 p-0 transition-all duration-300">
        <div
          className="flex h-full w-full cursor-pointer flex-col items-center justify-start p-4 text-muted-foreground transition-colors hover:bg-sidebar/80 hover:text-foreground"
          onClick={onToggleCollapse}
        >
          <ChevronLeft size={20} className="mb-6 opacity-50" />
          <span
            className="flex flex-1 items-start font-semibold tracking-wider"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
            }}
          >
            {column.title}
          </span>
          <Badge
            variant="secondary"
            className="mt-4 rotate-180"
            style={{ writingMode: 'vertical-rl' }}
          >
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </Badge>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-[calc(100vh-200px)] min-h-[500px] w-full flex-col border-none bg-sidebar/50 p-0 transition-all duration-300">
      <CardHeader className="group flex flex-row items-center justify-between border-b border-sidebar-border p-4 text-left font-semibold">
        <span
          className={
            column.id !== 'all-tasks'
              ? 'flex-1'
              : 'flex-1 text-center'
          }
        >
          {column.title}{' '}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            ({tasks.length})
          </span>
        </span>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="-mr-2 ml-auto h-6 w-6 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-sidebar/80 hover:text-foreground"
          >
            <ChevronRight size={16} />
          </Button>
        )}
      </CardHeader>
      <ScrollArea className="flex h-full flex-grow flex-col rounded-b-xl border-none">
        <CardContent className="relative flex grow flex-col gap-2 p-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              apiBase="/kanban/api"
              onMoveTask={moveTaskToStage}
              onUpdateTask={onUpdateTask}
              onRemoveTask={onRemoveTask}
            />
          ))}
          {tasks.length === 0 && (
            <div className="absolute inset-0 top-10 flex w-full justify-center text-sm text-muted-foreground">
              No tasks
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

function BoardContainer({
  children,
  isDoneCollapsed,
}: {
  children: React.ReactNode;
  isDoneCollapsed?: boolean;
}) {
  return (
    <div className="w-full pb-4">
      <div
        className={cn(
          'grid w-full grid-cols-1 gap-4 transition-all duration-300 md:grid-cols-2 lg:grid-cols-3',
          isDoneCollapsed && 'lg:grid-cols-[1fr_1fr_60px]',
        )}
      >
        {children}
      </div>
    </div>
  );
}
