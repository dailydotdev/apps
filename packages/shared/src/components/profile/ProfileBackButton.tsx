import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useViewSizeClient, ViewSize } from '../../hooks';
import { isPWA } from '../../lib/func';
import type { WithClassNameProps } from '../utilities';
import { GoBackButton } from '../post/GoBackHeaderMobile';

// The server cannot know the viewport, so the button is in the HTML and
// CSS hides it on a laptop; the hook only unmounts it once hydrated.
export const ProfileMobileBackButton = ({
  className,
}: WithClassNameProps): ReactElement | null => {
  const isLaptop = useViewSizeClient(ViewSize.Laptop);

  if (isLaptop) {
    return null;
  }

  return (
    <GoBackButton
      showLogo={false}
      fallbackPath="/"
      className={classNames('laptop:hidden', className)}
    />
  );
};

export const ProfileDesktopPwaBackButton = ({
  className,
}: WithClassNameProps): ReactElement | null => {
  const isLaptop = useViewSizeClient(ViewSize.Laptop);
  const [isStandalonePWA, setIsStandalonePWA] = useState(false);

  useEffect(() => {
    setIsStandalonePWA(isPWA());
  }, []);

  if (!isLaptop || !isStandalonePWA) {
    return null;
  }

  return (
    <GoBackButton
      showLogo={false}
      fallbackPath="/"
      className={classNames('hidden laptop:flex', className)}
    />
  );
};
