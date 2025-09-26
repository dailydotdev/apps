import React from 'react';
import type { ReactElement } from 'react';

import { usePushNotificationContext } from '../../../contexts/PushNotificationContext';
import { usePushNotificationMutation } from '../../../hooks/notifications';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { NotificationPromptSource, TargetId } from '../../../lib/log';
import { Switch } from '../../../components/fields/Switch';
import { JobIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import Link from '../../../components/utilities/Link';
import { webappUrl } from '../../../lib/constants';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import { Button } from '../../../components/buttons/Button';
import { CandidatePreferenceButton } from './CandidatePreferenceButton';

export const NoOpportunity = (): ReactElement => {
  const { isSubscribed, isInitialized, isPushSupported } =
    usePushNotificationContext();
  const { onTogglePermission, acceptedJustNow } = usePushNotificationMutation();
  const showAlert =
    isPushSupported && isInitialized && (!isSubscribed || acceptedJustNow);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4">
      <JobIcon
        secondary
        size={IconSize.XLarge}
        className="text-text-secondary"
      />

      <Typography
        bold
        type={TypographyType.LargeTitle}
        color={TypographyColor.Primary}
        center
      >
        Job Opportunity Unavailable
      </Typography>

      <Typography
        center
        type={TypographyType.Title3}
        color={TypographyColor.Secondary}
      >
        The job you&apos;re trying to view is no longer available. It may have
        been filled or removed by the employer. <br />
        <br />
        You can update your preferences anytime to get matched with personalized
        opportunities.
      </Typography>

      {showAlert && (
        <FlexRow className="gap-3 rounded-16 border border-border-subtlest-tertiary px-3 py-3.5">
          <FlexCol className="flex-1 gap-1">
            <Typography type={TypographyType.Body} bold>
              Enable push notifications
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              Get an instant heads-up the moment there&apos;s a match, even if
              you&apos;re not in the app.
            </Typography>
          </FlexCol>
          <Switch
            data-testid="show_new_posts-switch"
            inputId="show_new_posts-switch"
            name="show_new_posts"
            className="w-20"
            compact={false}
            onToggle={() =>
              onTogglePermission(NotificationPromptSource.NotificationsPage)
            }
          />
        </FlexRow>
      )}

      <Link href={webappUrl} passHref>
        <Button
          tag="a"
          className="w-full max-w-80"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Large}
        >
          Back to daily.dev
        </Button>
      </Link>

      <CandidatePreferenceButton
        label="Update job preferences"
        targetId={TargetId.OpportunityUnavailablePage}
        className="w-full tablet:w-80"
      />
    </div>
  );
};
