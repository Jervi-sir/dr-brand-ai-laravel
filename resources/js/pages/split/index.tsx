import { useState, useEffect, useMemo } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { MinimalTiptapEditor } from '@/components/minimal-tiptap';
import ChatLayout from '@/layouts/chat-layout/layout';
import GenerateScriptsController from '@/actions/App/Http/Controllers/Split/GenerateScriptsController';
import SaveScriptController from '@/actions/App/Http/Controllers/Split/SaveScriptController';

const maxCharacter = 500;
const ITEMS_PER_PAGE = 5;

interface Script {
  subtitle: string;
  content: string;
}

interface FormData {
  userPrompt: string;
  topicPrompt?: string;
  content_idea: string;
  hook_type: string;
}

export default function SplitIndex({
  contentIdeas,
  hookTypes,
  userId,
}: {
  contentIdeas: string[];
  hookTypes: string[];
  userId: number;
}) {
  const form = useForm<FormData>({
    defaultValues: {
      userPrompt: '',
      topicPrompt: '',
      content_idea: '',
      hook_type: '',
    },
    resolver: async (data) => {
      const errors: Partial<Record<keyof FormData, { message: string }>> = {};
      if (!data.userPrompt.trim()) {
        errors.userPrompt = { message: 'User prompt is required' };
      }
      if (data.userPrompt.length > maxCharacter) {
        errors.userPrompt = { message: `User prompt must not exceed ${maxCharacter} characters` };
      }
      if (data.topicPrompt && data.topicPrompt.length > maxCharacter) {
        errors.topicPrompt = { message: `Topic prompt must not exceed ${maxCharacter} characters` };
      }
      if (!data.content_idea) {
        errors.content_idea = { message: 'Content idea is required' };
      }
      if (!data.hook_type) {
        errors.hook_type = { message: 'Hook type is required' };
      }
      return {
        values: data,
        errors,
      };
    },
  });

  const [usedModelId, setUsedModelId] = useState<string | null>('');
  const [scripts, setScripts] = useState<Script[]>([]);
  const [scriptTitle, setScriptTitle] = useState<string>('');
  const [validated, setValidated] = useState<boolean[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [timer, setTimer] = useState(180);

  useEffect(() => {
    const savedUserPrompt = localStorage.getItem('userPrompt');
    if (savedUserPrompt && savedUserPrompt.length <= maxCharacter) {
      form.setValue('userPrompt', savedUserPrompt);
    }
    const savedTopicPrompt = localStorage.getItem('topicPrompt');
    if (savedTopicPrompt && savedTopicPrompt.length <= maxCharacter) {
      form.setValue('topicPrompt', savedTopicPrompt);
    }
  }, [form]);

  // Echo listener removed as generation is now synchronous


  const saveUserPromptToLocalStorage = debounce((prompt: string) => {
    if (prompt.trim() && prompt.length <= maxCharacter) {
      localStorage.setItem('userPrompt', prompt);
    }
  }, 1000);

  const saveTopicPromptToLocalStorage = debounce((prompt: string) => {
    if (prompt.trim() && prompt.length <= maxCharacter) {
      localStorage.setItem('topicPrompt', prompt);
    }
  }, 1000);

  const handleUserPromptChange = (value: string) => {
    form.setValue('userPrompt', value);
    saveUserPromptToLocalStorage(value);
  };

  const handleTopicPromptChange = (value: string) => {
    form.setValue('topicPrompt', value);
    saveTopicPromptToLocalStorage(value);
  };

  const getCharCountColor = (length: number) => {
    const percentage = (length / maxCharacter) * 100;
    if (percentage <= 70) return 'text-green-500';
    if (percentage <= 90) return 'text-yellow-500';
    return 'text-red-500';
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (!isLoading) {
      setTimer(180);
    }
    return () => clearInterval(interval);
  }, [isLoading, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setScripts([]);
    setValidated([]);
    setScriptTitle('');
    setTokenUsage(null);
    setUsedModelId(null);
    setCurrentPage(1);

    saveUserPromptToLocalStorage(data.userPrompt);
    if (data.topicPrompt) {
      saveTopicPromptToLocalStorage(data.topicPrompt);
    }

    try {
      const response = await axios.post(GenerateScriptsController.url(), data);
      const e = response.data;

      setIsLoading(false);
      setScriptTitle(e.title || 'Generated Scripts');

      const generatedScripts = e.scripts.map((script: any) => ({
        ...script,
        content: typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(script.content) : script.content,
      }));

      setScripts(generatedScripts);
      setValidated(new Array(generatedScripts.length).fill(false));
      setTokenUsage(e.tokenUsage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 });
      setUsedModelId(e.usedModelId || null);
      toast.success('Scripts generated successfully!');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to generate scripts');
      toast.error('Failed to generate scripts');
    }

  };

  const handleValidate = async (scriptIndex: number) => {
    try {
      const userPrompt = form.getValues('userPrompt');
      const topicPrompt = form.getValues('topicPrompt');
      const content_idea = form.getValues('content_idea');
      const hook_type = form.getValues('hook_type');
      const title = scripts[scriptIndex].subtitle;
      const generatedScript = scripts[scriptIndex].content;

      if (!title || !userPrompt || !hook_type || !generatedScript) {
        throw new Error('Missing required fields: title, user prompt, hook type, or generated script');
      }

      const response = await axios.post(SaveScriptController.url(), {
        title,
        userPrompt,
        topicPrompt,
        content_idea,
        hook_type,
        mood: hook_type,
        generatedScript,
        stage: 'script',
      });

      toast.success('Script Validated!');
      setValidated((prev) => {
        const newValidated = [...prev];
        newValidated[scriptIndex] = true;
        return newValidated;
      });
    } catch (error: any) {
      toast.error(`Failed to validate script: ${error.message || error.response?.data?.error}`);
    }
  };

  const handleDelete = (scriptIndex: number) => {
    setScripts((prev) => prev.filter((_, i) => i !== scriptIndex));
    setValidated((prev) => prev.filter((_, i) => i !== scriptIndex));
  };

  const paginatedScripts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return scripts.slice(start, start + ITEMS_PER_PAGE);
  }, [scripts, currentPage]);

  const totalPages = Math.ceil(scripts.length / ITEMS_PER_PAGE);

  return (
    <ChatLayout title="Split">
      <div className="flex flex-col h-full w-full bg-background">
        <Head title="Split Scripts" />
        <div className={cn('container mx-auto p-4')}>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Form (Left Side) */}
            <div className="flex-1 w-full md:w-1/2 md:pr-4 border-r-zinc-800 md:border-r">
              <h2 className="text-2xl font-bold mb-4">Split Script Generator</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="userPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Include: Niche (e.g., cooking), Short intro (e.g., I'm ..., an Algerian chef), Product/Service (e.g., recipe book), Target audience, Best-performing content (optional, e.g., couscous video got 100K views)"
                            className="resize-vertical min-h-[120px]"
                            maxLength={maxCharacter}
                            {...field}
                            onChange={(e) => handleUserPromptChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="topicPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic Prompt (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter a specific topic or theme for the script (e.g., 'Healthy breakfast recipes' or 'Morning routine for productivity')"
                            className="resize-vertical"
                            maxLength={maxCharacter}
                            {...field}
                            onChange={(e) => handleTopicPromptChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content_idea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Idea</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-auto min-h-9 w-full flex-wrap py-2 text-left whitespace-normal">
                              <SelectValue placeholder="Select Content Idea" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='max-w-[300px]'>
                            {contentIdeas.map((item) => (
                              <SelectItem key={item} value={item} className="h-auto whitespace-normal py-3">
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hook_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hook Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-auto min-h-9 w-full flex-wrap py-2 text-left whitespace-normal">
                              <SelectValue placeholder="Select Hook Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className='max-w-[300px]'>
                            {hookTypes.map((item) => (
                              <SelectItem key={item} value={item} className="h-auto whitespace-normal py-3">
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-4 items-center ml-auto">
                      <p className={cn('text-xs mt-1 text-right', getCharCountColor(form.watch('userPrompt').length))}>
                        {form.watch('userPrompt').length}/{maxCharacter}
                      </p>
                      <Button type="submit" disabled={isLoading} className="min-w-[140px] text-white">
                        {isLoading ? `Generating... (${formatTime(timer)})` : 'Generate Scripts'}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
              {error && <p className="text-red-500 mt-4">{error}</p>}
              <div className="mt-6 p-4 border rounded-xl dark:border-zinc-700">
                <h3 className="text-xl font-semibold mb-2">Token Usage</h3>
                {tokenUsage ? (
                  <ul className="space-y-1">
                    <li>
                      <span className="text-sm font-sans font-bold">Used Model: </span>
                      <small>{usedModelId}</small>
                    </li>
                    <li>
                      <span className="text-sm font-sans font-bold">Prompt Tokens: </span>
                      <small>{tokenUsage.prompt_tokens}</small>
                    </li>
                    <li>
                      <span className="text-sm font-sans font-bold">Completion Tokens: </span>
                      <small>{tokenUsage.completion_tokens}</small>
                    </li>
                    <li>
                      <span className="text-sm font-sans font-bold">Total Tokens: </span>
                      <small>{tokenUsage.total_tokens}</small>
                    </li>
                  </ul>
                ) : (
                  <p className="text-gray-500">No usage data available.</p>
                )}
              </div>
            </div>
            {/* Scripts (Right Side) */}
            <div className="flex-2 w-full md:w-1/2">
              <h2 className="text-2xl font-bold mb-4">Generated Wait Scripts</h2>
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-gray-500 dark:text-gray-400">Generating scripts, this is happening in real-time...</p>
                ) : paginatedScripts.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">
                    No scripts generated yet. Fill out the form and click &quot;Generate Scripts&quot;.
                  </p>
                ) : (
                  paginatedScripts.map((script, index) => (
                    <div key={index} className="border rounded-xl p-4 dark:border-zinc-800">
                      <h3 className="text-xl font-semibold mb-2">{script.subtitle}</h3>
                      {MinimalTiptapEditor ? (
                        <MinimalTiptapEditor
                          value={script.content}
                          onChange={(value) =>
                            setScripts((prev) => {
                              const newScripts: any = [...prev];
                              newScripts[(currentPage - 1) * ITEMS_PER_PAGE + index].content = value;
                              return newScripts;
                            })
                          }
                          throttleDelay={2000}
                          className={cn('h-full min-h-[150px] w-full rounded-xl border-t bg-muted/50 p-2')}
                          editorContentClassName="overflow-auto h-full"
                          output="html"
                          placeholder={`Script ${(currentPage - 1) * ITEMS_PER_PAGE + index + 1}...`}
                          editable={true}
                          editorClassName="focus:outline-none p-2 h-full rtl text-right"
                        />
                      ) : (
                        <textarea
                          value={script.content}
                          onChange={(e) =>
                            setScripts((prev) => {
                              const newScripts: any = [...prev];
                              newScripts[(currentPage - 1) * ITEMS_PER_PAGE + index].content = e.target.value;
                              return newScripts;
                            })
                          }
                          className="w-full min-h-[150px] p-4 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-ring transition-shadow resize-y"
                          style={{ textAlign: 'right' }}
                          dir="rtl"
                          placeholder={`Script ${(currentPage - 1) * ITEMS_PER_PAGE + index + 1}...`}
                        />
                      )}
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleValidate((currentPage - 1) * ITEMS_PER_PAGE + index)}
                          disabled={validated[(currentPage - 1) * ITEMS_PER_PAGE + index]}
                        >
                          {validated[(currentPage - 1) * ITEMS_PER_PAGE + index] ? 'Validated' : 'Validate'}
                        </Button>
                        {!validated[(currentPage - 1) * ITEMS_PER_PAGE + index] && (
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete((currentPage - 1) * ITEMS_PER_PAGE + index)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    variant="secondary"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    variant="secondary"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChatLayout>
  );
}
