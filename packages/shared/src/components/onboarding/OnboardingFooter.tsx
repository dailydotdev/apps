import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { wrapperMaxWidth } from './common';
import SignupDisclaimer from '../auth/SignupDisclaimer';

export const OnboardingFooter = (): ReactElement => (
  <footer
    className={classNames(
      'flex h-full max-h-[10rem] w-full px-4 tablet:px-6',
      wrapperMaxWidth,
    )}
  >
    <div className="relative flex flex-1 flex-col gap-6 pb-6 tablet:mt-auto laptop:mr-8 laptop:max-w-[27.5rem]">
      <SignupDisclaimer className="mb-0 hidden tablet:mb-10 tablet:block" />
    </div>
    <div className="hidden flex-1 tablet:block" />
  </footer>
);
