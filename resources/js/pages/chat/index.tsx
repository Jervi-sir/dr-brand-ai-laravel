import { cn } from '@/lib/utils';
import ChatLayout from '@/layouts/chat-layout/layout';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, StopIcon, ShareIcon } from '@/components/icons';
import type { VisibilityType } from './components/visibility-selector';
import { SidebarToggle } from '@/layouts/chat-layout/sidebar-toggle';
import { ModelSelector } from './components/model-selector';
import { VisibilitySelector } from './components/visibility-selector';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Messages } from './components/messages';
import { useCallback, useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { echo } from '@laravel/echo-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  duration?: number;
}

interface ChatInfo {
  id: number;
  title: string;
  visibility: string;
}

interface PageProps {
  [key: string]: unknown;
  chat?: ChatInfo;
  initialMessages?: Array<{
    id: number;
    role: string;
    content: string;
    model_id: number;
    created_at: string;
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    duration?: number;
  }>;
  chats?: Array<{
    id: number;
    title: string;
    visibility: string;
    created_at: string;
    updated_at: string;
  }>;
  aiModels?: Array<{
    id: number;
    name: string;
    description?: string;
    provider?: string;
  }>;
  selectedModelId?: number;
  auth: { user: any };
}

export default function Page() {
  const { chat, initialMessages, chats, aiModels, selectedModelId: initialModelID } = usePage<PageProps>().props;

  const [selectedModelId, setSelectedModelId] = useState<number | null>(initialModelID || aiModels?.[0]?.id || null);



  const [visibility, setVisibility] = useState<VisibilityType>((chat?.visibility as VisibilityType) ?? 'private');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) {
      return initialMessages.map((msg) => ({
        id: String(msg.id),
        role: msg.role as 'user' | 'assistant',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        createdAt: new Date(msg.created_at),
        promptTokens: msg.prompt_tokens,
        completionTokens: msg.completion_tokens,
        totalTokens: msg.total_tokens,
        duration: msg.duration,
      }));
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming'>('ready');
  const [currentChatId, setCurrentChatId] = useState<number | null>(chat?.id ?? null);
  const [chatTitle, setChatTitle] = useState<string>(chat?.title ?? '');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (initialModelID) {
      setSelectedModelId(initialModelID);
    }
  }, [initialModelID]);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight + 2}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStatus('ready');
  }, []);

  const handleSubmit = useCallback(
    async (messageContent?: string) => {
      const content = messageContent ?? input.trim();
      if (!content || status !== 'ready') return;

      // Optimistically add user message
      const tempUserMessageId = `temp-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: tempUserMessageId,
        role: 'user',
        content,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setStatus('submitted');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Get CSRF token from Laravel's XSRF-TOKEN cookie
        const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'));
        const csrfToken = match ? decodeURIComponent(match[2]) : '';

        const response = await fetch('/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-XSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            message: content,
            chat_id: currentChatId,
            model_id: selectedModelId,
            visibility,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const isNewChat = !currentChatId;

        // Update user message id
        setMessages((prev) =>
          prev.map((m) => (m.id === tempUserMessageId ? { ...m, id: String(data.user_message_id) } : m)),
        );

        if (isNewChat) {
          setCurrentChatId(data.chat_id);
          window.history.replaceState({}, '', `/chat/${data.chat_id}`);
          router.reload({ only: ['chats'] }); // Dynamically update the sidebar
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // User cancelled - that's fine
        } else {
          console.error('Chat error:', error);
          setStatus('ready');
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: 'Sorry, something went wrong. Please try again.',
              createdAt: new Date(),
            },
          ]);
        }
      } finally {
        abortControllerRef.current = null;
        textareaRef.current?.focus();
      }
    },
    [input, status, currentChatId, selectedModelId, visibility],
  );

  // Manage Echo subscriptions
  useEffect(() => {
    if (!currentChatId || typeof window === 'undefined') return;

    let e;
    try {
      e = echo();
    } catch {
      return;
    }

    if (!e) return;

    const channel = e.private(`chat.${currentChatId}`);

    channel.listen('ChatContentReceived', (e: { chatId: number; content: string }) => {
      setStatus('streaming');
      setMessages((prev) => {
        // Find if we already have a streaming assistant message at the end
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id.startsWith('temp-assistant-')) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: m.content + e.content } : m
          );
        } else {
          // Add a new assistant message
          return [
            ...prev,
            {
              id: `temp-assistant-${Date.now()}`,
              role: 'assistant',
              content: e.content,
              createdAt: new Date(),
            },
          ];
        }
      });
    });

    channel.listen('ChatStreamFinished', (e: { chatId: number; assistantMessageId: number; chatTitle: string; promptTokens: number; completionTokens: number; totalTokens: number; duration: number }) => {
      setStatus('ready');
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id.startsWith('temp-assistant-')) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? {
              ...m,
              id: String(e.assistantMessageId),
              promptTokens: e.promptTokens,
              completionTokens: e.completionTokens,
              totalTokens: e.totalTokens,
              duration: e.duration,
            } : m
          );
        }
        return prev;
      });
      if (e.chatTitle) {
        setChatTitle(e.chatTitle);
        router.reload({ only: ['chats'] }); // Refresh the title in the sidebar list too
      }
    });

    channel.listen('ChatErrorReceived', (e: { chatId: number; message: string }) => {
      setStatus('ready');
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id.startsWith('temp-assistant-')) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: e.message } : m
          );
        } else {
          return [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: e.message,
              createdAt: new Date(),
            }
          ]
        }
      });
    });

    return () => {
      e.leave(`chat.${currentChatId}`);
    };
  }, [currentChatId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <ChatLayout
      header={
        <>
          <ModelSelector
            selectedModelId={selectedModelId}
            onModelChange={setSelectedModelId}
            availableModels={aiModels}
            className="order-1 md:order-2"
          />
          <VisibilitySelector
            chatId={currentChatId ? String(currentChatId) : undefined}
            selectedVisibilityType={visibility}
            className="order-1 md:order-3"
            handleOnSelected={(v) => setVisibility(v)}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="order-3 px-2 md:order-4 md:h-fit md:px-2">
                <ShareIcon />
                <span className="md:sr-only">Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share Chat</TooltipContent>
          </Tooltip>
        </ >
      }
    >
      <>
        <div className="flex min-w-0 flex-col bg-background" style={{ height: 'calc(100dvh - 48px)' }}>
          <Messages
            chatId={currentChatId ? String(currentChatId) : ''}
            status={status}
            messages={messages}
            setMessages={setMessages}
            reload={() => Promise.resolve(undefined)}
            isReadonly={false}
            isArtifactVisible={false}
          />

          {/* Input Area */}
          <div className="mx-auto w-full px-4 pb-4 md:max-w-3xl md:pb-6">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="relative flex w-full flex-col gap-4">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    data-testid="multimodal-input"
                    placeholder="Send a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      'max-h-[calc(75dvh)] resize-none overflow-hidden rounded-2xl pb-10 pt-4 !text-base dark:border-zinc-700 dark:bg-zinc-950',
                    )}
                    rows={2}
                    autoFocus
                    disabled={status !== 'ready'}
                  />

                  <div className="absolute bottom-0 right-0 flex w-fit flex-row justify-end p-2">
                    {status === 'submitted' || status === 'streaming' ? (
                      <Button
                        data-testid="stop-button"
                        type="button"
                        className="h-fit rounded-full border p-1.5 dark:border-zinc-600"
                        onClick={handleStop}
                      >
                        <StopIcon size={14} />
                      </Button>
                    ) : (
                      <Button
                        data-testid="send-button"
                        type="submit"
                        className="size-8 rounded-lg border p-1.5 dark:border-zinc-900"
                        disabled={input.trim().length === 0}
                      >
                        <ArrowUpIcon size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </>
    </ChatLayout>
  );
}
