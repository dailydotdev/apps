import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { del as delCache, get as getCache, set as setCache } from 'idb-keyval';
import type { Post } from '../../../graphql/posts';
import { getPostById } from '../../../graphql/posts';
import type { SlackChannel } from '../../../graphql/integrations';
import { UserIntegrationType } from '../../../graphql/integrations';
import { useSlackShare } from './useSlackShare';
import { useSlack } from './useSlack';
import { useIntegrationsQuery } from '../useIntegrationsQuery';
import { useLazyModal } from '../../useLazyModal';
import { useToastNotification } from '../../useToastNotification';
import { LazyModal } from '../../../components/modals/common/types';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LogEvent, Origin } from '../../../lib/log';
import type { PostLogEventPost } from '../../../lib/feed';
import { postLogEvent } from '../../../lib/feed';
import { getPathnameWithQuery } from '../../../lib/links';
import { isExtension } from '../../../lib/func';
import { getPostByIdKey, StaleTime } from '../../../lib/query';
import {
  getScrollPosition,
  restoreScrollPosition,
} from '../../../lib/scrollRestoration';

export type UseSlackShareButton = {
  onClick: () => void;
  isConnected: boolean;
  /**
   * The integrations query has not settled, so a press cannot tell the picker
   * from OAuth yet. Render the control loading and disabled until it has.
   */
  isLoading: boolean;
  label: string;
};

const postIdParam = 'slackPostId';
const scrollParam = 'slackScrollY';
const originParam = 'slackOrigin';
const snapshotParam = 'slackSnapshot';
// `error` is appended by the API when the reader cancels or Slack refuses
const returnParams = [
  'lzym',
  postIdParam,
  scrollParam,
  originParam,
  snapshotParam,
  'error',
];
const origins = new Set<string>(Object.values(Origin));
export const slackShareSnapshotKey = 'slack_share_snapshot';

/** What sharing a post to Slack reads: its id, its page and what it logs. */
export type SlackSharePost = PostLogEventPost & Partial<Pick<Post, 'slug'>>;

/**
 * A snapshot sent in place of the post link, plus what the picker held when
 * it left for Slack's OAuth, so the return can put it all back.
 */
export type SlackShareSnapshot = {
  image: Blob;
  filename: string;
  message?: string;
  channel?: SlackChannel;
};

type StoredSlackShareSnapshot = SlackShareSnapshot & { postId: string };

// OAuth is a full page load, so the snapshot waits in IndexedDB for the return.
// A failed write only means the return asks for a new snapshot.
const saveSlackShareSnapshot = async (
  postId: string,
  snapshot: SlackShareSnapshot,
): Promise<void> => {
  const stored: StoredSlackShareSnapshot = { ...snapshot, postId };

  try {
    await setCache(slackShareSnapshotKey, stored);
  } catch {
    // the return finds nothing and says so
  }
};

const takeSlackShareSnapshot = async (
  postId: string,
): Promise<SlackShareSnapshot | undefined> => {
  try {
    const stored = await getCache<StoredSlackShareSnapshot>(
      slackShareSnapshotKey,
    );
    await delCache(slackShareSnapshotKey);

    if (!stored || stored.postId !== postId) {
      return undefined;
    }

    const { image, filename, message, channel } = stored;

    return { image, filename, message, channel };
  } catch {
    return undefined;
  }
};

/**
 * Where Slack sends the user back when the share has no webapp page of its own
 * to return to, as on the extension: the API callback only ever redirects to a
 * path on the webapp, so it has to be the post's page.
 */
export const getSlackShareRedirectPath = (
  post: SlackSharePost,
  hasSnapshot?: boolean,
): string => {
  const params = new URLSearchParams({
    lzym: LazyModal.SlackShare,
    [postIdParam]: post.id,
  });

  if (hasSnapshot) {
    params.set(snapshotParam, '1');
  }

  return getPathnameWithQuery(`/posts/${post.slug ?? post.id}`, params);
};

