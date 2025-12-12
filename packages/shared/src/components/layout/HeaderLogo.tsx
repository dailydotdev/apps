import type { ReactElement } from 'react';
import React from 'react';
import type { LogoPosition } from '../Logo';
import Logo from '../Logo';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useAuthContext } from '../../contexts/AuthContext';
import { withNoSSR } from '../../lib/withNoSSR';
import type { WithClassNameProps } from '../utilities';

interface HeaderLogoProps extends WithClassNameProps {
  onLogoClick?: (e: React.MouseEvent) => unknown;
  position?: LogoPosition;
  compact?: boolean;
  isRecruiter?: boolean;
  href?: string;
}

function HeaderLogo({
  onLogoClick,
  position,
  compact = false,
  className,
  isRecruiter = false,
  href,
}: HeaderLogoProps): ReactElement {
  const featureTheme = useFeatureTheme();
  const { user } = useAuthContext();

  return (
    <Logo
      compact={compact}
      position={position}
      onLogoClick={onLogoClick}
      featureTheme={featureTheme}
      isPlus={user?.isPlus}
      className={className}
      isRecruiter={isRecruiter}
      href={href}
    />
  );
}

export default withNoSSR(HeaderLogo);
