import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { getPostById } from '../../../graphql/posts';
import { UserIntegrationType } from '../../../graphql/integrations';
import { useSlackShare } from './useSlackShare';
import { useSlack } from './useSlack';
import type { SlackShareSnapshot } from './slackShareSnapshot';
import {
  clearSlackShareSnapshot,
  saveSlackShareSnapshot,
  takeSlackShareSnapshot,
} from './slackShareSnapshot';
import { useIntegrationsQuery } from '../useIntegrationsQuery';
import { useLazyModal } from '../../useLazyModal';
import { useToastNotification } from '../../useToastNotification';
import { LazyModal } from '../../../components/modals/common/types';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LogEvent, Origin } from '../../../lib/log';
import type { ShareablePost } from '../../../lib/feed';
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
const placementParam = 'slackPlacement';
const snapshotParam = 'slackSnapshot';
// `error` is appended by the API when the reader cancels or Slack refuses
const returnParams = [
  'lzym',
  postIdParam,
  scrollParam,
  originParam,
  placementParam,
  snapshotParam,
  'error',
];
const origins = new Set<string>(Object.values(Origin));

export type SlackConnectReason = 'share' | 'upgrade' | 'image_permission';

type SlackShareReturnParams = {
  post: ShareablePost;
  origin?: Origin;
  placement?: Origin;
  /** The attempt the stored snapshot belongs to. */
  snapshotId?: string;
};

const setSlackShareReturnParams = (
  params: URLSearchParams,
  { post, origin, placement, snapshotId }: SlackShareReturnParams,
): void => {
  params.set('lzym', LazyModal.SlackShare);
  params.set(postIdParam, post.id);

  if (origin) {
    params.set(originParam, origin);
  }

  if (placement) {
    params.set(placementParam, placement);
  }

  if (snapshotId) {
    params.set(snapshotParam, snapshotId);
  }
};

/**
 * Where Slack sends the user back when the share has no webapp page of its own
 * to return to, as on the extension: the API callback only ever redirects to a
 * path on the webapp, so it has to be the post's page.
 */
const getSlackShareRedirectPath = (
  returnTo: SlackShareReturnParams,
): string => {
  const params = new URLSearchParams();
  setSlackShareReturnParams(params, returnTo);

  return getPathnameWithQuery(
    `/posts/${returnTo.post.slug ?? returnTo.post.id}`,
    params,
  );
};

/** The surface the share started on, with the scroll position to put back. */
export const getSlackShareOriginPath = ({
  path,
  scrollY,
  ...returnTo
}: SlackShareReturnParams & {
  path: string;
  scrollY: number;
}): string => {
  const [pathname, query] = path.split('#')[0].split('?');
  const params = new URLSearchParams(query);
  returnParams.forEach((param) => params.delete(param));
  setSlackShareReturnParams(params, returnTo);
  params.set(scrollParam, `${Math.round(scrollY)}`);

  return getPathnameWithQuery(pathname, params);
};

const getSlackShareReturnPath = ({
  router,
  ...returnTo
}: SlackShareReturnParams & { router: NextRouter }): string => {
  if (isExtension) {
    return getSlackShareRedirectPath(returnTo);
  }

  // a post modal masks the feed behind it with the post's URL, so the feed's
  // address and position come from what the modal stashed when it opened
  const feedPath = router?.query?.pmap as string | undefined;

  return getSlackShareOriginPath({
    ...returnTo,
    path: feedPath ?? router?.asPath ?? window.location.pathname,
    scrollY: feedPath
      ? getScrollPosition(window.location.href, 'post-modal') ?? 0
      : window.scrollY,
  });
};

/**
 * Leaves for Slack's OAuth and comes back to the page the share started on,
 * bringing the snapshot along when there is one.
 */
