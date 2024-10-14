import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { CSSTransition } from 'react-transition-group';
import { LinkWithTooltip } from './tooltips/LinkWithTooltip';
import LogoText from '../svg/LogoText';
import LogoIcon from '../svg/LogoIcon';
import { webappUrl } from '../lib/constants';

export enum LogoPosition {
  Absolute = 'absolute',
  Relative = 'relative',
  Initial = 'initial',
}

const logoPositionToClassName: Record<LogoPosition, string> = {
  [LogoPosition.Absolute]: classNames(
    'absolute left-1/2 top-4 mt-0.5 -translate-x-1/2',
    'laptop:relative laptop:left-[unset] laptop:top-[unset] laptop:mt-0 laptop:translate-x-[unset]',
  ),
  [LogoPosition.Relative]: classNames('relative mt-0.5', 'laptop:mt-0'),
  [LogoPosition.Initial]: '',
};

interface LogoSvgElemProps {
  className?: {
    container?: string;
    group?: string;
  };
  src?: string;
  fallback: typeof LogoText | typeof LogoIcon;
}

const LogoSvgElem = ({
  className,
  src,
  fallback: FallbackElem,
}: LogoSvgElemProps): ReactElement => {
  if (src) {
    return (
      <img
        loading="eager"
        fetchPriority="high"
        src={src}
        className={className?.container}
        alt="daily.dev logo"
      />
    );
  }
  return <FallbackElem className={className} />;
};

interface LogoProps {
  className?: string;
  logoClassName?: {
    container?: string;
    group?: string;
  };
  showGreeting?: boolean;
  onLogoClick?: (e: React.MouseEvent) => unknown;
  hideTextMobile?: boolean;
  compact?: boolean;
  position?: LogoPosition;
  featureTheme?: {
    logo?: string;
    logoText?: string;
  };
  linkDisabled?: boolean;
}

export default function Logo({
  className,
  logoClassName = { container: 'h-logo' },
  showGreeting,
  onLogoClick,
  hideTextMobile = false,
  compact = false,
  position = LogoPosition.Absolute,
  featureTheme,
  linkDisabled,
}: LogoProps): ReactElement {
  return (
    <LinkWithTooltip
      href={webappUrl}
      passHref
      prefetch={false}
      tooltip={{ placement: 'right', content: 'Home' }}
    >
      <a
        aria-disabled={linkDisabled}
        className={classNames(
          'flex items-center',
          logoPositionToClassName[position],
          className,
          linkDisabled && 'pointer-events-none',
        )}
        href={webappUrl}
        onClick={onLogoClick}
      >
        <LogoSvgElem
          className={logoClassName}
          src={featureTheme?.logo}
          fallback={LogoIcon}
        />
        {!compact && (
          <CSSTransition
            in={!showGreeting}
            timeout={500}
            classNames="fade"
            unmountOnExit
          >
            <LogoSvgElem
              className={{
                container: classNames(
                  'ml-1',
                  logoClassName?.container,
                  hideTextMobile && 'hidden laptop:block',
                ),
                group: logoClassName?.group,
              }}
              src={featureTheme?.logoText}
              fallback={LogoText}
            />
          </CSSTransition>
        )}
      </a>
    </LinkWithTooltip>
  );
}
