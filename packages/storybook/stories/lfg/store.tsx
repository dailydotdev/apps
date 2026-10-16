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
import { useQueryClient } from '@tanstack/react-query';
import type {
  ChatMessage,
  HelperProfile,
  LfgPost,
  LfgUser,
  ReachOut,
} from './data';
import {
  Commitment,
  DAILY_REACH_OUTS,
  helpMatchPost,
  incomingReachOuts,
  LfgKind,
  me,
  ME_ID,
  myPost,
  NOW,
  POST_LIFETIME_DAYS,
  PostStatus,
  previousPitch,
  responsesFor,
  seedHelpers,
  seedPosts,
  spamReasons,
  users,
} from './data';

export type Route =
  | { name: 'board' }
  | { name: 'post'; id: string; openFound?: boolean }
  | { name: 'create' }
  | { name: 'messages'; tab: 'chats' | 'requests'; peerId?: string }
  | { name: 'activity' }
  | { name: 'discussion' }
  | { name: 'profile'; userId: string };

export enum NotifType {
  ReachOut = 'reach_out',
  Accepted = 'accepted',
  Match = 'match',
  Nudge = 'nudge',
  Filled = 'filled',
  CheckIn = 'check_in',
  HelpMatch = 'help_match',
  Launch = 'launch',
}

export interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body?: string;
  at: string;
  unread: boolean;
  route?: Route;
  postId?: string;
  peerId?: string;
}

export interface Chat {
  peerId: string;
  postId?: string;
  messages: ChatMessage[];
  typing?: boolean;
  unread?: boolean;
}

export interface BoardFilters {
  kind: 'all' | LfgKind;
  // UTC offsets; empty shows every time zone.
  timezones: number[];
  tags: string[];
  minReputation: number;
}

export const noFilters: Omit<BoardFilters, 'kind'> = {
  timezones: [],
  tags: [],
  minReputation: 0,
};

export interface ComposerPrefill {
  pitch?: string;
  answers?: Record<string, string>;
}

export interface ProtoState {
  route: Route;
  history: Route[];
  posts: LfgPost[];
  reachOuts: ReachOut[];
  chats: Chat[];
  notifications: Notif[];
  creditsUsed: number;
  composerFor?: string;
  composerPrefill?: ComposerPrefill;
  // Bumped when the demo guide refills the composer, so it remounts.
  composerKey: number;
  filters: BoardFilters;
  reported: string[];
  // Milestones the demo guide checks off.
  events: string[];
  toast?: string;
  // Set with a toast that offers Undo.
  undo?: () => void;
  endorsed?: string;
  draft?: NewPostInput;
  // Notifications already counted on the Activity badge.
  seen: string[];
  // What Noa has verified or added, toggled by the composer's nudges.
  verified: { github: boolean; company: boolean; experience: boolean };
  helpers: Record<string, HelperProfile>;
  // Agreed to the house rules before a first post.
  pledged: boolean;
  // Before launch the board collects posts; they all go live together.
  phase: 'prelaunch' | 'live';
}

export interface Scenario {
  route?: Route;
  withMyPost?: boolean;
  withIncoming?: boolean;
  withSentToday?: boolean;
  creditsUsed?: number;
  composerFor?: string;
  composerPrefill?: ComposerPrefill;
  notifications?: Notif[];
  chats?: Chat[];
  extraReachOuts?: ReachOut[];
  verified?: { github: boolean; company: boolean; experience: boolean };
  myHelper?: HelperProfile;
  phase?: 'prelaunch' | 'live';
  // Only these seed posts exist, for the cold-start scenarios.
  postIds?: string[];
}

const minutesAgo = (minutes: number): string =>
  new Date(NOW.getTime() - minutes * 60_000).toISOString();

