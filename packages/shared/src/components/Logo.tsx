import React, { ReactElement } from 'react';
import { CSSTransition } from 'react-transition-group';
import { LinkWithTooltip } from './tooltips/LinkWithTooltip';
import LogoText from '../svg/LogoText';
import LogoIcon from '../svg/LogoIcon';

interface LogoProps {
  showGreeting: boolean;
  onLogoClick: (e: React.MouseEvent) => unknown;
}

export default function Logo({
  showGreeting,
  onLogoClick,
}: LogoProps): ReactElement {
  return (
    <LinkWithTooltip
      href={process.env.NEXT_PUBLIC_WEBAPP_URL}
      passHref
      prefetch={false}
      tooltip={{ placement: 'right', content: 'Home' }}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <a className="flex items-center" onClick={onLogoClick}>
        <LogoIcon className="h-logo" />
        <CSSTransition
          in={!showGreeting}
          timeout={500}
          classNames="fade"
          unmountOnExit
        >
          <LogoText className="hidden laptop:block ml-1 h-logo" />
        </CSSTransition>
      </a>
    </LinkWithTooltip>
  );
}
