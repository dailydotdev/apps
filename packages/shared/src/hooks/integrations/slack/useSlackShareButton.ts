import { useCallback, useEffect, useRef, useState } from 'react';
import type { Post } from '../../../graphql/posts';
import { UserIntegrationType } from '../../../graphql/integrations';
import { useSlackShare } from './useSlackShare';
import { useLazyModal } from '../../useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { useLogContext } from '../../../contexts/LogContext';
import type { Origin } from '../../../lib/log';
import { LogEvent } from '../../../lib/log';
import { postLogEvent } from '../../../lib/feed';
import { getPathnameWithQuery } from '../../../lib/links';

export type UseSlackShareButton = {
  onClick: () => void;
};

const postIdParam = 'slackPostId';

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

export const useSlackShareButton = ({
  post,
  origin,
}: {
  post: Post;
  origin?: Origin;
}): UseSlackShareButton => {
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { integration, canPostAsUser, connect } = useSlackShare();

  const openPicker = useCallback(() => {
    openModal({ type: LazyModal.SlackShare, props: { post, origin } });
  }, [openModal, post, origin]);

  const onClick = useCallback(() => {
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

    connect(getSlackShareRedirectPath(post));
  }, [integration, canPostAsUser, openPicker, logEvent, origin, connect, post]);

  return { onClick };
};

const hasSlackShareReturnParams = (postId?: string): boolean => {
  if (!postId || typeof window === 'undefined') {
    return false;
  }

  const params = new URLSearchParams(window.location.search);

  return (
    params.get('lzym') === LazyModal.SlackShare &&
    params.get(postIdParam) === postId
  );
};

/**
 * Reopens the picker after the OAuth round trip. It lives on the post page
 * rather than on the share button because the button that started the flow may
 * not exist at the destination: the share can begin in a post modal or on the
 * extension, and the share bar itself is desktop only.
 */
export const useSlackShareReturn = ({ post }: { post?: Post }): void => {
  const { openModal } = useLazyModal();
  const [isReturning] = useState(() => hasSlackShareReturnParams(post?.id));
  const { integration, isLoading } = useSlackShare({ enabled: isReturning });
  const reopened = useRef(false);

  useEffect(() => {
    if (
      !isReturning ||
      reopened.current ||
      isLoading ||
      !integration ||
      !post
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
  }, [isReturning, isLoading, integration, post, openModal]);
};
