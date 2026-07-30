import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

interface FunnelGlassBarProps {
  children: ReactNode;
  className?: string;
}

/**
 * The frame around the onboarding funnel's primary action: a blurred, bordered
 * bar the CTA sits inside, rather than a button sitting on the page.
 *
 * Its own component because the funnel steps are not the only screens that need
 * it — the account-details and verify-email forms sit in FRONT of the stepper
 * and own their submit buttons, so they cannot go through
 * `FunnelStepCtaWrapper` and would otherwise each copy the classes.
 *
 * `bg-surface-float` plus a heavy blur is the design system's glass (see
 * MobilePostFloatingBar); `bg-background-default/95` reads as translucent but
 * resolves to transparent, because the slash modifier cannot apply an alpha to
 * these CSS-variable colours. The shadow is a soft ambient wash rather than the
 * `shadow-2` drop: no offset, a wide blur and the lightest shadow tint, so the
 * bar reads as lifted without a hard edge under it.
 *
 * Nested-radius rule: the inner button radius (Medium = rounded-12) plus this
 * bar's p-1.5 (6px) = rounded-18, so the curves stay concentric. A CTA placed
 * inside should be `ButtonSize.Medium` and `flex-1`.
 */
export function FunnelGlassBar({
  children,
  className,
}: FunnelGlassBarProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex items-center gap-2 rounded-18 border border-border-subtlest-secondary bg-surface-float p-1.5 shadow-[0_0.125rem_1rem_0_var(--theme-shadow-shadow1)] backdrop-blur-[2.5rem]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The CTA geometry the bar expects. Exported so callers cannot drift from it. */
export const funnelGlassBarCta = 'flex-1 whitespace-nowrap !px-3 tablet:!px-6';
