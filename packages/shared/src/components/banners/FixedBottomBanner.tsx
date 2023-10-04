import React, { ReactElement } from 'react';
import CloseButton from '../CloseButton';
import LoginButton from '../LoginButton';
import { Button } from '../buttons/Button';
import { tellMeWhy } from '../../lib/constants';

interface FixedBottomBannerProps {
  onDismiss(): void;
  daysLeft: number;
}

export function FixedBottomBanner({
  onDismiss,
  daysLeft,
}: FixedBottomBannerProps): ReactElement {
  return (
    <div className="flex fixed inset-0 z-max justify-center items-center p-6 w-full bg-gradient-to-l top-[unset] from-[#EF43FD] to-[#6451F3]">
      <CloseButton
        className="top-4 right-4"
        position="absolute"
        onClick={onDismiss}
      />
      <div className="flex flex-col laptop:flex-row gap-4 justify-center laptop:items-center w-full laptop:max-w-[52.25rem]">
        <div className="flex flex-col flex-1 gap-2 w-full">
          <h1 className="font-bold typo-large-title">
            Registration is going to be required in {daysLeft} day
            {daysLeft > 1 ? 's' : ''}
          </h1>
          <p className="flex flex-1 w-full typo-title3">
            We’d love to see you join our community ❤︎. Signing up gets you free
            access to the personalized feed, discussions, squads, AI search, and
            more!
          </p>
        </div>
        <div className="flex flex-row laptop:flex-col gap-2">
          <LoginButton
            showLoginButton={false}
            copy={{ signup: 'Sign up now' }}
          />
          <Button
            tag="a"
            target="_blank"
            href={tellMeWhy}
            className="btn-secondary"
          >
            Tell me why
          </Button>
        </div>
      </div>
    </div>
  );
}
