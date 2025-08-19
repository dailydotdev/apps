import type { ReactElement } from 'react';
import React from 'react';

import type { NextSeoProps } from 'next-seo';

import { FlexCol, FlexRow } from '@dailydotdev/shared/src/components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { MailIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { usePushNotificationContext } from '@dailydotdev/shared/src/contexts/PushNotificationContext';
import { usePushNotificationMutation } from '@dailydotdev/shared/src/hooks/notifications';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { NotificationPromptSource } from '@dailydotdev/shared/src/lib/log';
import { getLayout } from '../../../components/layouts/NoSidebarLayout';
import {
  defaultOpenGraph,
  defaultSeo,
  defaultSeoTitle,
} from '../../../next-seo';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const NotifyPage = (): ReactElement => {
  const { user } = useAuthContext();
  const { isSubscribed, isInitialized, isPushSupported } =
    usePushNotificationContext();
  const { onTogglePermission, acceptedJustNow } = usePushNotificationMutation();
  const showAlert =
    isPushSupported && isInitialized && (!isSubscribed || acceptedJustNow);
  return (
    <div className="mx-4 flex w-auto max-w-full flex-col gap-4 tablet:mx-auto tablet:max-w-[35rem] laptop:flex-row">
      <FlexCol className="flex-1 gap-6">
        <FlexCol className="gap-4">
          <Typography type={TypographyType.LargeTitle} bold center>
            Choose how we reach you
          </Typography>
          <Typography
            type={TypographyType.Title3}
            color={TypographyColor.Secondary}
            center
          >
            When there is mutual interest from the company, we will connect you
            quickly using the channel you check most.
          </Typography>
          <Typography type={TypographyType.Title3} bold center>
            Set your contact methods
          </Typography>
        </FlexCol>
        <FlexCol className="gap-2">
          <FlexCol className="gap-1 rounded-16 border border-border-subtlest-tertiary px-3 py-3.5">
            <Typography type={TypographyType.Body} bold>
              Confirm your email
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              This is the address we will use to introduce you when there is
              mutual interest from the company. Want us to use a different
              email? Update in{' '}
              <a
                href="#"
                className="text-text-link"
                target="_blank"
                rel={anchorDefaultRel}
              >
                account settings
              </a>
            </Typography>
            <FlexRow className="items-center gap-1">
              <MailIcon />
              <Typography type={TypographyType.Footnote}>
                {user?.email}
              </Typography>
              <VIcon className="text-accent-avocado-subtlest" />
            </FlexRow>
          </FlexCol>
          {showAlert && (
            <FlexRow className="gap-3 rounded-16 border border-border-subtlest-tertiary px-3 py-3.5">
              <FlexCol className="gap-1 ">
                <Typography type={TypographyType.Body} bold>
                  Enable push notifications
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  Get an instant heads-up the moment there’s a match, even if
                  you’re not in the app.
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
        </FlexCol>
        <FlexRow className="justify-center">
          <Button
            size={ButtonSize.Large}
            variant={ButtonVariant.Primary}
            className="w-full laptop:w-auto"
          >
            Continue
          </Button>
        </FlexRow>
      </FlexCol>
    </div>
  );
};

const getPageLayout: typeof getLayout = (...page) => getLayout(...page);

NotifyPage.getLayout = getPageLayout;
NotifyPage.layoutProps = {
  className: 'gap-10 pt-6 laptop:pt-10 pb-10',
  screenCentered: true,
  hideBackButton: true,
  seo,
};

export default NotifyPage;
