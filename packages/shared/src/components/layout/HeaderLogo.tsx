import React, { ReactElement, useState } from 'react';
import dynamic from 'next/dynamic';
import { LoggedUser } from '../../lib/user';
import Logo from '../Logo';

const Greeting = dynamic(
  () => import(/* webpackChunkName: "greeting" */ '../Greeting'),
);

interface HeaderLogoProps {
  user?: LoggedUser;
  greeting?: boolean;
  onLogoClick?: (e: React.MouseEvent) => unknown;
}

function HeaderLogo({
  user,
  greeting,
  onLogoClick,
}: HeaderLogoProps): ReactElement {
  const [showGreeting, setShowGreeting] = useState(false);

  return (
    <>
      <Logo onLogoClick={onLogoClick} showGreeting={showGreeting} />
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
