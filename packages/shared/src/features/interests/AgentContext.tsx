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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  InterestTurn,
  UpdateInterestInput,
  UserInterest,
} from '../../graphql/interests';
import {
  InterestRunStatus,
  InterestRunTrigger,
  UserInterestStatus,
} from '../../graphql/interests';
import { useSendInterestCommand } from './hooks/useSendInterestCommand';
import { useUpdateInterest } from './hooks/useUpdateInterest';
import { useToastNotification } from '../../hooks/useToastNotification';
import { useAuthContext } from '../../contexts/AuthContext';
import { interestHistoryQueryOptions } from './queries';
import { generateQueryKey, RequestKey } from '../../lib/query';
import type { Post } from '../../graphql/posts';
import type { AgentAttachment, AgentBlock, AgentMessage } from './chat';
import { promptWithContext } from './chat';
import type { AgentFeedItem } from './hooks/useAgentFeed';

export type AgentSummaryPost = Pick<
  Post,
  'id' | 'title' | 'createdAt' | 'contentHtml'
>;

export type AgentContentTarget =
  | { type: 'post'; post: Post }
  | { type: 'feed'; label: string; posts: Post[] }
  | { type: 'posts'; postId?: string }
  | { type: 'activity' }
  | { type: 'debug' };

export const contentTargetId = (target: AgentContentTarget): string => {
  if (target.type === 'post') {
    return `post:${target.post.id}`;
  }

  if (target.type === 'feed') {
    return `feed:${target.label}`;
  }

  if (target.type === 'posts' && target.postId) {
    return `posts:${target.postId}`;
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
  /** Standing feedback that never spends a run (reply votes). */
  sendFeedback: (text: string) => Promise<void>;
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
  findingsPosts: Post[];
  summaryPosts: AgentSummaryPost[];
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

const demoWorkDurationMs = 2600;
const pendingPollMs = 5000;
const echoMatchWindowMs = 60000;

// A timestamp alone is not unique: entries written in the same millisecond would
// share an id, which React reads as duplicate keys.
let idSequence = 0;
const nextId = (): string => {
  idSequence += 1;

  return `${Date.now()}-${idSequence}`;
};

const isRunPending = (turn: InterestTurn): boolean =>
  turn.role === 'agent' &&
  (turn.status === InterestRunStatus.Queued ||
    turn.status === InterestRunStatus.Running);

const mapServerBlocks = (
  turn: InterestTurn,
  postsById: Map<string, Post>,
  allPosts: Post[],
): AgentBlock[] =>
  (turn.blocks ?? []).reduce<AgentBlock[]>((acc, block) => {
    if (block.type === 'text') {
      acc.push(block);
      return acc;
    }

    if (block.type === 'picks') {
      const posts = block.postIds.reduce<Post[]>((found, postId) => {
        const post = postsById.get(postId);
        if (post) {
          found.push(post);
        }
        return found;
      }, []);

      if (posts.length) {
        acc.push({ type: 'picks', caption: block.caption, posts });
      }
      return acc;
    }

    if (allPosts.length) {
      acc.push({ type: 'feedLink', label: block.label, posts: allPosts });
    }
    return acc;
  }, []);

const turnsToMessages = ({
  turns,
  postsById,
  allPosts,
  summaryPostsById,
  interest,
}: {
  turns: InterestTurn[];
  postsById: Map<string, Post>;
  allPosts: Post[];
  summaryPostsById: Map<string, AgentSummaryPost>;
  interest?: UserInterest;
}): AgentMessage[] => {
  const feedbackTextById = new Map(
    turns
      .filter((turn) => turn.role === 'user')
      .map((turn) => [turn.id, turn.text ?? '']),
  );

  return turns.reduce<AgentMessage[]>((acc, turn) => {
    if (turn.role === 'user') {
      acc.push({
        id: turn.id,
        role: 'user',
        at: turn.createdAt,
        text: turn.text ?? '',
      });
      return acc;
    }

    const isPending = isRunPending(turn);
    const isError = turn.status === InterestRunStatus.Failed;
    const retryText = turn.feedbackId
      ? feedbackTextById.get(turn.feedbackId)
      : (turn.trigger === InterestRunTrigger.Spawn && interest?.query) ||
        undefined;
    const blocks = mapServerBlocks(turn, postsById, allPosts);

    if (!isPending && !isError && !blocks.length && !turn.summaryPostId) {
      // A quiet run delivered nothing; a command still deserves an answer.
      if (turn.trigger !== InterestRunTrigger.Command) {
        return acc;
      }
      blocks.push({
        type: 'text',
        html: '<p>Done. Nothing new cleared your bar this run.</p>',
      });
    }

    acc.push({
      id: turn.id,
      role: 'agent',
      at: turn.finishedAt ?? turn.createdAt,
      isPending,
      isScheduled: turn.trigger === InterestRunTrigger.Scheduled,
      isError,
      retryText,
      blocks: isPending || isError ? undefined : blocks,
      summaryPost:
        !isPending && !isError && turn.summaryPostId
          ? summaryPostsById.get(turn.summaryPostId)
          : undefined,
    });
    return acc;
  }, []);
};

type CommandEcho = {
  id: string;
  text: string;
  prompt: string;
  attachments?: AgentAttachment[];
  sentAt: number;
  state: 'sending' | 'sent' | 'error';
};

const echoResolved = (echo: CommandEcho, turns: InterestTurn[]): boolean =>
  turns.some(
    (turn) =>
      turn.role === 'user' &&
      turn.text === echo.prompt &&
      new Date(turn.createdAt).getTime() >= echo.sentAt - echoMatchWindowMs,
  );

export const AgentProvider = ({
  id,
  interest,
  isDemo,
  initialMessages = [],
  findings = [],
  posts = [],
  children,
}: {
  id: string;
  interest?: UserInterest;
  isDemo: boolean;
  initialMessages?: AgentMessage[];
  findings?: AgentFeedItem[];
  posts?: AgentSummaryPost[];
  children: ReactNode;
}): ReactElement => {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { sendCommand } = useSendInterestCommand(id);
  const { isUpdating, updateInterest } = useUpdateInterest(id);
  const queryClient = useQueryClient();
  const [demoMessages, setDemoMessages] =
    useState<AgentMessage[]>(initialMessages);
  const [echoes, setEchoes] = useState<CommandEcho[]>([]);
  const [workingMeta, setWorkingMeta] = useState<{
    label: string;
    targetId?: string;
  }>();
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
  // delivered the new working state, so it reads the ref rather than the state.
  const workingRef = useRef(false);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // `useState` reads its argument once, and the demo transcript can be handed in
  // after mount. Adopt it late, never over existing turns.
  useEffect(() => {
    if (!initialMessages.length) {
      return;
    }

    setDemoMessages((current) => (current.length ? current : initialMessages));
  }, [initialMessages]);

  // A sent echo also keeps the poll alive: its queued run may not be visible on
  // the replica yet, and without polling it would stay pending forever.
  const hasSentEcho = echoes.some((echo) => echo.state === 'sent');
  const historyQuery = useQuery({
    ...interestHistoryQueryOptions(id, user),
    enabled: !isDemo && !!user?.id && !!id,
    refetchInterval: (query) =>
      query.state.data?.some(isRunPending) || hasSentEcho
        ? pendingPollMs
        : false,
  });
  const turns = useMemo(
    () => (isDemo ? [] : historyQuery.data ?? []),
    [historyQuery.data, isDemo],
  );

  const { postsById, allPosts } = useMemo(() => {
    const byId = new Map<string, Post>();
    findings.forEach(({ post }) => byId.set(post.id, post));
    return { postsById: byId, allPosts: findings.map(({ post }) => post) };
  }, [findings]);

  const summaryPostsById = useMemo(
    () => new Map(posts.map((post) => [post.id, post])),
    [posts],
  );

  const unresolvedEchoes = useMemo(
    () => echoes.filter((echo) => !echoResolved(echo, turns)),
    [echoes, turns],
  );

  // Resolved echoes exist in the server history now; holding them longer would
  // render the same turn twice.
  useEffect(() => {
    if (unresolvedEchoes.length !== echoes.length) {
      setEchoes(unresolvedEchoes);
    }
  }, [echoes.length, unresolvedEchoes]);

  const messages = useMemo<AgentMessage[]>(() => {
    if (isDemo) {
      return demoMessages;
    }

    const echoed = unresolvedEchoes.flatMap<AgentMessage>((echo) => [
      {
        id: `${echo.id}-user`,
        role: 'user',
        at: new Date(echo.sentAt).toISOString(),
        text: echo.text,
        attachments: echo.attachments,
      },
      {
        id: `${echo.id}-agent`,
        role: 'agent',
        at: new Date(echo.sentAt).toISOString(),
        isPending: echo.state !== 'error',
        isError: echo.state === 'error',
        retryText: echo.state === 'error' ? echo.text : undefined,
      },
    ]);

    return [
      ...turnsToMessages({
        turns,
        postsById,
        allPosts,
        summaryPostsById,
        interest,
      }),
      ...echoed,
    ];
  }, [
    allPosts,
    demoMessages,
    interest,
    isDemo,
    postsById,
    summaryPostsById,
    turns,
    unresolvedEchoes,
  ]);

  const activity = useMemo<AgentActivityItem[]>(() => {
    if (isDemo) {
      return [];
    }

    const fromTurns = turns.reduce<AgentActivityItem[]>((acc, turn) => {
      if (turn.role === 'user') {
        acc.push({
          id: turn.id,
          at: turn.createdAt,
          kind: 'command',
          text: turn.text ?? '',
        });
        return acc;
      }

      if (turn.status === InterestRunStatus.Completed) {
        acc.push({
          id: turn.id,
          at: turn.finishedAt ?? turn.createdAt,
          kind: 'run',
          text: turn.findingsAdded
            ? `Run finished — added ${turn.findingsAdded} to your feed`
            : 'Run finished — nothing cleared your quality bar',
        });
        if (turn.summaryPostId) {
          acc.push({
            id: `${turn.id}-post`,
            at: turn.finishedAt ?? turn.createdAt,
            kind: 'post',
            text: 'Wrote a summary post',
          });
        }
      } else if (turn.status === InterestRunStatus.Failed) {
        acc.push({
          id: turn.id,
          at: turn.finishedAt ?? turn.createdAt,
          kind: 'run',
          text: 'A run failed before finishing',
        });
      }
      return acc;
    }, []);

    const fromFindings = findings.map<AgentActivityItem>((finding) => ({
      id: finding.id,
      at: finding.createdAt,
      kind: 'finding',
      text: finding.post.title
        ? `Added "${finding.post.title}"`
        : 'Added a finding',
    }));

    return [...fromTurns, ...fromFindings].sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );
  }, [findings, isDemo, turns]);

  const serverPending = turns.some(isRunPending);
  const echoPending = unresolvedEchoes.some((echo) => echo.state !== 'error');
  const isWorking = isDemo
    ? !!workingMeta && workingRef.current
    : serverPending || echoPending;
  workingRef.current = isWorking;

  const pendingTurn = turns.find(isRunPending);
  const pendingEcho = unresolvedEchoes.find((echo) => echo.state !== 'error');
  const workingSince = (() => {
    if (pendingTurn) {
      return new Date(pendingTurn.startedAt ?? pendingTurn.createdAt).getTime();
    }
    return pendingEcho?.sentAt;
  })();

  // A finished run means fresh findings, posts, and lastRun fields.
  const prevPendingRef = useRef(false);
  useEffect(() => {
    if (prevPendingRef.current && !serverPending) {
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.InterestFindings, user, id),
      });
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Interests, user),
      });
    }
    prevPendingRef.current = serverPending;
  }, [id, queryClient, serverPending, user]);

  const startRun = useCallback(
    ({
      text,
      label,
      targetId,
      attachments: pointedAt,
      onComplete,
    }: RunCommandArgs) => {
      workingRef.current = true;
      setWorkingMeta({ label: label ?? text, targetId });

      if (isDemo || !interest) {
        const stamp = nextId();
        setDemoMessages((current) => [
          ...current,
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
        displayToast('Sent to the agent. It will update in the background.');
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          workingRef.current = false;
          setWorkingMeta(undefined);
          setDemoMessages((current) =>
            current.map((message) =>
              message.id === `${stamp}-agent`
                ? {
                    ...message,
                    isPending: false,
                    at: new Date().toISOString(),
                    blocks: [
                      {
                        type: 'text',
                        html: '<p>Sent. This surface is a demo, so nothing actually ran.</p>',
                      },
                    ],
                  }
                : message,
            ),
          );
          onComplete?.();
        }, demoWorkDurationMs);

        return;
      }

      const echoId = nextId();
      const prompt = promptWithContext(text, pointedAt ?? []);
      setEchoes((current) => [
        ...current,
        {
          id: echoId,
          text,
          prompt,
          attachments: pointedAt,
          sentAt: Date.now(),
          state: 'sending',
        },
      ]);

      sendCommand({ text: prompt })
        .then(() => {
          setEchoes((current) =>
            current.map((echo) =>
              echo.id === echoId ? { ...echo, state: 'sent' } : echo,
            ),
          );
          onComplete?.();
        })
        .catch(() => {
          workingRef.current = false;
          setEchoes((current) =>
            current.map((echo) =>
              echo.id === echoId ? { ...echo, state: 'error' } : echo,
            ),
          );
        });
    },
    [displayToast, interest, isDemo, sendCommand],
  );

  // Draining in an effect, not inside the updater that removes the entry:
  // StrictMode re-runs updaters, which sent every queued prompt twice.
  useEffect(() => {
    if (isWorking || !queuedCommands.length) {
      return;
    }

    const [next] = queuedCommands;

    setQueuedCommands((current) => current.slice(1));
    startRun(next.args);
  }, [isWorking, queuedCommands, startRun]);

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

  const sendFeedback = useCallback(
    async (text: string) => {
      if (isDemo || !interest) {
        return;
      }

      await sendCommand({ text, triggerRun: false });
    },
    [interest, isDemo, sendCommand],
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
      }

      if (isDemo || !interest) {
        return;
      }

      updateInterest(data).catch(() => {
        if (data.status) {
          setStatusOverride(undefined);
        }
      });
    },
    [interest, isDemo, updateInterest],
  );

  // The override only bridges the gap until the refetched interest confirms
  // it; holding it longer would pin the UI to a stale optimistic value.
  useEffect(() => {
    if (statusOverride && interest?.status === statusOverride) {
      setStatusOverride(undefined);
    }
  }, [interest?.status, statusOverride]);

  const value = useMemo<AgentContextValue>(
    () => ({
      id,
      interest,
      status,
      isDemo,
      isWorking,
      workingLabel: isWorking ? workingMeta?.label ?? 'Working' : undefined,
      workingSince,
      isTargetWorking: (targetId) =>
        isWorking && workingMeta?.targetId === targetId,
      runCommand,
      sendFeedback,
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
      findingsPosts: allPosts,
      summaryPosts: posts,
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
      allPosts,
      posts,
      id,
      interest,
      isDemo,
      isSettingsOpen,
      isUpdating,
      isWorking,
      queuedCommands,
      removeQueuedCommand,
      runCommand,
      sendFeedback,
      status,
      update,
      workingMeta,
      workingSince,
    ],
  );

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
};
