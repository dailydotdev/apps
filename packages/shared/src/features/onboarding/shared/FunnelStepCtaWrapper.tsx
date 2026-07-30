import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import type { ButtonProps } from '../../../components/buttons/Button';
import {
  Button,
  ButtonVariant,
  ButtonSize,
  ButtonIconPosition,
} from '../../../components/buttons/Button';
import { FunnelTargetId } from '../types/funnelEvents';
import { MoveToIcon } from '../../../components/icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { sanitizeMessage } from '../lib/utils';
import { FunnelStepDots, useIsOnboardingFunnel } from './FunnelStepDots';
import { FunnelStepTopBar } from './FunnelStepTopBar';

export type FunnelStepCtaWrapperProps = ButtonProps<'button'> &
  // Some steps link out instead of transitioning (e.g. the extension download),
  // so the docked CTA has to be able to render as an anchor.
  Pick<ButtonProps<'a'>, 'href' | 'target' | 'rel'> & {
    cta?: {
      label?: string;
      note?: string;
      animation?: string;
    };
    containerClassName?: string;
    skip?: ButtonProps<'button'> & {
      cta?: string;
    };
    // Opt-in: renders the docked CTA as the floating glass bar. Only the
    // post-signup onboarding steps use it — the paid funnel keeps the original
    // full-width button below.
    isGlass?: boolean;
    // Rendered in the sticky rail directly above the bar, so a control the CTA
    // acts on (the Plus/Free choice) travels with it instead of scrolling away.
    docked?: ReactNode;
  };

/**
 * The rail the docked CTA bar sits in. Steps put their content column in the
 * same rail so the bar shares the content's edges and keeps an identical width
 * and position from step to step.
 *
 * 32rem = the 440px the rail is allowed to grow to, plus the px-6 on each side,
 * so the content inside the rail measures exactly 440px once the cap binds and
 * stays 24px clear of the screen edges below that — enough to keep the content
 * out of the edge aura's glow.
 */
export const funnelStepRail = 'mx-auto w-full max-w-[32rem] px-6';

export function FunnelStepCtaWrapper({
  children,
  className,
  cta,
  skip,
  containerClassName,
  isGlass,
  docked,
  ...props
}: FunnelStepCtaWrapperProps): ReactElement {
  const { cta: skipLabel, ...skipProps } = skip ?? {};
  // The glass bar carries the funnel's own chrome — the top bar's logo and skip
  // — so it can only ever render inside the post-signup funnel. Gating here
  // rather than trusting each caller: the paid funnel keeps its stepper Header,
  // and a step that asked for glass unconditionally would otherwise paint a
  // second logo and a second Skip over it.
  const isOnboarding = useIsOnboardingFunnel();
  const hasGlass = isGlass && isOnboarding;
  const note = useMemo(() => {
    if (!cta?.note) {
      return null;
    }

    const sanitized = sanitizeMessage(cta.note);

    return (
      <Typography
        className="text-center"
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }, [cta?.note]);

  if (!hasGlass) {
    return (
      <div className="relative flex flex-1 flex-col gap-4">
        <div className={classNames('flex-1', containerClassName)}>
          {children}
        </div>
        <div className="sticky mx-auto my-4 flex w-full max-w-md flex-col gap-4 px-4 bottom-safe-or-2">
          {note}
          <Button
            className={classNames(className, cta?.animation, 'w-full')}
            data-funnel-track={FunnelTargetId.StepCta}
            size={ButtonSize.XLarge}
            type="button"
            variant={ButtonVariant.Primary}
            {...props}
          >
            {cta?.label ?? 'Next'}
          </Button>
          {skip && (
            <Button
              data-funnel-track={FunnelTargetId.StepCta}
              variant={ButtonVariant.Tertiary}
              type="button"
              icon={<MoveToIcon />}
              iconPosition={ButtonIconPosition.Right}
              {...skipProps}
            >
              {skipLabel ?? 'Skip'}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col gap-4">
      <FunnelStepTopBar skip={skip} />
      <div className={classNames('flex-1', containerClassName)}>{children}</div>
      {/* A floating glass control bar rather than a button sitting on the page:
          it hovers above the content, blurred and shadowed, and the CTA flexes
          to fill it, so the bar is one width on every step. */}
      <div className="pointer-events-none sticky z-3 bottom-safe-or-2">
        {/* A scrim under the docked controls: content scrolling past the bar
            dissolves into the page instead of colliding with it. Full-bleed, so
            it sits outside the rail, and it runs from below the screen edge (to
            cover the safe-area offset) up to just above the dots. */}
        <div
          aria-hidden
          className="absolute inset-x-0 -bottom-6 -top-2 bg-gradient-to-t from-background-default via-background-default via-65% to-transparent"
        />
        <div
          className={classNames(
            funnelStepRail,
            'relative flex flex-col gap-3 pb-6 pt-6',
          )}
        >
          {note}
          {!!docked && (
            // The rail is click-through so the glow can sit over content; a
            // docked control has to opt back in.
            <div className="pointer-events-auto">{docked}</div>
          )}
          {/* Nested-radius rule: the inner button radius (Medium = rounded-12)
            plus the bar's p-1.5 (6px) = rounded-18, so the curves stay
            concentric. */}
          {/* `bg-surface-float` + a heavy blur is the design system's glass (see
            MobilePostFloatingBar). A `bg-background-default/95` reads as
            translucent but resolves to transparent — the slash modifier can't
            apply an alpha to these CSS-variable colours.
            The shadow is a soft ambient wash rather than the `shadow-2` drop:
            no offset, a wide blur and the lightest shadow tint, so the bar
            reads as lifted without a hard edge under it. */}
          <div className="pointer-events-auto flex items-center gap-2 rounded-18 border border-border-subtlest-secondary bg-surface-float p-1.5 shadow-[0_0.125rem_1rem_0_var(--theme-shadow-shadow1)] backdrop-blur-[2.5rem]">
            {/* Skip lives in the top bar, so the CTA owns the whole bar. */}
            <Button
              className={classNames(
                className,
                cta?.animation,
                'flex-1 whitespace-nowrap !px-3 tablet:!px-6',
              )}
              data-funnel-track={FunnelTargetId.StepCta}
              size={ButtonSize.Medium}
              {...(props.tag !== 'a' && { type: 'button' })}
              variant={ButtonVariant.Primary}
              {...props}
            >
              {cta?.label ?? 'Continue'}
            </Button>
          </div>
          {/* Under the bar, not above it: the CTA is what the eye should land
              on, and the progress reads as a footnote to it. */}
          <FunnelStepDots />
        </div>
      </div>
    </div>
  );
}
