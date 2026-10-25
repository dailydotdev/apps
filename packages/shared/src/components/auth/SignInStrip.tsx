import type { ReactElement } from 'react';
import React from 'react';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { Typography, TypographyType } from '../typography/Typography';
import LoginButton from '../LoginButton';
import { GetAppButton } from '../../features/getApp/components/GetAppButton';

export const SignInStrip = (): ReactElement => (
  <section
    aria-label="Sign in to daily.dev"
    className="sticky top-[var(--sticky-header-offset,0px)] z-3 mb-3"
  >
    <div className="flex items-center justify-between gap-4 rounded-12 border border-border-subtlest-quaternary bg-background-default px-6 py-4">
      <Typography
        type={TypographyType.Body}
        bold
        className="min-w-0 flex-1 text-text-primary"
      >
        Sign in to personalize your feed
      </Typography>
      <div className="flex shrink-0 items-center gap-2">
        <GetAppButton
          showLabel
          variant={ButtonVariant.Secondary}
          size={ButtonSize.Small}
        />
        <LoginButton
          size={ButtonSize.Small}
          className={{ container: 'gap-2' }}
        />
      </div>
    </div>
  </section>
);
