import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import {
  FunnelGlassBar,
  funnelGlassBarCta,
} from '../../features/onboarding/shared/FunnelGlassBar';

type AuthActionBarProps = ButtonProps<'button'> & {
  // Lifts the bar over the pop-up's pinned footer instead of under it.
  aboveFooter?: boolean;
};

// The onboarding steps' glass bar for a screen's one main action: it follows
// the content, and pins to the bottom once the content outgrows the pop-up.
export function AuthActionBar({
  aboveFooter,
  children,
  className,
  ...props
}: AuthActionBarProps): ReactElement {
  return (
    <div
      className={classNames(
        'sticky z-1 w-full pt-4',
        aboveFooter ? 'bottom-16' : 'bottom-0 pb-4',
      )}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 -top-2 bottom-0 bg-gradient-to-t from-background-default via-background-default via-65% to-transparent"
      />
      <FunnelGlassBar className="relative">
        <Button
          {...props}
          className={classNames(className, funnelGlassBarCta)}
          size={ButtonSize.Medium}
          variant={ButtonVariant.Primary}
        >
          {children}
        </Button>
      </FunnelGlassBar>
    </div>
  );
}
