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
import { FunnelGlassBar, funnelGlassBarCta } from './FunnelGlassBar';

export type FunnelStepCtaWrapperProps = ButtonProps<'button'> &
  // Some steps link out instead of transitioning, so the CTA can be an anchor.
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
    isGlass?: boolean;
    /** Rendered in the sticky rail above the bar, so it travels with the CTA. */
    docked?: ReactNode;
  };

/** 32rem = 440px of content plus the px-6 gutter on each side. */
export const funnelStepRail = 'mx-auto w-full max-w-[32rem] px-6';

// One default per branch; the glass branch is onboarding-only by construction.
const DEFAULT_CTA_LABEL = 'Next';
const DEFAULT_ONBOARDING_CTA_LABEL = 'Continue';

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
  // Gated here rather than per caller: the glass bar brings its own logo and
  // skip, which would double the stepper Header's on the paid funnel.
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
            {cta?.label || DEFAULT_CTA_LABEL}
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
      <div className="pointer-events-none sticky z-3 bottom-safe-or-2">
        {/* Scrim so content scrolling past the bar dissolves into the page. */}
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
          {/* The rail is click-through, so a docked control opts back in. */}
          {!!docked && <div className="pointer-events-auto">{docked}</div>}
          <FunnelGlassBar className="pointer-events-auto">
            <Button
              className={classNames(
                className,
                cta?.animation,
                funnelGlassBarCta,
              )}
              data-funnel-track={FunnelTargetId.StepCta}
              size={ButtonSize.Medium}
              {...(props.tag !== 'a' && { type: 'button' })}
              variant={ButtonVariant.Primary}
              {...props}
            >
              {cta?.label || DEFAULT_ONBOARDING_CTA_LABEL}
            </Button>
          </FunnelGlassBar>
          <FunnelStepDots />
        </div>
      </div>
    </div>
  );
}