/** The surface the share started on, with the scroll position to put back. */
export const getSlackShareOriginPath = ({
  post,
  origin,
  path,
  scrollY,
  hasSnapshot,
}: {
  post: SlackSharePost;
  origin?: Origin;
  path: string;
  scrollY: number;
  hasSnapshot?: boolean;
}): string => {
  const [pathname, query] = path.split('#')[0].split('?');
  const params = new URLSearchParams(query);
  returnParams.forEach((param) => params.delete(param));
  params.set('lzym', LazyModal.SlackShare);
  params.set(postIdParam, post.id);
  params.set(scrollParam, `${Math.round(scrollY)}`);

  if (origin) {
    params.set(originParam, origin);
  }

  if (hasSnapshot) {
    params.set(snapshotParam, '1');
  }

  return getPathnameWithQuery(pathname, params);
};

const getSlackShareReturnPath = ({
  post,
  origin,
  router,
  hasSnapshot,
}: {
  post: SlackSharePost;
  origin?: Origin;
  router: NextRouter;
  hasSnapshot: boolean;
}): string => {
  if (isExtension) {
    return getSlackShareRedirectPath(post, hasSnapshot);
  }

  // a post modal masks the feed behind it with the post's URL, so the feed's
  // address and position come from what the modal stashed when it opened
  const feedPath = router?.query?.pmap as string | undefined;

  return getSlackShareOriginPath({
    post,
    origin,
    path: feedPath ?? router?.asPath ?? window.location.pathname,
    scrollY: feedPath
      ? getScrollPosition(window.location.href, 'post-modal') ?? 0
      : window.scrollY,
    hasSnapshot,
  });
};

/**
 * Leaves for Slack's OAuth and comes back to the page the share started on,
 * bringing the snapshot along when there is one.
 */
export const useSlackShareConnect = ({
  post,
  origin,
  placement,
}: {
  post: SlackSharePost;
  origin?: Origin;
  placement?: Origin;
}): ((params: {
  reason: string;
  snapshot?: SlackShareSnapshot;
}) => Promise<void>) => {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { connect } = useSlack();

  return useCallback(
    async ({ reason, snapshot }) => {
      logEvent({
        event_name: LogEvent.StartAddingWorkspace,
        target_id: UserIntegrationType.Slack,
        extra: JSON.stringify({
          origin,
          placement,
          reason,
          ...(snapshot && { content: 'snapshot' }),
        }),
      });

      // the extension's IndexedDB is not the webapp's, where OAuth returns
      if (snapshot && !isExtension) {
        await saveSlackShareSnapshot(post.id, snapshot);
      }

      connect({
        redirectPath: getSlackShareReturnPath({
          post,
          origin,
          router,
          hasSnapshot: !!snapshot,
        }),
      });
    },
    [logEvent, origin, placement, post, router, connect],
  );
};

export const useSlackShareButton = ({
  post,
  origin,
  placement,
  snapshot,
}: {
  post: SlackSharePost;
  origin?: Origin;
  /** The surface the share control sits in, when `origin` names a control. */
  placement?: Origin;
  /** Sent in place of the post link. */
  snapshot?: SlackShareSnapshot;
}): UseSlackShareButton => {
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { integration, canPostAsUser, isLoading } = useSlackShare();
  const connect = useSlackShareConnect({ post, origin, placement });
  const isConnected = !!integration;

  const openPicker = useCallback(() => {
    openModal({
      type: LazyModal.SlackShare,
      props: { post, origin, placement, snapshot },
    });
  }, [openModal, post, origin, placement, snapshot]);

  const onClick = useCallback(() => {
    if (isLoading) {
      return;
    }

    // logged on both branches: counting only the ones that go to OAuth would
    // hide every share attempt by someone already connected
    logEvent(
      postLogEvent(LogEvent.StartShareToSlack, post, {
        extra: {
          origin,
          placement,
          has_integration: !!integration,
          can_post_as_user: canPostAsUser,
          ...(snapshot && { content: 'snapshot' }),
        },
      }),
    );

    if (integration) {
      openPicker();

      return;
    }

    connect({ reason: 'share', snapshot });
  }, [
    isLoading,
    integration,
    canPostAsUser,
    openPicker,
    logEvent,
    origin,
    placement,
    connect,
    post,
    snapshot,
  ]);

  return {
    onClick,
    isConnected,
    isLoading,
    label: isConnected || isLoading ? 'Send to Slack' : 'Connect Slack',
  };
};

