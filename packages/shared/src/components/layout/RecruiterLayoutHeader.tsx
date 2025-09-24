import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import HeaderLogo from './HeaderLogo';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';

export type RecruiterLayoutHeaderProps = {
  additionalButtons?: ReactNode;
  onLogoClick?: (e: React.MouseEvent) => unknown;
};

export const RecruiterLayoutHeader = ({
  additionalButtons,
  onLogoClick,
}: RecruiterLayoutHeaderProps): ReactElement => {
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });

  return (
    <header
      className={classNames(
        'sticky top-0 z-header flex h-14 flex-row items-center justify-between gap-3 border-b border-border-subtlest-tertiary px-4 py-3 tablet:px-8 laptop:left-0 laptop:h-16 laptop:w-full laptop:px-4',
        scrollClassName,
      )}
      style={featureTheme ? featureTheme.navbar : undefined}
    >
      <div>
        <HeaderLogo onLogoClick={onLogoClick} />
      </div>
      <div>{additionalButtons}</div>
    </header>
  );
};
