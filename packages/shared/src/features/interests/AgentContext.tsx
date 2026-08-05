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
import { UserInterestStatus } from '../../graphql/interests';
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
  /**
   * The agent's run state. Held here rather than read off `interest` so the
   * toggle responds on the demo surface too, where there is no API to write
   * back to.
   */
  status: UserInterestStatus;
  isDemo: boolean;
  isWorking: boolean;
  workingLabel?: string;
  /** Epoch ms the current run started, for the elapsed counter. */
  workingSince?: number;
  isTargetWorking: (targetId: string) => boolean;
  runCommand: (args: RunCommandArgs) => void;
  stopCommand: () => void;
  /** Prompts sent while a run is in flight; they start as the runs finish. */
  queuedCommands: { id: string; text: string }[];
  removeQueuedCommand: (id: string) => void;
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
    startedAt: number;
  } | null>(null);
  const [activity, setActivity] = useState<AgentActivityItem[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>(initialMessages);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [statusOverride, setStatusOverride] = useState<UserInterestStatus>();
  const status =
    statusOverride ?? interest?.status ?? UserInterestStatus.Active;
  const [content, setContent] = useState<{
    items: AgentContentTarget[];
    activeId?: string;
  }>({ items: [] });
  const [queuedCommands, setQueuedCommands] = useState<
    { id: string; args: RunCommandArgs }[]
  >([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  // The completion timeout needs the *current* starter to drain the queue, and
  // a plain closure would freeze the one from its own render.
  const startRunRef = useRef<(args: RunCommandArgs) => void>();
  const workingRef = useRef(false);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const startRun = useCallback(
    ({ text, label, targetId, onComplete }: RunCommandArgs) => {
      workingRef.current = true;
      if (!isDemo && interest) {
        sendCommand(text).catch(() => undefined);
      } else {
        displayToast('Sent to the agent — it will update in the background');
      }

      const stamp = `${Date.now()}`;
      setMessages((current) => [
        // Only one turn is ever in flight, and the timer below resolves the
        // new one by id — so a turn sent over a pending one would leave the
        // earlier reply spinning forever. Close it out instead.
        ...current.map((message) =>
          message.isPending
            ? {
                ...message,
                isPending: false,
                blocks: [
                  { type: 'text' as const, html: '<p>Interrupted.</p>' },
                ],
              }
            : message,
        ),
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

      setWorking({ label: label ?? text, targetId, startedAt: Date.now() });
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
        workingRef.current = false;
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
        // Drain the queue the way Claude Code does: the next queued prompt
        // becomes a real turn only once the previous one has resolved.
        setQueuedCommands((current) => {
          const [next, ...rest] = current;

          if (next) {
            setTimeout(() => startRunRef.current?.(next.args), 0);
          }

          return rest;
        });
      }, workDurationMs);
    },
    [displayToast, interest, isDemo, sendCommand],
  );

  useEffect(() => {
    startRunRef.current = startRun;
  }, [startRun]);

  const runCommand = useCallback(
    (args: RunCommandArgs) => {
      if (workingRef.current) {
        setQueuedCommands((current) => [
          ...current,
          { id: `${Date.now()}-${current.length}`, args },
        ]);
        return;
      }

      startRun(args);
    },
    [startRun],
  );

  const removeQueuedCommand = useCallback(
    (queuedId: string) =>
      setQueuedCommands((current) =>
        current.filter((command) => command.id !== queuedId),
      ),
    [],
  );

  // Interrupts the in-flight run the way Enter-then-Stop works in a terminal
  // agent: the pending turn resolves into a visible "stopped" note rather than
  // vanishing, so the transcript still reads as a record of what happened.
  const stopCommand = useCallback(() => {
    clearTimeout(timeoutRef.current);
    workingRef.current = false;
    setWorking(null);
    // Stop is a brake on everything: restarting queued prompts after an
    // explicit stop would resume work the user just refused.
    setQueuedCommands([]);
    setMessages((current) =>
      current.map((message) =>
        message.isPending
          ? {
              ...message,
              isPending: false,
              at: new Date().toISOString(),
              blocks: [{ type: 'text', html: '<p>Stopped.</p>' }],
            }
          : message,
      ),
    );
    setActivity((current) => [
      {
        id: `${Date.now()}-stopped`,
        at: new Date().toISOString(),
        kind: 'command',
        text: 'You stopped the run',
      },
      ...current,
    ]);
  }, []);

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
      if (data.status) {
        setStatusOverride(data.status);

        // Switching the agent off stops it: leaving a run in flight would
        // contradict the control the user just used.
        if (data.status !== UserInterestStatus.Active && working) {
          stopCommand();
        }
      }

      if (isDemo || !interest) {
        return;
      }

      updateInterest(data).catch(() => undefined);
    },
    [interest, isDemo, stopCommand, updateInterest, working],
  );

  const value = useMemo<AgentContextValue>(
    () => ({
      id,
      interest,
      status,
      isDemo,
      isWorking: !!working,
      workingLabel: working?.label,
      workingSince: working?.startedAt,
      isTargetWorking: (targetId) => working?.targetId === targetId,
      runCommand,
      stopCommand,
      queuedCommands: queuedCommands.map(({ id: queuedId, args }) => ({
        id: queuedId,
        text: args.text,
      })),
      removeQueuedCommand,
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
      queuedCommands,
      removeQueuedCommand,
      runCommand,
      status,
      stopCommand,
      update,
      working,
    ],
  );

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
};
