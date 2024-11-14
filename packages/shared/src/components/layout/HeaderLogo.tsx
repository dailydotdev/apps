import React, { ReactElement } from 'react';
import Logo, { LogoPosition } from '../Logo';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useAuthContext } from '../../contexts/AuthContext';
import { withNoSSR } from '../../lib/withNoSSR';
import type { WithClassNameProps } from '../utilities';
import { feature } from '../../lib/featureManagement';
import { useFeature } from '../GrowthBookProvider';

interface HeaderLogoProps extends WithClassNameProps {
  onLogoClick?: (e: React.MouseEvent) => unknown;
  position?: LogoPosition;
  compact?: boolean;
}

function HeaderLogo({
  onLogoClick,
  position,
  compact = false,
  className,
}: HeaderLogoProps): ReactElement {
  const featureTheme = useFeatureTheme();
  const { user } = useAuthContext();
  const showPlusSubscription = useFeature(feature.plusSubscription);

  return (
    <Logo
      compact={compact}
      position={position}
      onLogoClick={onLogoClick}
      featureTheme={featureTheme}
      isPlus={showPlusSubscription && user?.isPlus}
      className={className}
    />
  );
}

export default withNoSSR(HeaderLogo);
