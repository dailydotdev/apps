import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import ProgressCircle from '../ProgressCircle';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { IconSize } from '../Icon';
import { ClearIcon } from '../icons';
import Link from '../utilities/Link';
import { anchorDefaultRel } from '../../lib/strings';
import { useAuthContext } from '../../contexts/AuthContext';
import { useProfileCompletionIndicator } from '../../hooks/profile/useProfileCompletionIndicator';
import {
  formatCompletionDescription,
  getCompletionItems,
} from '../../lib/profileCompletion';

export const SidebarProfileCompletion = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { showIndicator, dismissIndicator } = useProfileCompletionIndicator();
  const profileCompletion = user?.profileCompletion;

  const items = useMemo(
    () => (profileCompletion ? getCompletionItems(profileCompletion) : []),
    [profileCompletion],
  );
  const incompleteItems = useMemo(
    () => items.filter((item) => !item.completed),
    [items],
  );
  const description = useMemo(
    () => formatCompletionDescription(incompleteItems),
    [incompleteItems],
  );

  if (!showIndicator || !profileCompletion) {
    return null;
  }

  const progress = profileCompletion.percentage ?? 0;
  const redirectPath = incompleteItems[0]?.redirectPath;

  return (
    <div className="group/profile-completion relative">
      <Link href={redirectPath} passHref>
        <a
          href={redirectPath}
          rel={anchorDefaultRel}
          className="focus-outline flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-transparent p-3 transition-colors hover:bg-surface-hover"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Typography
              bold
              type={TypographyType.Footnote}
              color={TypographyColor.Primary}
            >
              Profile Completion
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="line-clamp-2"
            >
              {description}
            </Typography>
          </div>
          <ProgressCircle
            progress={progress}
            size={40}
            showPercentage
            color="help"
          />
        </a>
      </Link>
      <button
        type="button"
        onClick={dismissIndicator}
        aria-label="Dismiss profile completion"
        className="focus-outline pointer-events-none absolute right-0 top-0 z-1 flex size-6 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-8 border border-border-subtlest-tertiary bg-accent-pepper-subtlest text-text-tertiary opacity-0 shadow-2 transition hover:bg-surface-hover hover:text-text-primary group-hover/profile-completion:pointer-events-auto group-hover/profile-completion:opacity-100"
      >
        <ClearIcon size={IconSize.XSmall} aria-hidden />
      </button>
    </div>
  );
};
