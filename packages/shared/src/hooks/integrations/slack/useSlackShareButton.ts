import { useCallback, useEffect, useRef } from 'react';
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

export const useSlackShareButton = ({
  post,
  origin,
}: {
  post: Post;
  origin?: Origin;
}): UseSlackShareButton => {
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { integration, canPostAsUser, isLoading, connect } = useSlackShare();

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

    connect(
      getPathnameWithQuery(
        window.location.pathname,
        new URLSearchParams({
          lzym: LazyModal.SlackShare,
          [postIdParam]: post.id,
        }),
      ),
    );
  }, [integration, canPostAsUser, openPicker, logEvent, origin, connect, post]);

  // returning from OAuth reopens the picker on whichever surface started the
  // share, so the round trip costs the user nothing beyond the consent screen.
  // read straight from the location rather than the router: this runs on every
  // surface that renders a share list, including the extension
  const reopened = useRef(false);
  useEffect(() => {
    if (reopened.current || isLoading || !integration) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (
      params.get('lzym') !== LazyModal.SlackShare ||
      params.get(postIdParam) !== post.id
    ) {
      return;
    }

    reopened.current = true;

    params.delete('lzym');
    params.delete(postIdParam);

    window.history.replaceState(
      window.history.state,
      '',
      getPathnameWithQuery(window.location.pathname, params),
    );

    openPicker();
  }, [isLoading, integration, post.id, openPicker]);

  return { onClick };
};
