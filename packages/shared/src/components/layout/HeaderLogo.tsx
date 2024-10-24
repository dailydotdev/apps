import React, { ReactElement } from 'react';
import Logo, { LogoPosition } from '../Logo';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';

interface HeaderLogoProps {
  onLogoClick?: (e: React.MouseEvent) => unknown;
  position?: LogoPosition;
}

function HeaderLogo({ onLogoClick, position }: HeaderLogoProps): ReactElement {
  const featureTheme = useFeatureTheme();

  return (
    <Logo
      position={position}
      onLogoClick={onLogoClick}
      featureTheme={featureTheme}
    />
  );
}

export default HeaderLogo;
