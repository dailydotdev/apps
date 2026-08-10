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
import type { AgentAttachment, AgentMessage } from './chat';
import { cannedReply, promptWithContext } from './chat';

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
  attachments?: AgentAttachment[];
  onComplete?: () => void;
};

type AgentContextValue = {
  id: string;
  interest?: UserInterest;
  /** Held here rather than read off `interest`: the demo surface has no API. */
  status: UserInterestStatus;
  isDemo: boolean;
  isWorking: boolean;
  workingLabel?: string;
  /** Epoch ms the current run started. */
  workingSince?: number;
  isTargetWorking: (targetId: string) => boolean;
  runCommand: (args: RunCommandArgs) => void;
  stopCommand: () => void;
  queuedCommands: { id: string; text: string }[];
  removeQueuedCommand: (id: string) => void;
  attachments: AgentAttachment[];
  attachContext: (attachment: AgentAttachment) => void;
  detachContext: (id: string) => void;
  composerRef: React.RefObject<HTMLTextAreaElement>;
  /** Consumed once: the composer clears it, so the same text can be rewritten. */
  draft?: string;
  writeDraft: (text: string) => void;
  clearDraft: () => void;
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

// A timestamp alone is not unique: entries written in the same millisecond would
// share an id, which React reads as duplicate keys.
let idSequence = 0;
const nextId = (): string => {
  idSequence += 1;

  return `${Date.now()}-${idSequence}`;
};

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
  const [attachments, setAttachments] = useState<AgentAttachment[]>([]);
  const [draft, setDraft] = useState<string>();
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  // `runCommand` decides queue-or-start during an event, before a re-render has
  // delivered the new `working`, so it reads the ref rather than the state.
  const workingRef = useRef(false);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // `useState` reads its argument once, and the opening transcript comes from a
  // query that can land after mount. Adopt it late, never over existing turns.
  useEffect(() => {
    if (!initialMessages.length) {
      return;
    }

    setMessages((current) => (current.length ? current : initialMessages));
  }, [initialMessages]);

  const startRun = useCallback(
    ({
      text,
      label,
      targetId,
      attachments: pointedAt,
      onComplete,
    }: RunCommandArgs) => {
      workingRef.current = true;

      const stamp = nextId();
      setMessages((current) => [
        // The timer below resolves only the new turn by id, so an earlier
        // pending turn left open would spin forever.
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
          attachments: pointedAt,
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
          id: nextId(),
          at: new Date().toISOString(),
          kind: 'command',
          text,
        },
        ...current,
      ]);

      const settle = (patch: Partial<AgentMessage>) => {
        workingRef.current = false;
        setWorking(null);
        setMessages((current) =>
          current.map((message) =>
            message.id === `${stamp}-agent`
              ? {
                  ...message,
                  isPending: false,
                  at: new Date().toISOString(),
                  ...patch,
                }
              : message,
          ),
        );
        onComplete?.();
      };

      if (isDemo || !interest) {
        displayToast('Sent to the agent. It will update in the background.');
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          settle({ blocks: cannedReply(text) });
          setActivity((current) => [
            {
              id: `${nextId()}-done`,
              at: new Date().toISOString(),
              kind: 'run',
              text: `Applied "${text}" and refreshed the results`,
            },
            ...current,
          ]);
        }, workDurationMs);

        return;
      }

      // The live transcript answers to the mutation, never to a timer. A canned
      // reply here reported findings the backend never sent, under a toast
      // saying the command had failed.
      sendCommand(promptWithContext(text, pointedAt ?? []))
        .then(() =>
          settle({
            blocks: [
              {
                type: 'text',
                html: '<p>Sent. This agent reports back on its next run.</p>',
              },
            ],
          }),
        )
        .catch(() => settle({ isError: true, retryText: text }));
    },
    [displayToast, interest, isDemo, sendCommand],
  );

  // Draining in an effect, not inside the updater that removes the entry:
  // StrictMode re-runs updaters, which sent every queued prompt twice.
  useEffect(() => {
    if (working || !queuedCommands.length) {
      return;
    }

    const [next] = queuedCommands;

    setQueuedCommands((current) => current.slice(1));
    startRun(next.args);
  }, [queuedCommands, startRun, working]);

  const runCommand = useCallback(
    (args: RunCommandArgs) => {
      if (args.attachments?.length) {
        setAttachments([]);
      }

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

  const attachContext = useCallback((attachment: AgentAttachment) => {
    setAttachments((current) =>
      current.some(({ id: existing }) => existing === attachment.id)
        ? current
        : [...current, attachment],
    );
    composerRef.current?.focus();
  }, []);

  const detachContext = useCallback(
    (attachmentId: string) =>
      setAttachments((current) =>
        current.filter(({ id: existing }) => existing !== attachmentId),
      ),
    [],
  );

  const removeQueuedCommand = useCallback(
    (queuedId: string) =>
      setQueuedCommands((current) =>
        current.filter((command) => command.id !== queuedId),
      ),
    [],
  );

  const stopCommand = useCallback(() => {
    clearTimeout(timeoutRef.current);
    workingRef.current = false;
    setWorking(null);
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
        id: `${nextId()}-stopped`,
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
      attachments,
      attachContext,
      detachContext,
      composerRef,
      draft,
      writeDraft: setDraft,
      clearDraft: () => setDraft(undefined),
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
      attachContext,
      attachments,
      draft,
      closeAllContent,
      closeContent,
      content,
      detachContext,
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
