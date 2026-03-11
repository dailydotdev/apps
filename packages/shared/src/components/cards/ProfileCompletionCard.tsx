import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import ProgressCircle from '../ProgressCircle';
import CloseButton from '../CloseButton';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import type { ProfileCompletion } from '../../lib/user';
import { LogEvent, TargetType } from '../../lib/log';
import {
  profileCompletionCardBorder,
  profileCompletionCardBg,
  profileCompletionButtonBg,
} from '../../styles/custom';
import { useProfileCompletionIndicator } from '../../hooks/profile/useProfileCompletionIndicator';
import { getCompletionItems } from '../../lib/profileCompletion';

type CompletionCardItem = ReturnType<typeof getCompletionItems>[number] & {
  cta: string;
  benefit: string;
};

type ProfileCompletionCardProps = {
  className?: Partial<{
    container: string;
    card: string;
  }>;
};

const completionItemMetadata: Record<
  ReturnType<typeof getCompletionItems>[number]['label'],
  Pick<CompletionCardItem, 'cta' | 'benefit'>
> = {
  'Profile image': {
    cta: 'Add profile image',
    benefit:
      'Stand out in comments and discussions. Profiles with photos get more engagement.',
  },
  Headline: {
    cta: 'Write your headline',
    benefit:
      'Tell the community who you are. A good headline helps others connect with you.',
  },
  'Experience level': {
    cta: 'Set experience level',
    benefit:
      'Get personalized content recommendations based on where you are in your career.',
  },
  'Work experience': {
    cta: 'Add work experience',
    benefit:
      'Showcase your background and unlock opportunities from companies looking for talent like you.',
  },
  Education: {
    cta: 'Add education',
    benefit:
      'Complete your story. Education helps others understand your journey.',
  },
};

const getCompletionCardItems = (
  completion: ProfileCompletion,
): CompletionCardItem[] => {
  return getCompletionItems(completion).map((item) => ({
    ...item,
    ...completionItemMetadata[item.label],
  }));
};

export const ProfileCompletionCard = ({
  className,
}: ProfileCompletionCardProps): ReactElement | null => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { completeAction } = useActions();
  const profileCompletion = user?.profileCompletion;
  const isImpressionTracked = useRef(false);

  const { showIndicator: showProfileCompletion } =
    useProfileCompletionIndicator();

  const items = useMemo(
    () => (profileCompletion ? getCompletionCardItems(profileCompletion) : []),
    [profileCompletion],
  );

  const incompleteItems = useMemo(
    () => items.filter((item) => !item.completed),
    [items],
  );

  const firstIncompleteItem = incompleteItems[0];
  const progress = profileCompletion?.percentage ?? 0;

  const shouldShow =
    profileCompletion && showProfileCompletion && firstIncompleteItem;

  useEffect(() => {
    if (!shouldShow || isImpressionTracked.current) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.ProfileCompletionCard,
    });
    isImpressionTracked.current = true;
  }, [shouldShow, logEvent]);

  const handleCtaClick = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.ProfileCompletionCard,
      target_id: 'cta',
    });
  }, [logEvent]);

  const handleDismiss = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.ProfileCompletionCard,
      target_id: 'dismiss',
    });
    completeAction(ActionType.DismissProfileCompletionIndicator);
  }, [logEvent, completeAction]);

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={classNames('flex flex-1 p-2 laptop:p-0', className?.container)}
    >
      <div
        style={{
          border: profileCompletionCardBorder,
          background: profileCompletionCardBg,
        }}
        className={classNames(
          'relative flex flex-1 flex-col gap-4 rounded-16 px-6 py-4',
          'backdrop-blur-3xl',
          className?.card,
        )}
      >
        <CloseButton
          className="absolute right-2 top-2"
          size={ButtonSize.XSmall}
          onClick={handleDismiss}
        />
        <ProgressCircle progress={progress} size={48} showPercentage />
        <Typography
          type={TypographyType.Title2}
          color={TypographyColor.Primary}
          bold
        >
          Complete your profile
        </Typography>
        <div className="flex flex-col gap-2">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Finish setting up your profile to get the most out of daily.dev:
          </Typography>
          <ul className="flex list-inside list-disc flex-col gap-1">
            {incompleteItems.map((item) => (
              <li key={item.label}>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  {item.label}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
        <Button
          style={{
            background: profileCompletionButtonBg,
          }}
          className="mt-auto w-full"
          tag="a"
          href={firstIncompleteItem.redirectPath}
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          onClick={handleCtaClick}
        >
          {firstIncompleteItem.cta}
        </Button>
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
