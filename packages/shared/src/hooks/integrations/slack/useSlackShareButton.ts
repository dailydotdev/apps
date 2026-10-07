import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import type { Post } from '../../../graphql/posts';
import { getPostById } from '../../../graphql/posts';
import { UserIntegrationType } from '../../../graphql/integrations';
import { useSlackShare } from './useSlackShare';
import { useIntegrationsQuery } from '../useIntegrationsQuery';
import { useLazyModal } from '../../useLazyModal';
import { useToastNotification } from '../../useToastNotification';
import { LazyModal } from '../../../components/modals/common/types';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LogEvent, Origin } from '../../../lib/log';
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
// `error` is appended by the API when the reader cancels or Slack refuses
const returnParams = ['lzym', postIdParam, scrollParam, originParam, 'error'];
const origins = new Set<string>(Object.values(Origin));

/**
 * Where Slack sends the user back when the share has no webapp page of its own
 * to return to, as on the extension: the API callback only ever redirects to a
 * path on the webapp, so it has to be the post's page.
 */
export const getSlackShareRedirectPath = (post: Post): string =>
  getPathnameWithQuery(
    `/posts/${post.slug ?? post.id}`,
    new URLSearchParams({
      lzym: LazyModal.SlackShare,
      [postIdParam]: post.id,
    }),
  );

/** The surface the share started on, with the scroll position to put back. */
export const getSlackShareOriginPath = ({
  post,
  origin,
  path,
  scrollY,
}: {
  post: Post;
  origin?: Origin;
  path: string;
  scrollY: number;
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

  return getPathnameWithQuery(pathname, params);
};

export const useSlackShareButton = ({
  post,
  origin,
  placement,
}: {
  post: Post;
  origin?: Origin;
  /** The surface the share control sits in, when `origin` names a control. */
  placement?: Origin;
}): UseSlackShareButton => {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { integration, canPostAsUser, connect, isLoading } = useSlackShare();
  const isConnected = !!integration;

  const openPicker = useCallback(() => {
    openModal({
      type: LazyModal.SlackShare,
      props: { post, origin, placement },
    });
  }, [openModal, post, origin, placement]);

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
        },
      }),
    );

    if (integration) {
      openPicker();

      return;
    }

    logEvent({
      event_name: LogEvent.StartAddingWorkspace,
      target_id: UserIntegrationType.Slack,
      extra: JSON.stringify({ origin, placement, reason: 'share' }),
    });

    if (isExtension) {
      connect(getSlackShareRedirectPath(post));

      return;
    }

    // a post modal masks the feed behind it with the post's URL, so the feed's
    // address and position come from what the modal stashed when it opened
    const feedPath = router?.query?.pmap as string | undefined;
    connect(
      getSlackShareOriginPath({
        post,
        origin,
        path: feedPath ?? router?.asPath ?? window.location.pathname,
        scrollY: feedPath
          ? getScrollPosition(window.location.href, 'post-modal') ?? 0
          : window.scrollY,
      }),
    );
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
    router,
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
      displayToast('Slack was not connected, so nothing was shared');

      return;
    }

    if (!post) {
      return;
    }

    const { scrollY, origin } = pending;

    openModal({
      type: LazyModal.SlackShare,
      props: {
        post,
        origin,
        // the feed behind the picker is still loading; by the time the picker
        // closes it is tall enough to scroll back to where the share started
        onAfterClose: () => {
          if (scrollY) {
            restoreScrollPosition(scrollY);
          }
        },
      },
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
