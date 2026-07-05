import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { useViewSize, useViewSizeClient, ViewSize } from '../../hooks';
import { isPWA } from '../../lib/func';
import type { WithClassNameProps } from '../utilities';
import { GoBackButton } from '../post/GoBackHeaderMobile';

export const ProfileMobileBackButton = ({
  className,
}: WithClassNameProps): ReactElement | null => {
  const isLaptop = useViewSize(ViewSize.Laptop);

  if (isLaptop) {
    return null;
  }

  return <GoBackButton showLogo={false} className={className} />;
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
      className={classNames('hidden laptop:flex', className)}
    />
  );
};
