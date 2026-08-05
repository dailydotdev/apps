import type { ReactElement, ReactNode } from 'react';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  UpdateInterestInput,
  UserInterest,
} from '../../graphql/interests';
import { useSendInterestCommand } from './hooks/useSendInterestCommand';
import { useUpdateInterest } from './hooks/useUpdateInterest';
import { useToastNotification } from '../../hooks/useToastNotification';
import type { Post } from '../../graphql/posts';
import type { AgentMessage } from './chat';
import { cannedReply } from './chat';

export type AgentContentTarget =
  | { type: 'post'; post: Post }
  | { type: 'feed'; label: string; posts: Post[] }
  | { type: 'activity' }
  | { type: 'debug' };

export const contentTargetId = (target: AgentContentTarget): string => {
  if (target.type === 'post') {
    return `post:${target.post.id}`;
  }

  if (target.type === 'feed') {
    return `feed:${target.label}`;
  }

  return target.type;
};

export type AgentActivityKind =
  | 'run'
  | 'command'
  | 'finding'
  | 'post'
  | 'notification';

export type AgentActivityItem = {
  id: string;
  at: string;
  kind: AgentActivityKind;
  text: string;
};

type RunCommandArgs = {
  text: string;
  label?: string;
  targetId?: string;
  onComplete?: () => void;
};

type AgentContextValue = {
  id: string;
  interest?: UserInterest;
  isDemo: boolean;
  isWorking: boolean;
  workingLabel?: string;
  isTargetWorking: (targetId: string) => boolean;
  runCommand: (args: RunCommandArgs) => void;
  update: (data: UpdateInterestInput) => void;
  isUpdating: boolean;
  activity: AgentActivityItem[];
  messages: AgentMessage[];
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  openContent: AgentContentTarget[];
  activeContentId?: string;
  activeContent?: AgentContentTarget;
  openContentTarget: (target: AgentContentTarget) => void;
  focusContent: (targetId: string) => void;
  closeContent: (targetId: string) => void;
  closeAllContent: () => void;
};

const AgentContext = createContext<AgentContextValue>({} as AgentContextValue);

export const useAgent = (): AgentContextValue => useContext(AgentContext);

const workDurationMs = 2600;

export const AgentProvider = ({
  id,
  interest,
  isDemo,
  initialMessages,
  children,
}: {
  id: string;
  interest?: UserInterest;
  isDemo: boolean;
  initialMessages: AgentMessage[];
  children: ReactNode;
}): ReactElement => {
  const { displayToast } = useToastNotification();
  const { sendCommand } = useSendInterestCommand(id);
  const { isUpdating, updateInterest } = useUpdateInterest(id);
  const [working, setWorking] = useState<{
    label: string;
    targetId?: string;
  } | null>(null);
  const [activity, setActivity] = useState<AgentActivityItem[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>(initialMessages);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [content, setContent] = useState<{
    items: AgentContentTarget[];
    activeId?: string;
  }>({ items: [] });
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const runCommand = useCallback(
    ({ text, label, targetId, onComplete }: RunCommandArgs) => {
      if (!isDemo && interest) {
        sendCommand(text).catch(() => undefined);
      } else {
        displayToast('Sent to the agent — it will update in the background');
      }

      const stamp = `${Date.now()}`;
      setMessages((current) => [
        ...current,
        {
          id: `${stamp}-user`,
          role: 'user',
          at: new Date().toISOString(),
          text,
        },
        {
          id: `${stamp}-agent`,
          role: 'agent',
          at: new Date().toISOString(),
          isPending: true,
        },
      ]);

      setWorking({ label: label ?? text, targetId });
      setActivity((current) => [
        {
          id: `${Date.now()}`,
          at: new Date().toISOString(),
          kind: 'command',
          text,
        },
        ...current,
      ]);

      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setWorking(null);
        setMessages((current) =>
          current.map((message) =>
            message.id === `${stamp}-agent`
              ? {
                  ...message,
                  isPending: false,
                  at: new Date().toISOString(),
                  blocks: cannedReply(text),
                }
              : message,
          ),
        );
        setActivity((current) => [
          {
            id: `${Date.now()}-done`,
            at: new Date().toISOString(),
            kind: 'run',
            text: `Applied "${text}" and refreshed the results`,
          },
          ...current,
        ]);
        onComplete?.();
      }, workDurationMs);
    },
    [displayToast, interest, isDemo, sendCommand],
  );

  const openContentTarget = useCallback((target: AgentContentTarget) => {
    const targetId = contentTargetId(target);

    setContent(({ items }) => ({
      items: items.some((item) => contentTargetId(item) === targetId)
        ? items
        : [...items, target],
      activeId: targetId,
    }));
  }, []);

  const focusContent = useCallback(
    (targetId: string) =>
      setContent(({ items }) => ({ items, activeId: targetId })),
    [],
  );

  const closeContent = useCallback((targetId: string) => {
    setContent(({ items, activeId }) => {
      const index = items.findIndex(
        (item) => contentTargetId(item) === targetId,
      );

      if (index < 0) {
        return { items, activeId };
      }

      const next = items.filter((_, position) => position !== index);
      // Focus the tab that slid into the closed one's slot, falling back to the
      // new last tab when the closed one was rightmost.
      const successor = next[index] ?? next[next.length - 1];

      return {
        items: next,
        activeId:
          activeId === targetId && successor
            ? contentTargetId(successor)
            : activeId,
      };
    });
  }, []);

  const closeAllContent = useCallback(() => setContent({ items: [] }), []);

  const update = useCallback(
    (data: UpdateInterestInput) => {
      if (isDemo || !interest) {
        return;
      }

      updateInterest(data).catch(() => undefined);
    },
    [interest, isDemo, updateInterest],
  );

  const value = useMemo<AgentContextValue>(
    () => ({
      id,
      interest,
      isDemo,
      isWorking: !!working,
      workingLabel: working?.label,
      isTargetWorking: (targetId) => working?.targetId === targetId,
      runCommand,
      update,
      isUpdating,
      activity,
      messages,
      isSettingsOpen,
      setSettingsOpen,
      openContent: content.items,
      activeContentId: content.activeId,
      activeContent: content.items.find(
        (item) => contentTargetId(item) === content.activeId,
      ),
      openContentTarget,
      focusContent,
      closeContent,
      closeAllContent,
    }),
    [
      closeAllContent,
      closeContent,
      content,
      focusContent,
      openContentTarget,
      activity,
      messages,
      id,
      interest,
      isDemo,
      isSettingsOpen,
      isUpdating,
      runCommand,
      update,
      working,
    ],
  );

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
};
