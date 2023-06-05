import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { CSSTransition } from 'react-transition-group';
import { LinkWithTooltip } from './tooltips/LinkWithTooltip';
import LogoText from '../svg/LogoText';
import LogoIcon from '../svg/LogoIcon';
import useMedia from '../hooks/useMedia';
import { laptop } from '../styles/media';

interface LogoProps {
  className?: string;
  logoClassName?: string;
  showGreeting?: boolean;
  onLogoClick?: (e: React.MouseEvent) => unknown;
  hideTextMobile?: boolean;
}

export default function Logo({
  className,
  logoClassName = 'h-logo',
  showGreeting,
  onLogoClick,
  hideTextMobile = false,
}: LogoProps): ReactElement {
  const isTablet = !useMedia([laptop.replace('@media ', '')], [true], false);

  return (
    <LinkWithTooltip
      href={process.env.NEXT_PUBLIC_WEBAPP_URL}
      passHref
      prefetch={false}
      tooltip={{ placement: 'right', content: 'Home' }}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
      <a
        className={classNames(
          'flex items-center',
          isTablet && 'absolute left-1/2 -translate-x-1/2 top-4 mt-0.5',
          className,
        )}
        onClick={onLogoClick}
      >
        <LogoIcon className={logoClassName} />
        {!isTablet && (
          <CSSTransition
            in={!showGreeting}
            timeout={500}
            classNames="fade"
            unmountOnExit
          >
            <LogoText
              className={classNames(
                'ml-1',
                logoClassName,
                hideTextMobile && 'hidden laptop:block',
              )}
            />
          </CSSTransition>
        )}
      </a>
    </LinkWithTooltip>
  );
}
