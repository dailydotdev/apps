import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { Fragment } from 'react';
import Logo, { LogoPosition } from '../Logo';
import { wrapperMaxWidth } from './common';
import classed from '../../lib/classed';
import { FunnelTargetId } from '../../features/onboarding/types/funnelEvents';

type OnboardingHeaderProps = {
  isLanding?: boolean;
};

const Header = classed(
  'header',
  `flew-row mt-6 flex h-full w-full justify-between px-6 tablet:mt-16 laptop:mt-20 ${wrapperMaxWidth}`,
);

export const OnboardingHeader = ({
  isLanding = false,
}: OnboardingHeaderProps): ReactElement => {
  const Wrapper = isLanding ? Header : Fragment;
  return (
    <Wrapper>
      <Logo
        className={classNames(
          'w-auto',
          !isLanding && 'px-10 py-8 laptop:w-full',
        )}
        data-funnel-track={FunnelTargetId.Logo}
        linkDisabled
        logoClassName={isLanding ? { container: 'h-6 tablet:h-8' } : undefined}
        position={LogoPosition.Relative}
      />
    </Wrapper>
  );
};
