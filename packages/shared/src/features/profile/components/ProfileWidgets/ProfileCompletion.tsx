import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import ProgressCircle from '../../../../components/ProgressCircle';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { InfoIcon, MoveToIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import Link from '../../../../components/utilities/Link';
import { anchorDefaultRel } from '../../../../lib/strings';
import { useAuthContext } from '../../../../contexts/AuthContext';
import CloseButton from '../../../../components/CloseButton';
import { ButtonSize } from '../../../../components/buttons/Button';
import { useProfileCompletionIndicator } from '../../../../hooks/profile/useProfileCompletionIndicator';
import {
  formatCompletionDescription,
  getCompletionItems,
} from '../../../../lib/profileCompletion';

type ProfileCompletionProps = {
  className?: string;
};

export const ProfileCompletion = ({
  className,
}: ProfileCompletionProps): ReactElement | null => {
  const { user } = useAuthContext();
  const { dismissIndicator } = useProfileCompletionIndicator();
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

  const firstIncompleteItem = incompleteItems[0];
  const redirectPath = firstIncompleteItem?.redirectPath;

  const progress = profileCompletion?.percentage ?? 0;
  const isCompleted = progress === 100;

  if (!profileCompletion || isCompleted) {
    return null;
  }

  return (
    <div
      className={classNames(
        'flex cursor-pointer flex-col border border-action-help-active bg-action-help-float hover:bg-action-help-hover laptop:rounded-16',
        className,
      )}
    >
      <div className="flex justify-end px-2 pt-2">
        <CloseButton size={ButtonSize.XSmall} onClick={dismissIndicator} />
      </div>
      <Link href={redirectPath}>
        <a
          href={redirectPath}
          rel={anchorDefaultRel}
          className="flex w-full items-center gap-6 p-4 pt-0"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-1">
              <InfoIcon
                size={IconSize.XSmall}
                className="text-text-secondary"
              />
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                bold
              >
                Profile Completion
              </Typography>
            </div>
            <div className="flex min-w-0 items-center gap-1">
              <MoveToIcon
                size={IconSize.XSmall}
                className="shrink-0 text-text-secondary"
              />
              <div className="min-w-0 max-w-full flex-1">
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Secondary}
                  className="w-full break-words"
                >
                  {description}
                </Typography>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 leading-none">
            <ProgressCircle
              progress={progress}
              size={50}
              showPercentage
              color="help"
            />
          </div>
        </a>
      </Link>
    </div>
  );
};
