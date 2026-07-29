import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonProps } from '../../../components/buttons/Button';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import Logo, { LogoPosition } from '../../../components/Logo';
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

  return (
    // In flow, not absolute, so the strip reserves its own height and can never
    // land on a step's headline; sticky so it stays reachable on long steps.
    <div className="pointer-events-none sticky top-0 z-3 pt-6">
      {/* Full-bleed, not on the rail: the rail is a 512px centred box, so a logo
          inside it reads as centred on a wide screen instead of sitting in the
          corner. `px-6` matches the rail's gutter, so on a phone the logo still
          lines up with the content below it, and the strip's padding is an even
          24px from the top and both edges. */}
      {/* `h-8` = the skip button's height, applied whether or not a step has a
          skip, so the logo sits at the same y on every step. */}
      <div className="flex h-8 w-full items-center justify-between gap-3 px-6">
        {/* Icon only below laptop: the wordmark costs width the skip button
            needs on a 390px screen. */}
        <Logo
          className="pointer-events-auto h-fit w-fit"
          hideTextMobile
          linkDisabled
          position={LogoPosition.Empty}
        />
        {skip && (
          <Button
            className="pointer-events-auto font-normal"
            data-funnel-track={FunnelTargetId.StepSkip}
            size={ButtonSize.Small}
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
