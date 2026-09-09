import { useCallback, useEffect, useRef } from 'react';
import type { Post } from '../../../graphql/posts';
import { UserIntegrationType } from '../../../graphql/integrations';
import { useSlackShare } from './useSlackShare';
import { useLazyModal } from '../../useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { useConditionalFeature } from '../../useConditionalFeature';
import { featureSlackShare } from '../../../lib/featureManagement';
import { useLogContext } from '../../../contexts/LogContext';
import type { Origin } from '../../../lib/log';
import { LogEvent } from '../../../lib/log';
import { getPathnameWithQuery } from '../../../lib/links';

export type UseSlackShareButton = {
  isEnabled: boolean;
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
  const { integration, isLoading, connect } = useSlackShare();
  const { value: isEnabled } = useConditionalFeature({
    feature: featureSlackShare,
    shouldEvaluate: !!post,
  });

  const openPicker = useCallback(() => {
    openModal({ type: LazyModal.SlackShare, props: { post, origin } });
  }, [openModal, post, origin]);

  const onClick = useCallback(() => {
    if (integration) {
      openPicker();

      return;
    }

    logEvent({
      event_name: LogEvent.StartAddingWorkspace,
      target_id: UserIntegrationType.Slack,
      extra: JSON.stringify({ origin }),
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
  }, [integration, openPicker, logEvent, origin, connect, post.id]);

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

  return { isEnabled, onClick };
};
