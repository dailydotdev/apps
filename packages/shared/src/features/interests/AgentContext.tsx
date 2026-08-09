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
  /**
   * What the next prompt is pointed at. Held here rather than in the composer
   * because anything on screen can add to it, and most of those things are
   * nowhere near the field.
   */
  attachments: AgentAttachment[];
  attachContext: (attachment: AgentAttachment) => void;
  detachContext: (id: string) => void;
  /** The field itself, so an attachment made elsewhere lands you in it. */
  composerRef: React.RefObject<HTMLTextAreaElement>;
  /**
   * Text for the field, written from somewhere else on the screen. Consumed
   * once: the composer takes it, puts it in the field and clears it, so a
   * second press writes it again rather than being swallowed as unchanged.
   */
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
  // delivered the new `working`, so it reads the ref. The drain effect below
  // reads the state, because it is the render that has to react.
  const workingRef = useRef(false);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // `useState` reads its argument once, and the opening transcript is built
  // from a query — so a page that mounts while that query is in flight starts
  // empty and used to stay empty for good. Adopt it when it arrives, and only
  // while there is nothing to lose: a transcript with anything in it, or one
  // the reader has already spoken into, is never overwritten.
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
      if (!isDemo && interest) {
        sendCommand(promptWithContext(text, pointedAt ?? [])).catch(
          () => undefined,
        );
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
      }, workDurationMs);
    },
    [displayToast, interest, isDemo, sendCommand],
  );

  // Drain the queue the way Claude Code does: the next queued prompt becomes a
  // real turn only once the previous one has resolved.
  //
  // In an effect rather than inside the state updater that removes it. React
  // re-runs updaters under StrictMode — which Next has on by default — so a
  // prompt scheduled from inside one was being sent twice.
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
      // The references have left with the prompt, whether it ran or queued.
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

  // Adding the same thing twice is a no-op rather than a second chip: the
  // buttons that call this stay visible after you press them.
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
