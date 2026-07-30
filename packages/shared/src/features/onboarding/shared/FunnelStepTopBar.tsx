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

/**
 * Logo height on desktop. `h-logo` (18px) is the app header's size, which reads
 * as an afterthought on a full-screen funnel step; this is the step up. Applied
 * to the strip's row as well as the mark itself, so the two stay locked together
 * (see the row comment below).
 */
const desktopLogoHeight = 'laptop:h-6';

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
      <div
        className={classNames(
          'flex h-logo w-full items-center justify-between gap-3 px-6',
          desktopLogoHeight,
        )}
      >
        {/* Decoration, not navigation: the mark is drawn directly rather than
            through `Logo`, because `Logo`'s `linkDisabled` only adds
            `pointer-events-none` — it keeps the real href and stays in the tab
            order, so one Tab + Enter (or a click, since the strip re-enables
            pointer events on its controls) walked the user out of the funnel.
            Icon only below laptop: the wordmark costs width the skip button
            needs on a 390px screen. */}
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
