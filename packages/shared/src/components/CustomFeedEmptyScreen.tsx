import type { ReactElement } from 'react';
import React from 'react';
import { EmptyScreenIcon } from './EmptyScreen';
import { DevPlusIcon, HashtagIcon } from './icons';
import { PageContainer, SharedFeedPage } from './utilities';
import { ButtonSize, ButtonVariant } from './buttons/common';
import { webappUrl } from '../lib/constants';
import {
  DEFAULT_ALGORITHM_INDEX,
  DEFAULT_ALGORITHM_KEY,
  SearchControlHeader,
} from './layout/common';
import usePersistentContext from '../hooks/usePersistentContext';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from './typography/Typography';
import { LogEvent, TargetId } from '../lib/log';
import { Button } from './buttons/Button';
import { usePlusSubscription } from '../hooks';
import { IconSize } from './Icon';

export const CustomFeedEmptyScreen = (): ReactElement => {
  const { logSubscriptionEvent, isPlus } = usePlusSubscription();
  const [selectedAlgo, setSelectedAlgo] = usePersistentContext(
    DEFAULT_ALGORITHM_KEY,
    DEFAULT_ALGORITHM_INDEX,
    [0, 1],
    DEFAULT_ALGORITHM_INDEX,
  );
  return (
    <div className="flex w-full flex-col">
      <div className="mr-auto mt-0 flex gap-3 tablet:mr-0 tablet:mt-2 laptop:mr-auto laptop:w-auto">
        <SearchControlHeader
          algoState={[selectedAlgo, setSelectedAlgo]}
          feedName={SharedFeedPage.Custom}
        />
      </div>
      <PageContainer className="mx-auto">
        <div className="mt-16 flex max-h-full w-full max-w-screen-tablet flex-col items-center justify-center gap-4 px-6 text-center">
          <HashtagIcon
            className={EmptyScreenIcon.className}
            style={EmptyScreenIcon.style}
          />
          {!isPlus ? (
            <>
              <Typography
                tag={TypographyTag.Span}
                type={TypographyType.Caption1}
                className="flex gap-0.5 rounded-4 bg-action-plus-float p-0.5 pr-1"
                color={TypographyColor.Plus}
              >
                <DevPlusIcon size={IconSize.Size16} /> Plus
              </Typography>
              <Typography
                type={TypographyType.Title1}
                color={TypographyColor.Primary}
                bold
              >
                Custom feeds got a massive upgrade!
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                Custom Feeds is now more powerful than ever before, with
                advanced filters, extensive customization options, and complete
                feed control. Upgrade to Plus to unlock this ultimate tool for
                tailoring your content.
              </Typography>
              <Button
                className="mt-10"
                tag="a"
                type="button"
                variant={ButtonVariant.Primary}
                size={ButtonSize.Medium}
                href={`${webappUrl}plus`}
                icon={<DevPlusIcon className="text-action-plus-default" />}
                onClick={() => {
                  logSubscriptionEvent({
                    event_name: LogEvent.UpgradeSubscription,
                    target_id: TargetId.CustomFeed,
                  });
                }}
              >
                Upgrade to Plus
              </Button>
            </>
          ) : (
            <>
              <Typography
                type={TypographyType.Title1}
                color={TypographyColor.Primary}
                bold
              >
                Your feed filters are too specific.
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                We couldn&apos;t fetch enough posts based on your selected tags.
                Try adding more tags using the feed settings.
              </Typography>
            </>
          )}
        </div>
      </PageContainer>
    </div>
  );
};
