import type { PropsWithChildren, ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import type { WithClassNameProps } from '../utilities';
import Logo, { LogoPosition } from '../Logo';
import { useFeatureTheme } from '../../hooks/utils/useFeatureTheme';
import { useScrollTopClassName } from '../../hooks/useScrollTopClassName';
import { useViewSize, ViewSize } from '../../hooks';

export const GoBackButton = ({
  className,
  showLogo = true,
}: WithClassNameProps & {
  showLogo?: boolean;
}): JSX.Element => {
  const router = useRouter();
  const goHome = useCallback(() => router.push('/'), [router]);
  const featureTheme = useFeatureTheme();

  const canGoBack = globalThis?.history?.length > 1;

  const logoButton = showLogo ? (
    <Logo
      className="my-2"
      onLogoClick={goHome}
      position={LogoPosition.Initial}
      featureTheme={featureTheme}
    />
  ) : null;

  return canGoBack ? (
    <Button
      icon={<ArrowIcon className="-rotate-90" />}
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
      onClick={router.back}
      className={className}
    />
  ) : (
    logoButton
  );
};

export function GoBackHeaderMobile({
  children,
  className,
}: PropsWithChildren<WithClassNameProps>): ReactElement {
  const router = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const featureTheme = useFeatureTheme();
  const scrollClassName = useScrollTopClassName({ enabled: !!featureTheme });

  if (isLaptop || !router?.isReady || !globalThis?.history) {
    return null;
  }

  return (
    <span
      className={classNames(
        'sticky top-0 z-postNavigation flex flex-row items-center border-b border-border-subtlest-tertiary px-4 py-2 tablet:-mx-6 laptop:hidden',
        scrollClassName,
        className,
      )}
    >
      <GoBackButton />
      {children}
    </span>
  );
}

export default GoBackHeaderMobile;
