import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonProps } from '../../../components/buttons/Button';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import Logo, { LogoPosition } from '../../../components/Logo';
import { useViewSize, ViewSize } from '../../../hooks';
import { FunnelTargetId } from '../types/funnelEvents';

export interface FunnelStepTopBarProps {
  skip?: ButtonProps<'button'> & { cta?: string };
}

/**
 * The onboarding funnel's chrome: brand on the left, the way out on the right.
 *
 * Shared rather than owned by the CTA wrapper, because the Plus step keeps
 * production's own layout (its actions live inside the plan cards) and still
 * needs the same strip above it.
 */
export function FunnelStepTopBar({
  skip,
}: FunnelStepTopBarProps): ReactElement {
  const { cta: skipLabel, ...skipProps } = skip ?? {};
  // Button size is a prop, not a class, so the step up on desktop can't be a
  // breakpoint variant.
  const isLaptop = useViewSize(ViewSize.Laptop);

  return (
    // In flow, not absolute, so the strip reserves its own height and can never
    // land on a step's headline; sticky so it stays reachable on long steps.
    <div className="pointer-events-none sticky top-0 z-3 pt-6">
      {/* Full-bleed, not on the rail: the rail is a 512px centred box, so a logo
          inside it reads as centred on a wide screen instead of sitting in the
          corner. `px-6` matches the rail's gutter, so on a phone the logo still
          lines up with the content below it, and the strip's padding is an even
          24px from the top and both edges. */}
      {/* The row is the LOGO's height, not the taller skip button's, so the
          space above the wordmark equals the gutter beside it — the button is a
          transparent text button, so it simply overflows the row symmetrically
          and stays optically centred on the logo. Sizing the row off the logo
          also keeps its y identical on steps with and without a skip. */}
      <div className="flex h-logo w-full items-center justify-between gap-3 px-6 laptop:h-logo-big">
        {/* Icon only below laptop: the wordmark costs width the skip button
            needs on a 390px screen. */}
        <Logo
          className="pointer-events-auto h-fit w-fit"
          hideTextMobile
          linkDisabled
          logoClassName={{ container: 'h-logo laptop:h-logo-big' }}
          position={LogoPosition.Empty}
        />
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