export const useSlackConnect = ({
  post,
  origin,
  placement,
}: Omit<SlackShareReturnParams, 'snapshotId'>): ((params: {
  reason: SlackConnectReason;
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

      const snapshotId = snapshot && uuidv4();

      // the extension's IndexedDB is not the webapp's, where OAuth returns, so
      // its return finds nothing under this id and asks for a new snapshot
      if (snapshotId && snapshot && !isExtension) {
        await saveSlackShareSnapshot(snapshotId, snapshot);
      }

      connect({
        redirectPath: getSlackShareReturnPath({
          post,
          origin,
          placement,
          router,
          snapshotId,
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
  extra,
}: {
  post: ShareablePost;
  origin?: Origin;
  /** The surface the share control sits in, when `origin` names a control. */
  placement?: Origin;
  snapshot?: SlackShareSnapshot;
  /** Logged beside the share's own fields, like a highlight's id. */
  extra?: Record<string, unknown>;
}): UseSlackShareButton => {
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { integration, canPostAsUser, isLoading } = useSlackShare();
  const connectSlack = useSlackConnect({ post, origin, placement });
  const isConnected = !!integration;

  const openPicker = useCallback(() => {
    openModal({
      type: LazyModal.SlackShare,
      props: { post, origin, placement, snapshot, extra },
    });
  }, [openModal, post, origin, placement, snapshot, extra]);

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
          ...extra,
        },
      }),
    );

    if (integration) {
      openPicker();

      return;
    }

    connectSlack({ reason: 'share', snapshot });
  }, [
    isLoading,
    integration,
    canPostAsUser,
    openPicker,
    logEvent,
    origin,
    placement,
    connectSlack,
    post,
    snapshot,
    extra,
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
  placement?: Origin;
  error?: string;
  snapshotId?: string;
};

const readOrigin = (value: string | null): Origin | undefined =>
  value && origins.has(value) ? (value as Origin) : undefined;

const readSlackShareReturn = (): SlackShareReturn | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const params = new URLSearchParams(window.location.search);
  const postId = params.get(postIdParam);

  if (params.get('lzym') !== LazyModal.SlackShare || !postId) {
    return undefined;
  }

  return {
    postId,
    scrollY: Number(params.get(scrollParam)) || undefined,
    origin: readOrigin(params.get(originParam)),
    placement: readOrigin(params.get(placementParam)),
    error: params.get('error') ?? undefined,
    snapshotId: params.get(snapshotParam) ?? undefined,
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
  const isRefused = !!pending?.error;
  const {
    data: integrations,
    isSuccess: hasIntegrations,
    isError: isIntegrationsError,
  } = useIntegrationsQuery({ queryOptions: { enabled: !!pending } });
  const { data, isError: isPostMissing } = useQuery({
    queryKey: getPostByIdKey(pending?.postId ?? ''),
    queryFn: () => getPostById(pending!.postId),
    staleTime: StaleTime.Default,
    enabled: !!pending && !isRefused && tokenRefreshed,
  });
  const handled = useRef(false);
  const post = data?.post;
  const isConnected = !!integrations?.some(
    ({ type }) => type === UserIntegrationType.Slack,
  );
  const hasSettled = hasIntegrations || isIntegrationsError;
  const isNotConnected = hasSettled && !isConnected;

  useEffect(() => {
    if (
      !pending ||
      handled.current ||
      !(isRefused
        ? hasSettled
        : isNotConnected || isPostMissing || (isConnected && post))
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

    const { snapshotId } = pending;

    if (isRefused || isNotConnected) {
      if (snapshotId) {
        clearSlackShareSnapshot();
      }

      if (!hasIntegrations) {
        // the integrations query failed, so whether Slack is connected is unknown
        displayToast("Couldn't check Slack, so nothing was shared");
      } else if (!isConnected) {
        displayToast('Slack was not connected, so nothing was shared');
      } else if (snapshotId) {
        displayToast(
          "Slack permissions weren't updated, so the snapshot wasn't sent",
        );
      } else {
        displayToast(
          "Slack permissions weren't updated, so nothing was shared",
        );
      }

      return;
    }

    if (!post) {
      return;
    }

    const { scrollY, origin, placement } = pending;
    const openPicker = (snapshot?: SlackShareSnapshot) =>
      openModal({
        type: LazyModal.SlackShare,
        props: {
          post,
          origin,
          placement,
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

    if (!snapshotId) {
      openPicker();

      return;
    }

    // never fall back to the post link: the reader chose to send the image
    takeSlackShareSnapshot(snapshotId).then((snapshot) => {
      if (!snapshot) {
        displayToast('Slack is connected. Take the snapshot again to send it.');

        return;
      }

      openPicker(snapshot);
    });
  }, [
    pending,
    isRefused,
    hasSettled,
    hasIntegrations,
    isNotConnected,
    isPostMissing,
    isConnected,
    post,
    router,
    openModal,
    displayToast,
  ]);
};
