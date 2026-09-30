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
import { useFeaturesReadyContext } from '../../../components/GrowthBookProvider';
import { LazyModal } from '../../../components/modals/common/types';
import { useLogContext } from '../../../contexts/LogContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { LogEvent, Origin } from '../../../lib/log';
import { postLogEvent } from '../../../lib/feed';
import { getPathnameWithQuery } from '../../../lib/links';
import { isExtension } from '../../../lib/func';
import { featureSlackConnectV2 } from '../../../lib/featureManagement';
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
 * Where Slack sends the user back. It has to be the post's own page: the share
 * can start from a post modal over the feed or from the extension, and neither
 * is an address the API callback can return to, since it only ever redirects to
 * a path on the webapp.
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
}: {
  post: Post;
  origin?: Origin;
}): UseSlackShareButton => {
  const router = useRouter();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { getFeatureValue } = useFeaturesReadyContext();
  const { integration, canPostAsUser, connect, isLoading } = useSlackShare();
  const isConnected = !!integration;

  const openPicker = useCallback(() => {
    openModal({ type: LazyModal.SlackShare, props: { post, origin } });
  }, [openModal, post, origin]);

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
      extra: JSON.stringify({ origin, reason: 'share' }),
    });

    // read on press, not on render: every Share menu mounts this hook, and
    // only the surfaces that look different should enroll a reader
    if (isExtension || !getFeatureValue(featureSlackConnectV2)) {
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
    connect,
    post,
    getFeatureValue,
    router,
  ]);

  return {
    onClick,
    isConnected,
    isLoading,
    label: isConnected || isLoading ? 'Send to Slack' : 'Connect Slack',
  };
};

const readSlackShareReturnPostId = (): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const params = new URLSearchParams(window.location.search);

  // a return to the surface the share started on is useSlackShareOriginReturn's
  return params.get('lzym') === LazyModal.SlackShare && !params.has(scrollParam)
    ? params.get(postIdParam) ?? undefined
    : undefined;
};

/**
 * Reopens the picker after the OAuth round trip. It lives on the post page
 * rather than on the share button because the button that started the flow may
 * not exist at the destination: the share can begin in a post modal or on the
 * extension, and the share bar itself is desktop only.
 */
export const useSlackShareReturn = ({ post }: { post?: Post }): void => {
  const { openModal } = useLazyModal();
  // read once from the location, and deliberately not keyed on the post: the
  // post arrives a render later than the URL does, so a latch that consulted it
  // would conclude there was nothing to return to
  const [returnPostId] = useState(readSlackShareReturnPostId);
  const { integration, isLoading } = useSlackShare({ enabled: !!returnPostId });
  const reopened = useRef(false);

  useEffect(() => {
    if (
      !returnPostId ||
      reopened.current ||
      isLoading ||
      !integration ||
      post?.id !== returnPostId
    ) {
      return;
    }

    reopened.current = true;

    const params = new URLSearchParams(window.location.search);
    params.delete('lzym');
    params.delete(postIdParam);

    window.history.replaceState(
      window.history.state,
      '',
      getPathnameWithQuery(window.location.pathname, params),
    );

    openModal({ type: LazyModal.SlackShare, props: { post } });
  }, [returnPostId, isLoading, integration, post, openModal]);
};

type SlackShareOriginReturn = {
  postId: string;
  scrollY: number;
  origin?: Origin;
  error?: string;
};

const readSlackShareOriginReturn = (): SlackShareOriginReturn | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const params = new URLSearchParams(window.location.search);
  const postId = params.get(postIdParam);
  const origin = params.get(originParam);

  if (
    params.get('lzym') !== LazyModal.SlackShare ||
    !postId ||
    !params.has(scrollParam)
  ) {
    return undefined;
  }

  return {
    postId,
    scrollY: Number(params.get(scrollParam)) || 0,
    origin: origin && origins.has(origin) ? (origin as Origin) : undefined,
    error: params.get('error') ?? undefined,
  };
};

/**
 * Finishes a share that left for Slack's OAuth from any surface: the post, a
 * brief, or a feed behind a post modal. It sits on the app shell because the
 * destination can be any page, which is also why it fetches the post itself.
 */
export const useSlackShareOriginReturn = (): void => {
  const router = useRouter();
  const { openModal } = useLazyModal();
  const { displayToast } = useToastNotification();
  const { tokenRefreshed } = useAuthContext();
  const [pending] = useState(readSlackShareOriginReturn);
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

    if (pending.scrollY) {
      restoreScrollPosition(pending.scrollY);
    }

    openModal({
      type: LazyModal.SlackShare,
      props: { post, origin: pending.origin },
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
