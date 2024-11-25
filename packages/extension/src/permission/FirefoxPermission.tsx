import React, { ReactElement } from 'react';
import DailyDevLogo from '@dailydotdev/shared/src/components/Logo';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { cloudinaryFeedBgLaptop } from '@dailydotdev/shared/src/lib/image';
import {
  onboardingUrl,
  privacyPolicy,
} from '@dailydotdev/shared/src/lib/constants';
import { useRouter } from 'next/router';
import { FirefoxPermissionType } from '@dailydotdev/shared/src/lib/cookie';
import { FirefoxPermissionItem } from './FirefoxPermissionItem';
import { FirefoxPermissionContainer } from './common';

interface FirefoxPermissionProps {
  onUpdate(permission: FirefoxPermissionType): Promise<void>;
}

export function FirefoxPermission({
  onUpdate,
}: FirefoxPermissionProps): ReactElement {
  const router = useRouter();

  const onAccept = async () => {
    await onUpdate(FirefoxPermissionType.Accepted);
    await router.push(onboardingUrl);
  };

  return (
    <FirefoxPermissionContainer>
      <img
        src={cloudinaryFeedBgLaptop}
        alt="a glowing background"
        className="pointer-events-none absolute -top-10 -z-1 select-none"
      />
      <span className="py-6">
        <DailyDevLogo />
      </span>
      <div className="flex w-full max-w-[33rem] flex-col gap-2 rounded-10 bg-surface-float p-4">
        <Typography tag={TypographyTag.H1} type={TypographyType.Title3} bold>
          Additional permissions needed
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Ready to go? 🟢 Give us the green signal by accepting the below
          permissions. Enhance your daily.dev experience with personalized
          content and connect with fellow developers.
        </Typography>
        <FirefoxPermissionItem
          className="mt-2"
          title="Ads pixel tracking"
          description="Enable pixel tracking for fewer, non-intrusive ads, helping us in keeping the experience free and relevant."
          icon="📢"
        />
        <FirefoxPermissionItem
          title="Analytics data"
          description="Allow us to capture analytics data to understand your preferences and personalize content for you."
          icon="📊"
        />
        <Typography
          tag={TypographyTag.Link}
          className="my-4 text-center"
          color={TypographyColor.Link}
          type={TypographyType.Subhead}
          href={privacyPolicy}
        >
          Full permission document
        </Typography>
        <Button
          className="w-full"
          icon={<VIcon />}
          variant={ButtonVariant.Primary}
          onClick={onAccept}
        >
          Accept
        </Button>
        <Button
          className="mt-1 w-full"
          variant={ButtonVariant.Float}
          onClick={() => onUpdate(FirefoxPermissionType.Declined)}
        >
          Decline
        </Button>
      </div>
    </FirefoxPermissionContainer>
  );
}
