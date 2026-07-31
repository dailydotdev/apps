import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../../../components/buttons/Button';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import LogoIcon from '../../../svg/LogoIcon';
import LogoText from '../../../svg/LogoText';
import { useViewSize, ViewSize } from '../../../hooks';
import { FunnelTargetId } from '../types/funnelEvents';

export interface FunnelStepTopBarProps {
  skip?: ButtonProps<'button'> & { cta?: string };
}

const desktopLogoHeight = 'laptop:h-6';

export function FunnelStepTopBar({
  skip,
}: FunnelStepTopBarProps): ReactElement {
  const { cta: skipLabel, ...skipProps } = skip ?? {};
  const isLaptop = useViewSize(ViewSize.Laptop);

  return (
    // `w-full` is load-bearing: the sign-back shell centres its children, and
    // without it the strip shrink-wraps to the logo and drifts to mid-screen.
    <div className="pointer-events-none sticky top-0 z-3 w-full pt-6">
      {/* Row height is the logo's, not the taller skip button's, so the space
          above the wordmark equals the gutter beside it. */}
      <div
        className={classNames(
          'flex h-logo w-full items-center justify-between gap-3 px-6',
          desktopLogoHeight,
        )}
      >
        {/* Drawn directly rather than through `Logo`: its `linkDisabled` only
            adds `pointer-events-none`, keeping the href and the tab stop, so
            Tab + Enter left the funnel. */}
        <span aria-hidden className="flex items-center">
          <LogoIcon
            className={{ container: classNames('h-logo', desktopLogoHeight) }}
          />
          <LogoText
            className={{
              container: classNames(
                'ml-1 hidden h-logo laptop:block',
                desktopLogoHeight,
              ),
            }}
          />
        </span>
        {skip && (
          <Button
            className="pointer-events-auto font-normal"
            data-funnel-track={FunnelTargetId.StepSkip}
            size={isLaptop ? ButtonSize.Medium : ButtonSize.Small}
            type="button"
            variant={ButtonVariant.Tertiary}
            {...skipProps}
          >
            {skipLabel ?? 'Skip'}
          </Button>
        )}
      </div>
    </div>
  );
}
