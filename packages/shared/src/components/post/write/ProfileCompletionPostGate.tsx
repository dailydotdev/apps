import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import ProgressCircle from '../../ProgressCircle';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import Link from '../../utilities/Link';
import { settingsUrl } from '../../../lib/constants';
import type { ProfileCompletion } from '../../../lib/user';
import {
  formatCompletionDescription,
  getIncompleteCompletionItems,
} from '../../../lib/profileCompletion';
import {
  profileCompletionButtonBg,
  profileCompletionCardBg,
  profileCompletionCardBorder,
} from '../../../styles/custom';

interface ProfileCompletionPostGateProps {
  className?: string;
  currentPercentage?: number;
  requiredPercentage?: number;
  description: string;
  profileCompletion?: ProfileCompletion;
  compact?: boolean;
  buttonSize?: ButtonSize;
}

export function ProfileCompletionPostGate({
  className,
  currentPercentage = 0,
  requiredPercentage = 0,
  description,
  profileCompletion,
  compact = false,
  buttonSize = ButtonSize.Medium,
}: ProfileCompletionPostGateProps): ReactElement {
  const normalizedCurrent = Math.max(0, Math.min(100, currentPercentage));
  const normalizedRequired = Math.max(0, Math.min(100, requiredPercentage));
  const completionGap = Math.max(0, normalizedRequired - normalizedCurrent);
  const incompleteItems = profileCompletion
    ? getIncompleteCompletionItems(profileCompletion)
    : [];
  const missingItemsDescription =
    incompleteItems.length > 0
      ? formatCompletionDescription(incompleteItems)
      : null;
  const requirementMessage =
    !missingItemsDescription && normalizedRequired > 0
      ? `You are ${completionGap}% away from the ${normalizedRequired}% requirement.`
      : null;

  return (
    <div
      style={{
        border: profileCompletionCardBorder,
        background: profileCompletionCardBg,
      }}
      className={classNames(
        'mx-auto flex w-full flex-col rounded-16 border text-left',
        compact ? 'gap-3 px-5 py-5' : 'gap-4 px-8 py-7',
        className,
      )}
    >
      <div
        className={classNames('flex items-start', compact ? 'gap-3' : 'gap-4')}
      >
        <ProgressCircle
          progress={normalizedCurrent}
          size={compact ? 44 : 52}
          showPercentage
        />
        <div className="flex flex-1 flex-col gap-1">
          <Typography
            type={compact ? TypographyType.Title3 : TypographyType.Title2}
            color={TypographyColor.Primary}
            bold
          >
            Complete your profile to create posts
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
          >
            {description}
          </Typography>
        </div>
      </div>
      {missingItemsDescription && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {missingItemsDescription}
        </Typography>
      )}
      {requirementMessage && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {requirementMessage}
        </Typography>
      )}
      <Link href={`${settingsUrl}/profile`} passHref>
        <Button
          tag="a"
          size={buttonSize}
          variant={ButtonVariant.Primary}
          style={{ background: profileCompletionButtonBg }}
          className={classNames(compact ? 'w-full' : 'w-full tablet:w-fit')}
        >
          Complete profile
        </Button>
      </Link>
    </div>
  );
}