export const buildState = (scenario: Scenario = {}): ProtoState => {
  const seeds = scenario.postIds
    ? seedPosts.filter((item) => scenario.postIds?.includes(item.id))
    : seedPosts;
  const posts = scenario.withMyPost ? [myPost, ...seeds] : [...seeds];
  const reachOuts: ReachOut[] = [
    ...(scenario.withIncoming ? incomingReachOuts : []),
    ...(scenario.withSentToday ? [previousPitch] : []),
    ...(scenario.extraReachOuts ?? []),
  ];

  return {
    route: scenario.route ?? { name: 'board' },
    history: [],
    posts,
    reachOuts,
    chats: scenario.chats ?? [],
    notifications: scenario.notifications ?? [
      {
        id: 'n-match',
        type: NotifType.Match,
        title: '3 new posts match tags you follow',
        body: 'PostgreSQL, TypeScript and React',
        at: minutesAgo(90),
        unread: false,
        route: { name: 'board' },
      },
    ],
    creditsUsed: scenario.creditsUsed ?? (scenario.withSentToday ? 1 : 0),
    composerFor: scenario.composerFor,
    composerPrefill: scenario.composerPrefill,
    composerKey: 0,
    filters: { kind: 'all', ...noFilters },
    reported: [],
    events: [],
    seen: [],
    verified: scenario.verified ?? {
      github: true,
      company: false,
      experience: true,
    },
    helpers: scenario.myHelper
      ? { ...seedHelpers, [ME_ID]: scenario.myHelper }
      : seedHelpers,
    pledged: false,
    phase: scenario.phase ?? 'live',
  };
};

export interface NewPostInput {
  kind: LfgKind;
  title: string;
  body: string;
  tags: string[];
  commitment: Commitment;
  showCountry: boolean;
  asks: LfgPost['asks'];
}

export interface ProtoApi {
  state: ProtoState;
  navigate: (route: Route) => void;
  back: () => void;
  setFilters: (filters: Partial<BoardFilters>) => void;
  openComposer: (postId: string) => void;
  closeComposer: () => void;
  sendReachOut: (input: {
    postId: string;
    pitch: string;
    answers: Record<string, string>;
  }) => void;
  publishPost: (input: NewPostInput) => void;
  answerRequest: (id: string, accept: boolean) => void;
  reportUser: (userId: string) => void;
  sendMessage: (peerId: string, body: string) => void;
  markFound: (postId: string, withUserId?: string) => void;
  renewPost: (postId: string) => void;
  endorse: (userId: string) => void;
  showToast: (message: string) => void;
  track: (event: string) => void;
  setDraft: (draft: NewPostInput) => void;
  fillComposer: (prefill: ComposerPrefill) => void;
  verify: (what: 'github' | 'company' | 'experience') => void;
  setHelper: (profile: HelperProfile | undefined) => void;
  pledge: () => void;
  simulate: {
    launch: () => void;
    helpMatch: () => void;
    myPost: () => void;
    accept: () => void;
    responses: () => void;
    weekLater: () => void;
    twoWeeksLater: () => void;
    exhaust: () => void;
  };
  reachOutsLeft: number;
}

// The real hook module is mocked in Storybook, so its key is repeated here.
const TOAST_NOTIF_KEY = ['toast_notif'];

const ProtoContext = createContext<ProtoApi | null>(null);

export const useProto = (): ProtoApi => {
  const api = useContext(ProtoContext);
  if (!api) {
    throw new Error('useProto must be used inside ProtoProvider');
  }
  return api;
};

const withEvent = (state: ProtoState, event: string): ProtoState =>
  state.events.includes(event)
    ? state
    : { ...state, events: [...state.events, event] };

const routeEvents = (route: Route): string[] => {
  switch (route.name) {
    case 'post':
      return ['open-post'];
    case 'create':
      return ['open-create'];
    case 'profile':
      return route.userId === ME_ID
        ? ['open-profile', 'open-own-profile']
        : ['open-profile'];
    case 'activity':
      return ['open-activity'];
    case 'messages':
      if (route.tab === 'requests') {
        return route.peerId
          ? ['open-requests', 'open-request']
          : ['open-requests'];
      }
      return route.peerId ? ['open-chat'] : [];
    default:
      return [];
  }
};

