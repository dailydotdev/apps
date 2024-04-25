import React, { PropsWithChildren, ReactElement, useCallback } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { WithClassNameProps } from '../utilities';
import { isDevelopment } from '../../lib/constants';
import Logo, { LogoPosition } from '../Logo';
import { useEasterEggTheme } from '../../hooks/utils/useEasterEggTheme';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';

const checkSameSite = () => {
  const referrer = globalThis?.document?.referrer;
  const origin = globalThis?.window?.location.origin;

  if (!referrer) {
    return true; // empty referrer means you are from the same site or from blank tab or no-referrer header was used :/
  }

  return (
    referrer === origin || origin === referrer.substring(0, referrer.length - 1) // remove trailing slash
  );
};

export function GoBackHeaderMobile({
  children,
  className,
}: PropsWithChildren<WithClassNameProps>): ReactElement {
  const router = useRouter();
  const goHome = useCallback(() => router.push('/'), [router]);
  const easterEggTheme = useEasterEggTheme();
  const scrollClassName = useScrollTopClassName({
    scrolledClassName: 'bg-transparent',
    defaultClassName: 'bg-background-default',
  });

  const logoButton = (
    <Logo
      onLogoClick={goHome}
      position={LogoPosition.Initial}
      easterEggTheme={easterEggTheme}
    />
  );

  const canGoBack =
    globalThis?.history?.length > 1 && (checkSameSite() || isDevelopment);

  if (!canGoBack && !children) {
    return logoButton;
  }

  return (
    <span
      className={classNames(
        'sticky top-0 z-postNavigation flex flex-row items-center border-b border-border-subtlest-tertiary px-4 py-2 laptop:hidden',
        scrollClassName,
        className,
      )}
    >
      {canGoBack ? (
        <Button
          icon={<ArrowIcon className="-rotate-90" />}
          size={ButtonSize.Small}
          variant={ButtonVariant.Tertiary}
          onClick={router.back}
        />
      ) : (
        logoButton
      )}
      {children}
    </span>
  );
}