type SlackShareReturn = {
  postId: string;
  scrollY?: number;
  origin?: Origin;
  error?: string;
  hasSnapshot: boolean;
};

const readSlackShareReturn = (): SlackShareReturn | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const params = new URLSearchParams(window.location.search);
  const postId = params.get(postIdParam);
  const origin = params.get(originParam);

  if (params.get('lzym') !== LazyModal.SlackShare || !postId) {
    return undefined;
  }

  return {
    postId,
    scrollY: Number(params.get(scrollParam)) || undefined,
    origin: origin && origins.has(origin) ? (origin as Origin) : undefined,
    error: params.get('error') ?? undefined,
    hasSnapshot: params.has(snapshotParam),
  };
};

/**
 * Finishes a share that left for Slack's OAuth. The reader comes back to the
 * page the share started on, which can be any feed, a post or a brief (or the
 * post page, from the extension), so this sits on the app shell and fetches
 * the post itself rather than relying on a button that may not be there.
 */
export const useSlackShareReturn = (): void => {
  const router = useRouter();
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { tokenRefreshed } = useAuthContext();
  // read once: the params are cleared as soon as the return is handled
  const [pending] = useState(readSlackShareReturn);
  const isReturning = !!pending && !pending.error;
  const { data: integrations, isSuccess: hasIntegrations } =
    useIntegrationsQuery({ queryOptions: { enabled: isReturning } });
  const { data, isError: isPostMissing } = useQuery({
    queryKey: getPostByIdKey(pending?.postId ?? ''),
    queryFn: () => getPostById(pending!.postId),
    staleTime: StaleTime.Default,
    enabled: isReturning && tokenRefreshed,
  });
  const handled = useRef(false);
  const post = data?.post;
  const isConnected = !!integrations?.some(
    ({ type }) => type === UserIntegrationType.Slack,
  );
  const isNotConnected = !!pending?.error || (hasIntegrations && !isConnected);

  useEffect(() => {
    if (
      !pending ||
      handled.current ||
      !(isNotConnected || isPostMissing || (isConnected && post))
    ) {
      return;
    }

    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const query = { ...router.query };
    returnParams.forEach((param) => {
      params.delete(param);
      delete query[param];
    });

    // through the router, not history: the feed builds post modal URLs from
    // the router's asPath, which would otherwise bring the params back
    router.replace(
      { pathname: router.pathname, query },
      getPathnameWithQuery(window.location.pathname, params),
      { shallow: true, scroll: false },
    );

    if (isNotConnected) {
      if (pending.hasSnapshot) {
        takeSlackShareSnapshot(pending.postId);
      }

      displayToast('Slack was not connected, so nothing was shared');

      return;
    }

    if (!post) {
      return;
    }

    const { scrollY, origin } = pending;
    const openPicker = (snapshot?: SlackShareSnapshot) =>
      openModal({
        type: LazyModal.SlackShare,
        props: {
          post,
          origin,
          snapshot,
          // the feed behind the picker is still loading; by the time the picker
          // closes it is tall enough to scroll back to where the share started
          onAfterClose: () => {
            if (scrollY) {
              restoreScrollPosition(scrollY);
            }
          },
        },
      });

    if (!pending.hasSnapshot) {
      openPicker();

      return;
    }

    // never fall back to the post link: the reader chose to send the image
    takeSlackShareSnapshot(pending.postId).then((snapshot) => {
      if (!snapshot) {
        displayToast('Slack is connected. Take the snapshot again to send it.');

        return;
      }

      openPicker(snapshot);
    });
  }, [
    pending,
    isNotConnected,
    isPostMissing,
    isConnected,
    post,
    router,
    openModal,
    displayToast,
  ]);
};
