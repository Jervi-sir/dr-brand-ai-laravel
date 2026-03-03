import { PreviewMessage, ThinkingMessage } from './message';
import { memo, useEffect, useRef } from 'react';
import equal from 'fast-deep-equal';
import { Overview } from './overview';

interface MessagesProps {
  chatId: string;
  status: 'ready' | 'submitted' | 'streaming';
  votes?: Array<any> | undefined;
  messages: Array<any>;
  setMessages: (messages: any[] | ((messages: any[]) => any[])) => void;
  reload: () => Promise<string | null | undefined>;
  isReadonly: boolean;
  isArtifactVisible?: boolean;
}

function PureMessages({ chatId, status, votes, messages, setMessages, reload, isReadonly, isArtifactVisible }: MessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const atBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    isAtBottomRef.current = atBottom;
  };

  useEffect(() => {
    if (isAtBottomRef.current && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  useEffect(() => {
    if (status === 'submitted') {
      isAtBottomRef.current = true;
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [status]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex min-w-0 flex-1 flex-col gap-6 overflow-y-auto pt-4"
    >
      {messages.length === 0 && <Overview />}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === 'streaming' && messages.length - 1 === index}
          vote={votes ? votes.find((vote) => vote.messageId === message.id) : undefined}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />
      ))}

      {status === 'submitted' && messages.length > 0 && messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      <div ref={endRef} className="min-h-[24px] min-w-[24px] shrink-0" />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible !== nextProps.isArtifactVisible) return false;
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
