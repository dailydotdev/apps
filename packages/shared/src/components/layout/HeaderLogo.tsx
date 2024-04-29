import React, { ReactElement, useState } from 'react';
import dynamic from 'next/dynamic';
import { LoggedUser } from '../../lib/user';
import Logo, { LogoPosition } from '../Logo';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';

const Greeting = dynamic(
  () => import(/* webpackChunkName: "greeting" */ '../Greeting'),
);

interface HeaderLogoProps {
  user?: LoggedUser;
  greeting?: boolean;
  onLogoClick?: (e: React.MouseEvent) => unknown;
  position?: LogoPosition;
}

function HeaderLogo({
  user,
  greeting,
  onLogoClick,
  position,
}: HeaderLogoProps): ReactElement {
  const [showGreeting, setShowGreeting] = useState(false);
  const featureTheme = useFeatureTheme();

  return (
    <>
      <Logo
        position={position}
        onLogoClick={onLogoClick}
        showGreeting={showGreeting}
        featureTheme={featureTheme}
      />
      {greeting && (
        <Greeting
          user={user}
          onEnter={() => setShowGreeting(true)}
          onExit={() => setShowGreeting(false)}
        />
      )}
    </>
  );
}

export default HeaderLogo;