export const ProtoProvider = ({
  scenario,
  children,
}: {
  scenario?: Scenario;
  children: ReactNode;
}): ReactElement => {
  const [state, setState] = useState<ProtoState>(() => buildState(scenario));
  const replyTimer = useRef<ReturnType<typeof setTimeout>>();
  const queryClient = useQueryClient();

  const showToast = useCallback((message: string) => {
    setState((prev) => ({ ...prev, toast: message }));
  }, []);

  // Hands each toast to the app's real Toast renderer.
  useEffect(() => {
    if (!state.toast) {
      return;
    }
    queryClient.setQueryData(TOAST_NOTIF_KEY, {
      message: state.toast,
      timer: 5000,
      ...(state.undo && {
        action: {
          copy: 'Undo',
          onClick: () => {
            state.undo?.();
            queryClient.setQueryData(TOAST_NOTIF_KEY, null);
          },
        },
      }),
    });
    setState((prev) => ({ ...prev, toast: undefined, undo: undefined }));
  }, [state.toast, queryClient]);

  const api = useMemo<ProtoApi>(() => {
    const navigate = (route: Route) =>
      setState((prev) =>
        [
          ...routeEvents(route),
          ...(route.name === 'profile' &&
          route.userId === ME_ID &&
          prev.posts.some(
            (item) =>
              item.authorId === ME_ID && item.status === PostStatus.Open,
          )
            ? ['own-badge']
            : []),
          ...(route.name === 'post' && route.id === helpMatchPost.id
            ? ['open-help-post']
            : []),
        ].reduce(withEvent, {
          ...prev,
          route,
          history: [...prev.history, prev.route],
          composerFor: undefined,
          seen:
            route.name === 'activity'
              ? prev.notifications.map((item) => item.id)
              : prev.seen,
          chats: prev.chats.map((chat) =>
            route.name === 'messages' && chat.peerId === route.peerId
              ? { ...chat, unread: false }
              : chat,
          ),
        }),
      );

    const queueReply = (peerId: string, body: string) => {
      clearTimeout(replyTimer.current);
      setState((prev) => ({
        ...prev,
        chats: prev.chats.map((chat) =>
          chat.peerId === peerId ? { ...chat, typing: true } : chat,
        ),
      }));
      replyTimer.current = setTimeout(
        () =>
          setState((prev) => ({
            ...prev,
            chats: prev.chats.map((chat) =>
              chat.peerId === peerId
                ? {
                    ...chat,
                    typing: false,
                    messages: [
                      ...chat.messages,
                      {
                        id: `m-${Date.now()}`,
                        fromId: peerId,
                        body,
                        at: new Date().toISOString(),
                      },
                    ],
                  }
                : chat,
            ),
          })),
        1800,
      );
    };

    return {
      state,
      reachOutsLeft: Math.max(0, DAILY_REACH_OUTS - state.creditsUsed),
      navigate,
      back: () =>
        setState((prev) => {
          const history = [...prev.history];
          const route = history.pop() ?? { name: 'board' };
          return { ...prev, route, history, composerFor: undefined };
        }),
      setFilters: (filters) =>
        setState((prev) =>
          withEvent(
            { ...prev, filters: { ...prev.filters, ...filters } },
            'filter',
          ),
        ),
      openComposer: (postId) =>
        setState((prev) =>
          withEvent({ ...prev, composerFor: postId }, 'open-composer'),
        ),
      closeComposer: () =>
        setState((prev) => ({
          ...prev,
          composerFor: undefined,
          composerPrefill: undefined,
        })),
      sendReachOut: ({ postId, pitch, answers }) => {
        setState((prev) => {
          const target = prev.posts.find((item) => item.id === postId);
          if (!target) {
            return prev;
          }
          return withEvent(
            {
              ...prev,
              composerFor: undefined,
              composerPrefill: undefined,
              creditsUsed: prev.creditsUsed + 1,
              reachOuts: [
                ...prev.reachOuts,
                {
                  id: `r-${Date.now()}`,
                  postId,
                  fromId: ME_ID,
                  toId: target.authorId,
                  pitch,
                  answers,
                  createdAt: new Date().toISOString(),
                  status: 'pending',
                },
              ],
            },
            'send',
          );
        });
        showToast("Request sent. You'll hear back here if they accept.");
      },
      publishPost: (input) => {
        setState((prev) =>
          withEvent(
            {
              ...prev,
              posts: [
                {
                  ...input,
                  id: 'new',
                  authorId: ME_ID,
                  createdAt: NOW.toISOString(),
                  expiresAt: new Date(
                    NOW.getTime() + POST_LIFETIME_DAYS * 86_400_000,
                  ).toISOString(),
                  status: PostStatus.Open,
                  outsidePending: 0,
                },
                ...prev.posts.filter((item) => item.id !== 'new'),
              ],
              route: { name: 'post', id: 'new' },
              history: [...prev.history, prev.route],
              draft: undefined,
            },
            'publish',
          ),
        );
        showToast(
          state.phase === 'prelaunch'
            ? "You're in. Your post goes live when connections open, and your LFG badge is on."
            : `Your post is live for ${POST_LIFETIME_DAYS} days`,
        );
      },
      answerRequest: (id, accept) => {
        setState((prev) => {
          const request = prev.reachOuts.find((item) => item.id === id);
          if (!request) {
            return prev;
          }
          const reachOuts = prev.reachOuts.map((item) =>
            item.id === id
              ? { ...item, status: accept ? 'accepted' : 'declined' }
              : item,
          ) as ReachOut[];
          if (!accept) {
            return withEvent(
              {
                ...prev,
                reachOuts,
                route: { name: 'messages', tab: 'requests' },
                toast: "Declined. They won't be told.",
                undo: () =>
                  setState((current) => ({
                    ...current,
                    reachOuts: current.reachOuts.map((item) =>
                      item.id === id ? { ...item, status: 'pending' } : item,
                    ) as ReachOut[],
                    route: { name: 'messages', tab: 'requests', peerId: id },
                  })),
              },
              'decline',
            );
          }
          const chat: Chat = {
            peerId: request.fromId,
            postId: request.postId,
            messages: [
              {
                id: `m-${request.id}`,
                fromId: request.fromId,
                body: request.pitch,
                at: request.createdAt,
              },
            ],
          };
          return withEvent(
            {
              ...prev,
              reachOuts,
              chats: [
                chat,
                ...prev.chats.filter((item) => item.peerId !== chat.peerId),
              ],
              route: { name: 'messages', tab: 'chats', peerId: chat.peerId },
              history: [...prev.history, prev.route],
            },
            'accept',
          );
        });
      },
      reportUser: (userId) => {
        setState((prev) =>
          withEvent(
            {
              ...prev,
              reported: [...prev.reported, userId],
              reachOuts: prev.reachOuts.map((item) =>
                item.fromId === userId ? { ...item, status: 'declined' } : item,
              ) as ReachOut[],
              chats: prev.chats.filter((chat) => chat.peerId !== userId),
              route: {
                name: 'messages',
                tab:
                  prev.route.name === 'messages' ? prev.route.tab : 'requests',
              },
            },
            'report',
          ),
        );
        showToast(
          "Reported and blocked. We'll review the account and their other requests.",
        );
      },
      sendMessage: (peerId, body) => {
        setState((prev) =>
          withEvent(
            {
              ...prev,
              chats: prev.chats.map((chat) =>
                chat.peerId === peerId
                  ? {
                      ...chat,
                      messages: [
                        ...chat.messages,
                        {
                          id: `m-${Date.now()}`,
                          fromId: ME_ID,
                          body,
                          at: new Date().toISOString(),
                        },
                      ],
                    }
                  : chat,
              ),
            },
            'message',
          ),
        );
        const peer = users[peerId];
        queueReply(
          peerId,
          `Sounds good! Want to do a 20 minute call this week? I'm ${
            peer?.timezone ?? 'around'
          }, evenings work best.`,
        );
      },
      markFound: (postId, withUserId) => {
        setState((prev) => {
          const notified = prev.reachOuts.filter(
            (item) =>
              item.postId === postId &&
              item.status === 'pending' &&
              item.fromId !== withUserId,
          ).length;
          return withEvent(
            {
              ...prev,
              posts: prev.posts.map((item) =>
                item.id === postId
                  ? { ...item, status: PostStatus.Found }
                  : item,
              ),
              reachOuts: prev.reachOuts.map((item) =>
                item.postId === postId && item.status === 'pending'
                  ? { ...item, status: 'filled' }
                  : item,
              ) as ReachOut[],
              toast: notified
                ? `Marked as found. The ${notified} ${
                    notified === 1 ? 'person' : 'people'
                  } still waiting got a note that the spot is filled.`
                : 'Marked as found.',
            },
            'found',
          );
        });
      },
      renewPost: (postId) => {
        setState((prev) =>
          withEvent(
            {
              ...prev,
              posts: prev.posts.map((item) =>
                item.id === postId
                  ? {
                      ...item,
                      status: PostStatus.Open,
                      expiresAt: new Date(
                        NOW.getTime() + POST_LIFETIME_DAYS * 86_400_000,
                      ).toISOString(),
                    }
                  : item,
              ),
            },
            'renew',
          ),
        );
        showToast(`Renewed for another ${POST_LIFETIME_DAYS} days`);
      },
      endorse: (userId) => {
        setState((prev) =>
          withEvent(
            {
              ...prev,
              endorsed: userId,
              notifications: prev.notifications.map((item) =>
                item.type === NotifType.CheckIn
                  ? { ...item, unread: false }
                  : item,
              ),
            },
            'endorse',
          ),
        );
        showToast('Thanks! "Worked together" now shows on both profiles.');
      },
      showToast,
      track: (event) => setState((prev) => withEvent(prev, event)),
      setDraft: (draft) => setState((prev) => ({ ...prev, draft })),
      verify: (what) => {
        setState((prev) =>
          withEvent(
            { ...prev, verified: { ...prev.verified, [what]: true } },
            'verify',
          ),
        );
        showToast(
          {
            github: `GitHub connected as ${me.github}`,
            company: `Verified: you work at ${me.company}`,
            experience: 'CV uploaded. Your work experience is on your profile.',
          }[what],
        );
      },
      setHelper: (profile) =>
        setState((prev) => {
          const helpers = { ...prev.helpers };
          if (profile) {
            helpers[ME_ID] = profile;
          } else {
            delete helpers[ME_ID];
          }
          return withEvent(
            { ...prev, helpers },
            profile ? 'helper-on' : 'helper-off',
          );
        }),
      pledge: () =>
        setState((prev) => withEvent({ ...prev, pledged: true }, 'pledge')),
      fillComposer: (prefill) =>
        setState((prev) => ({
          ...prev,
          composerPrefill: prefill,
          composerKey: prev.composerKey + 1,
        })),
      simulate: {
        launch: () =>
          setState((prev) => {
            const mine = prev.posts.find(
              (item) =>
                item.authorId === ME_ID && item.status === PostStatus.Open,
            );
            return withEvent(
              {
                ...prev,
                phase: 'live',
                notifications: [
                  {
                    id: 'n-launch',
                    type: NotifType.Launch,
                    title: 'Connections are open',
                    body: mine
                      ? 'Your post is live, and people who follow its tags got a heads-up.'
                      : 'Every post that was waiting is live now.',
                    at: new Date().toISOString(),
                    unread: true,
                    route: mine
                      ? { name: 'post', id: mine.id }
                      : { name: 'board' },
                  },
                  ...prev.notifications,
                ],
                toast: mine
                  ? 'Connections are open. Your post is live.'
                  : 'Connections are open on Looking for group.',
              },
              'launch',
            );
          }),
        helpMatch: () =>
          setState((prev) => {
            const author = users[helpMatchPost.authorId];
            return withEvent(
              {
                ...prev,
                posts: [
                  helpMatchPost,
                  ...prev.posts.filter((item) => item.id !== helpMatchPost.id),
                ],
                notifications: [
                  {
                    id: 'n-help-match',
                    type: NotifType.HelpMatch,
                    title: `${author.name} asked for help with #${helpMatchPost.tags[0]}`,
                    body: `${helpMatchPost.title}. It matches what you're open to helping with.`,
                    at: new Date().toISOString(),
                    unread: true,
                    peerId: author.id,
                    route: { name: 'post', id: helpMatchPost.id },
                  },
                  ...prev.notifications,
                ],
              },
              'help-match',
            );
          }),
        myPost: () => {
          setState((prev) =>
            withEvent(
              {
                ...prev,
                posts: [
                  myPost,
                  ...prev.posts.filter((item) => item.id !== myPost.id),
                ],
              },
              'my-badge',
            ),
          );
          showToast('Your post is live. Your avatar now shows the LFG badge.');
        },
        exhaust: () =>
          setState((prev) => ({ ...prev, creditsUsed: DAILY_REACH_OUTS })),
        accept: () => {
          setState((prev) => {
            const mine = [...prev.reachOuts]
              .reverse()
              .find(
                (item) => item.fromId === ME_ID && item.status === 'pending',
              );
            if (!mine) {
              return prev;
            }
            const peer = users[mine.toId];
            const target = prev.posts.find((item) => item.id === mine.postId);
            return withEvent(
              {
                ...prev,
                creditsUsed: Math.max(0, prev.creditsUsed - 1),
                reachOuts: prev.reachOuts.map((item) =>
                  item.id === mine.id ? { ...item, status: 'accepted' } : item,
                ) as ReachOut[],
                chats: [
                  {
                    peerId: mine.toId,
                    postId: mine.postId,
                    unread: true,
                    messages: [
                      {
                        id: `m-${mine.id}`,
                        fromId: ME_ID,
                        body: mine.pitch,
                        at: mine.createdAt,
                      },
                      {
                        id: `m-${mine.id}-reply`,
                        fromId: mine.toId,
                        body: 'Thanks for the detailed pitch, the repo is exactly the kind of thing I had in mind. Do you have time for a call on Thursday?',
                        at: new Date().toISOString(),
                      },
                    ],
                  },
                  ...prev.chats,
                ],
                notifications: [
                  {
                    id: `n-accept-${mine.id}`,
                    type: NotifType.Accepted,
                    title: `${peer.name} accepted your request`,
                    body: target?.title,
                    at: new Date().toISOString(),
                    unread: true,
                    route: {
                      name: 'messages',
                      tab: 'chats',
                      peerId: mine.toId,
                    },
                  },
                  ...prev.notifications,
                ],
                toast: `${peer.name} accepted. Your reach-out credit is back.`,
              },
              'accepted',
            );
          });
        },
        responses: () => {
          setState((prev) => {
            const target =
              prev.posts.find((item) => item.id === 'new') ??
              prev.posts.find((item) => item.authorId === ME_ID);
            if (!target) {
              return prev;
            }
            const arrived = responsesFor(target);
            return withEvent(
              {
                ...prev,
                reachOuts: [
                  ...prev.reachOuts.filter((item) => item.postId !== target.id),
                  ...arrived,
                ],
                notifications: [
                  {
                    id: `n-responses-${target.id}`,
                    type: NotifType.ReachOut,
                    title: `${
                      arrived.filter((item) => !spamReasons[item.fromId]).length
                    } people reached out about your post`,
                    body: target.title,
                    at: new Date().toISOString(),
                    unread: true,
                    route: { name: 'messages', tab: 'requests' },
                  },
                  ...prev.notifications,
                ],
              },
              'responses',
            );
          });
        },
        weekLater: () =>
          setState((prev) => {
            const target = prev.posts.find(
              (item) => item.authorId === ME_ID && item.status === 'open',
            );
            if (!target) {
              return prev;
            }
            const waiting = prev.reachOuts.filter(
              (item) => item.postId === target.id && item.status === 'pending',
            ).length;
            return withEvent(
              {
                ...prev,
                posts: prev.posts.map((item) =>
                  item.id === target.id
                    ? {
                        ...item,
                        expiresAt: new Date(
                          NOW.getTime() + 3 * 86_400_000,
                        ).toISOString(),
                      }
                    : item,
                ),
                notifications: [
                  {
                    id: `n-nudge-${target.id}`,
                    type: NotifType.Nudge,
                    title: waiting
                      ? `Still looking? ${waiting} ${
                          waiting === 1 ? 'response is' : 'responses are'
                        } waiting`
                      : 'Still looking? Your post expires in 3 days',
                    body: target.title,
                    at: new Date().toISOString(),
                    unread: true,
                    postId: target.id,
                    route: { name: 'post', id: target.id },
                  },
                  ...prev.notifications,
                ],
              },
              'week',
            );
          }),
        twoWeeksLater: () =>
          setState((prev) => {
            const partner =
              prev.chats.find((chat) =>
                prev.posts.some(
                  (item) => item.id === chat.postId && item.authorId === ME_ID,
                ),
              )?.peerId ?? 'lior';
            return withEvent(
              {
                ...prev,
                notifications: [
                  {
                    id: 'n-checkin',
                    type: NotifType.CheckIn,
                    title: `Did you end up working with ${users[partner].name}?`,
                    body: 'Two weeks ago you teamed up through Looking for group',
                    at: new Date().toISOString(),
                    unread: true,
                    peerId: partner,
                  },
                  ...prev.notifications,
                ],
              },
              'two-weeks',
            );
          }),
      },
    };
  }, [state, showToast]);

  return <ProtoContext.Provider value={api}>{children}</ProtoContext.Provider>;
};

