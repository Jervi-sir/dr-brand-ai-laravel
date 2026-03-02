import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { stripHtml } from '@/lib/strip-html';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { MinimalTiptapEditor } from '@/components/minimal-tiptap';
import { TaskCard } from '@/components/task-card';
import { Task } from '@/types/task';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';
import ChatLayout from '@/layouts/chat-layout/layout';
import axios from 'axios';
import { cn } from '@/lib/utils';

const perPage = 10;
const MAX_TASKS_DISPLAY = 3;

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Todo List', href: '/todo-list' },
];

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedScripts, setSelectedScripts] = useState<{ id: string; order: number }[]>([]);
  const [scripts, setScripts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalScripts, setTotalScripts] = useState(0);
  const [editingScript, setEditingScript] = useState<{ id: string; content: string; title: string } | null>(null);

  const fetchContent = async () => {
    try {
      const response = await axios.get('/todo-list/api/todo');
      setTasks(response.data.slice(0, MAX_TASKS_DISPLAY));
    } catch {
      console.error('Failed to load content.');
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await axios.get(`/todo-list/api/content?page=${page}&limit=${perPage}`);
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

  useEffect(() => {
    const taskIds = tasks.map((task) => task.id);
    const uniqueIds = new Set(taskIds);
    if (uniqueIds.size !== taskIds.length) {
      setTasks((prev) => {
        const seenIds = new Set();
        return prev.filter((task) => {
          if (seenIds.has(task.id)) return false;
          seenIds.add(task.id);
          return true;
        });
      });
    }
  }, [tasks]);

  const handleAddScripts = async () => {
    try {
      const response = await axios.post('/todo-list/api/voice-over', {
        contentIds: selectedScripts.map((s) => s.id),
      });

      const updatedContent = response.data;
      const newTasks: Task[] = updatedContent.map((item: any) => ({
        id: item.id,
        title: item.title,
        stage: 'voice_over',
        generated_script: item.generated_script,
        scheduled_date: item.scheduled_date,
        deadline: item.deadline,
      }));

      setTasks((prev) => [...prev, ...newTasks].slice(0, MAX_TASKS_DISPLAY));
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
      await axios.delete(`/todo-list/api/content/${scriptId}`);

      setScripts((prev) => prev.filter((script) => script.id !== scriptId));
      setSelectedScripts((prev) => prev.filter((s) => s.id !== scriptId));
      setTotalScripts((prev) => prev - 1);

      const excludeIds = scripts.map((s) => s.id).filter((id) => id !== scriptId);
      const nextScriptResponse = await axios.get(`/todo-list/api/content/next?exclude=${excludeIds.join(',')}`);

      const newScript = nextScriptResponse.data;
      if (newScript) {
        setScripts((prev) => [...prev, newScript]);
        setTotalScripts((prev) => prev + 1);
      }
    } catch {
      console.error('Failed to delete script or fetch next script.');
    }
  };

  const handleEditScript = (script: any) => {
    setEditingScript({ id: script.id, content: script.generated_script, title: script.title });
  };

  const handleSaveEdit = async () => {
    if (!editingScript) return;
    try {
      await axios.put(`/todo-list/api/content/${editingScript.id}`, {
        generated_script: editingScript.content,
        title: editingScript.title,
      });
      setScripts((prev) =>
        prev.map((script) =>
          script.id === editingScript.id
            ? { ...script, generated_script: editingScript.content, title: editingScript.title }
            : script
        )
      );
      setEditingScript(null);
    } catch {
      console.error('Failed to update script.');
    }
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
  };

  const handleRemoveTask = async (taskId: string) => {
    setTasks((prev) => {
      const updatedTasks = prev.filter((task) => task.id !== taskId);
      const excludeIds = updatedTasks.map((t) => t.id).join(',');

      setTimeout(() => {
        const fetchNextTask = async () => {
          try {
            const response = await axios.get(`/todo-list/api/content/next?exclude=${excludeIds}`);
            const newTask = response.data;
            if (newTask && updatedTasks.length < MAX_TASKS_DISPLAY) {
              setTasks((current: any) => {
                const existingIds = new Set(current.map((t: any) => t.id));
                if (existingIds.has(newTask.id)) return current;
                return [
                  ...current,
                  {
                    id: newTask.id,
                    title: newTask.title,
                    stage: 'voice_over',
                    generated_script: newTask.generated_script,
                    scheduled_date: newTask.scheduled_date || null,
                    deadline: newTask.deadline || null,
                  },
                ].slice(0, MAX_TASKS_DISPLAY);
              });
            }
          } catch {
            console.error('Failed to fetch next task.');
          }
        };
        fetchNextTask();
      }, 200);

      return updatedTasks;
    });
  };

  return (
    <ChatLayout title="Todo List">
      <Head title="Todo List" />
      <div className="p-2">
        <style>{`
                    @keyframes appear {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-appear { animation: appear 500ms ease-out; }
                `}</style>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mx-auto pb-4">
          <div className="w-full md:w-auto">
            <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
              Add Script
            </Button>
          </div>
        </div>
        <ScrollArea className="md:px-0 pb-4 mx-auto">
          <Card className="min-h-[500px] bg-primary-foreground flex flex-col">
            <CardHeader className="p-2 font-semibold border-b-2 text-left">
              <span>To-Do List</span>
            </CardHeader>
            <ScrollArea>
              <CardContent className="p-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        apiBase="/todo-list/api"
                        removeAfterMoveTo={['script', 'done']}
                        onUpdateTask={handleUpdateTask}
                        onRemoveTask={handleRemoveTask}
                      />
                    ))
                  ) : (
                    <p className="col-span-3 text-center text-gray-500">No tasks available</p>
                  )}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        </ScrollArea>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl px-4">
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
                      setEditingScript((prev: any) => ({ ...prev, title: e.target.value }))
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
                      setEditingScript((prev: any) => ({ ...prev, content: value }))
                    }
                    className="min-h-[200px] mt-1"
                    output="html"
                    editable={true}
                    placeholder="Edit script..."
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={handleSaveEdit}>Save</Button>
                  <Button variant="outline" onClick={() => setEditingScript(null)}>
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
                            group relative overflow-hidden transition-all duration-300 ease-in-out border
                            ${isSelected ? 'bg-primary/5 ring-1 ring-primary/30 border-primary/30' : 'bg-card hover:bg-muted/50 border-border shadow-sm hover:border-primary/20'}
                            animate-appear w-full min-w-0 flex flex-row items-center p-3 sm:p-4 gap-4
                          `}
                        >
                          {/* Actions */}
                          <div
                            className={`
                              flex flex-col gap-2 shrink-0 transition-opacity duration-200
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
                              className={`font-semibold text-sm sm:text-base truncate block w-full transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}
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
                              className={`transition-colors ${isSelected ? 'border-primary' : 'border-muted-foreground/30 group-hover:border-primary/50'}`}
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
                <DialogFooter>
                  <div className="flex flex-col gap-2 md:flex-row md:justify-between w-full">
                    <div className="space-x-2 flex flex-row w-full md:w-auto">
                      <Button
                        className=""
                        disabled={page === 1}
                        onClick={() => setPage((prev) => prev - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        className=""
                        disabled={page * perPage >= totalScripts}
                        onClick={() => setPage((prev) => prev + 1)}
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
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ChatLayout>
  );
}
