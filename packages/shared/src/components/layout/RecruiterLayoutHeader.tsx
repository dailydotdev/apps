import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import HeaderLogo from './HeaderLogo';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { GoBackButton } from '../post/GoBackHeaderMobile';
import { recruiterLayoutHeaderClassName } from '../../features/opportunity/types';

export type RecruiterLayoutHeaderProps = {
  additionalButtons?: ReactNode;
  onLogoClick?: (e: React.MouseEvent) => unknown;
  canGoBack?: boolean;
};

export const RecruiterLayoutHeader = ({
  onLogoClick,
  canGoBack,
}: RecruiterLayoutHeaderProps): ReactElement => {
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });

  return (
    <header
      className={classNames(
        'z-header border-border-subtlest-tertiary tablet:px-8 laptop:left-0 laptop:h-16 laptop:w-full laptop:px-4 sticky top-0 flex h-14 flex-row items-center justify-between gap-3 border-b px-4 py-3',
        scrollClassName,
      )}
      style={featureTheme ? featureTheme.navbar : undefined}
    >
      {canGoBack && <GoBackButton />}
      <div className="mr-auto flex items-center gap-2">
        <HeaderLogo onLogoClick={onLogoClick} isRecruiter />
      </div>
      <div className={recruiterLayoutHeaderClassName} />
    </header>
  );
};
