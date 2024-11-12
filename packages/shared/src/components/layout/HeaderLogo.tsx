import React, { ReactElement } from 'react';
import Logo, { LogoPosition } from '../Logo';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useAuthContext } from '../../contexts/AuthContext';
import { withNoSSR } from '../../lib/withNoSSR';

interface HeaderLogoProps {
  onLogoClick?: (e: React.MouseEvent) => unknown;
  position?: LogoPosition;
}

function HeaderLogo({ onLogoClick, position }: HeaderLogoProps): ReactElement {
  const featureTheme = useFeatureTheme();
  const { user } = useAuthContext();

  return (
    <Logo
      position={position}
      onLogoClick={onLogoClick}
      featureTheme={featureTheme}
      isPlus={!!user?.isPlus}
    />
  );
}

export default withNoSSR(HeaderLogo);