export const findPost = (
  state: ProtoState,
  id: string | undefined,
): LfgPost | undefined => state.posts.find((item) => item.id === id);

// Filtered (spam) requests never count: they don't notify or wait on you.
export const pendingFor = (state: ProtoState, postId: string): ReachOut[] =>
  state.reachOuts.filter(
    (item) =>
      item.postId === postId &&
      item.status === 'pending' &&
      !spamReasons[item.fromId],
  );

export const myRequestTo = (
  state: ProtoState,
  postId: string,
): ReachOut | undefined =>
  state.reachOuts.find(
    (item) => item.postId === postId && item.fromId === ME_ID,
  );

export const openPostOf = (
  state: ProtoState,
  userId: string,
): LfgPost | undefined =>
  state.posts.find(
    (item) => item.authorId === userId && item.status === PostStatus.Open,
  );

export const isLooking = (state: ProtoState, userId: string): boolean =>
  !!openPostOf(state, userId);

// What others see of Noa right now: only verified details count.
export const currentMe = (state: ProtoState): LfgUser => ({
  ...me,
  github: state.verified.github ? me.github : undefined,
  company: state.verified.company ? me.company : undefined,
  experienceYears: state.verified.experience ? me.experienceYears : undefined,
});

export const userFor = (state: ProtoState, userId: string): LfgUser =>
  userId === ME_ID ? currentMe(state) : users[userId];
