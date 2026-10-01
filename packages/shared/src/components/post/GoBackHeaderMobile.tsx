import type { PropsWithChildren, ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import type { WithClassNameProps } from '../utilities';
import { isDevelopment } from '../../lib/constants';
import Logo, { LogoPosition } from '../Logo';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { useViewSize, ViewSize } from '../../hooks';
import { useMobileAppHeader } from '../../features/getApp/hooks/useMobileAppHeader';
import { MobileAppActions } from '../../features/getApp/components/MobileAppActions';
import { ShellPage } from '../shell/ShellPageContext';
import { useHideOnScrollDown } from '../../features/getApp/hooks/useHideOnScrollDown';

const checkSameSite = () => {
  const referrer = globalThis?.document?.referrer;
  const origin = globalThis?.window?.location.origin;

  if (!referrer) {
    return true; // empty referrer means you are from the same site or from blank tab or no-referrer header was used :/
  }

  if (!origin) {
    return false;
  }

  try {
    return new URL(referrer).origin === origin;
  } catch {
    return false;
  }
};

export const GoBackButton = ({
  className,
  showLogo = true,
  compactLogo = false,
  fallbackPath,
}: WithClassNameProps & {
  showLogo?: boolean;
  compactLogo?: boolean;
  fallbackPath?: string;
}): JSX.Element | null => {
  const router = useRouter();
  const goHome = useCallback(() => router.push('/'), [router]);
  const featureTheme = useFeatureTheme();

  const canGoBack =
    globalThis?.history?.length > 1 && (checkSameSite() || isDevelopment);

  const goBack = useCallback(() => {
    if (canGoBack) {
      router.back();
      return;
    }

    if (fallbackPath) {
      router.push(fallbackPath);
    }
  }, [canGoBack, fallbackPath, router]);

  const logoButton = showLogo ? (
    <Logo
      className="my-2"
      compact={compactLogo}
      onLogoClick={goHome}
      position={LogoPosition.Initial}
      featureTheme={featureTheme}
    />
  ) : null;

  return canGoBack || fallbackPath ? (
    <Button
      icon={<ArrowIcon className="-rotate-90" />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
      onClick={goBack}
      className={className}
      type="button"
      aria-label="Go back"
    />
  ) : (
    logoButton
  );
};

interface GoBackHeaderMobileProps extends WithClassNameProps {
  title?: string;
  // Off where the bar is pinned inside a sticky parent, which would keep its
  // empty slot on screen.
  hideOnScroll?: boolean;
}

export function GoBackHeaderMobile({
  children,
  className,
  title,
  hideOnScroll = true,
}: PropsWithChildren<GoBackHeaderMobileProps>): ReactElement | null {
  const router = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const isPhone = useViewSize(ViewSize.MobileL);
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });
  const isMobileAppHeader = useMobileAppHeader();
  const isHidden = useHideOnScrollDown(
    isMobileAppHeader && hideOnScroll && !isPhone,
  );

  if (isLaptop || !router?.isReady || !globalThis?.history) {
    return null;
  }

  if (isPhone) {
    return <ShellPage title={title} actions={children} />;
  }

  return (
    <span
      className={classNames(
        'sticky top-[var(--phone-top-ad-height,0px)] z-postNavigation flex flex-row items-center border-b border-border-subtlest-tertiary px-4 py-2 tablet:-mx-6 laptop:hidden',
        scrollClassName,
        isMobileAppHeader && 'transition-transform duration-200 ease-out',
        isHidden && '-translate-y-full',
        className,
      )}
    >
      <GoBackButton compactLogo={isMobileAppHeader} />
      {title && <span className="ml-2 font-bold typo-body">{title}</span>}
      {children}
      {isMobileAppHeader && <MobileAppActions className="ml-auto" />}
    </span>
  );
}

export default GoBackHeaderMobile;
