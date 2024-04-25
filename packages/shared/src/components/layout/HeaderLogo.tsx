import React, { ReactElement, useState } from 'react';
import dynamic from 'next/dynamic';
import { LoggedUser } from '../../lib/user';
import Logo, { LogoPosition } from '../Logo';
import { useEasterEggTheme } from '../../hooks/utils/useEasterEggTheme';

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
  const easterEggTheme = useEasterEggTheme();

  return (
    <>
      <Logo
        position={position}
        onLogoClick={onLogoClick}
        showGreeting={showGreeting}
        easterEggTheme={easterEggTheme}
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
