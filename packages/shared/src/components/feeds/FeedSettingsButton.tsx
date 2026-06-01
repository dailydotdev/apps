import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent } from '../../lib/log';
import { FilterIcon } from '../icons';
import {
  useConditionalFeature,
  useFeeds,
  usePlusSubscription,
} from '../../hooks';
import type { PromptOptions } from '../../hooks/usePrompt';
import { usePrompt } from '../../hooks/usePrompt';
import { plusUrl, webappUrl } from '../../lib/constants';
import { FeedType } from '../../graphql/feed';
import { labels } from '../../lib/labels';
import {
  FeedChipsVariant,
  featureFeedChips,
  featurePlusCtaCopy,
} from '../../lib/featureManagement';

const editPlusSubscribePrompt: PromptOptions = {
  title: labels.feed.prompt.editPlusSubscribe.title,
  description: labels.feed.prompt.editPlusSubscribe.description,
  okButton: {
    title: labels.feed.prompt.editPlusSubscribe.okButton,
  },
  cancelButton: {
    title: labels.feed.prompt.editPlusSubscribe.cancelButton,
  },
  shouldCloseOnOverlayClick: false,
};

export function FeedSettingsButton({
  onClick,
  children = 'Feed settings',
  ...props
}: ButtonProps<'button'>): ReactElement {
  const { logEvent } = useLogContext();
  const { isPlus } = usePlusSubscription();
  const { value: feedChipsVariant } = useConditionalFeature({
    feature: featureFeedChips,
    shouldEvaluate: !isPlus,
  });
  const isFeedChipsEnabled = feedChipsVariant === FeedChipsVariant.V2;
  const { feeds, deleteFeed } = useFeeds();
  const router = useRouter();
  const { showPrompt } = usePrompt();
  const {
    value: { full: plusCta },
  } = useConditionalFeature({
    feature: featurePlusCtaCopy,
    shouldEvaluate: !isPlus && !isFeedChipsEnabled,
  });

  const onButtonClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    logEvent({ event_name: LogEvent.ManageTags });

    // Pre-chips behavior: non-Plus on a Custom feed is prompted to upgrade,
    // and on decline the feed is deleted. Once the chips feature is on, free
    // users open the editor and `FeedSettingsPlusGate` upsells advanced sections.
    if (!isFeedChipsEnabled && !isPlus) {
      const feedSlugOrId = router?.query?.slugOrId;

      const feed = feeds?.edges.find(
        (item) =>
          item.node.id === feedSlugOrId || item.node.slug === feedSlugOrId,
      );

      if (feed?.node.type === FeedType.Custom) {
        const subscribeToPlus = await showPrompt({
          ...editPlusSubscribePrompt,
          description: editPlusSubscribePrompt.description,
          okButton: {
            ...editPlusSubscribePrompt.okButton,
            title: plusCta,
          },
        });

        if (subscribeToPlus) {
          router?.push(plusUrl);

          return;
        }

        deleteFeed({
          feedId: feed.node.id,
        });

        router?.replace(webappUrl);

        return;
      }
    }

    onClick?.(event);
  };

  return (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      icon={<FilterIcon />}
      {...props}
      onClick={onButtonClick}
    >
      {children}
    </Button>
  );
}
