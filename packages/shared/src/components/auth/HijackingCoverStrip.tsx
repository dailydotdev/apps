import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { cloudinaryHijackingCoverArt } from '../../lib/image';

export const hijackingPrimaryCta =
  'transition-transform duration-200 ease-out hover:-translate-y-0.5';

export const hijackingGlassCta =
  '!border-white/20 !bg-white/[0.06] !text-white backdrop-blur-sm transition-colors duration-200 hover:!bg-white/[0.12]';

export interface HijackingCoverCopy {
  heading: string;
  body: string;
}

interface HijackingCoverAuthActionsProps {
  signup: string;
  login: string;
  onSignupClick: () => void;
  onLoginClick: () => void;
}

// The sign up / log in pair for surfaces that offer both.
export function HijackingCoverAuthActions({
  signup,
  login,
  onSignupClick,
  onLoginClick,
}: HijackingCoverAuthActionsProps): ReactElement {
  return (
    <>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        className={classNames(
          'group/cta shadow-2 shadow-black/40',
          hijackingPrimaryCta,
        )}
        onClick={onSignupClick}
      >
        {signup}
        <span className="ml-1 inline-block transition-transform duration-200 group-hover/cta:translate-x-0.5">
          →
        </span>
      </Button>
      <Button
        type="button"
        variant={ButtonVariant.Secondary}
        size={ButtonSize.Medium}
        className={hijackingGlassCta}
        onClick={onLoginClick}
      >
        {login}
      </Button>
    </>
  );
}

const coverArtPosition = { objectPosition: '50% 62%' };

// The card's height without a sizer.
export const hijackingCoverStripMinHeight = 'min-h-[14rem]';

interface HijackingCoverCardProps {
  children: ReactNode;
  className?: string;
}

// The cover art card; children lay out the content over it.
export function HijackingCoverCard({
  children,
  className,
}: HijackingCoverCardProps): ReactElement {
  return (
    <section className={classNames('w-full', className)}>
      <div className="relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90 shadow-2">
        <img
          src={cloudinaryHijackingCoverArt}
          alt=""
          aria-hidden
          role="presentation"
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none absolute inset-0 size-full object-cover"
          style={coverArtPosition}
        />
        <div className="cover-hero-dome pointer-events-none absolute inset-0" />
        <div className="from-raw-pepper-90/70 pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t to-transparent" />
        {children}
      </div>
    </section>
  );
}

export const hijackingCoverHeadingClassName =
  'font-bold text-white typo-title2 [text-shadow:0_2px_18px_rgba(0,0,0,0.6)]';

export const hijackingCoverBodyClassName =
  'text-white/80 text-balance text-sm [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]';

interface HijackingCoverStripProps {
  copy: HijackingCoverCopy;
  // The CTA row under the copy.
  actions: ReactNode;
  // Invisible in-flow content that sets the card's height. The extension's
  // arm reserves the control strip's exact height with it; surfaces with no
  // control to match leave it out and the copy sizes the card.
  sizer?: ReactNode;
  className?: string;
}

export function HijackingCoverStrip({
  copy,
  actions,
  sizer,
  className,
}: HijackingCoverStripProps): ReactElement {
  return (
    <HijackingCoverCard className={className}>
      {!!sizer && (
        <div
          aria-hidden
          className="invisible hidden tablet:flex tablet:flex-row tablet:items-stretch"
        >
          {sizer}
        </div>
      )}
      <div
        className={classNames(
          'dark relative z-1 flex flex-col items-center justify-center text-center',
          sizer
            ? 'p-5 tablet:absolute tablet:inset-0'
            : `px-5 py-10 ${hijackingCoverStripMinHeight}`,
        )}
      >
        <h3 className={hijackingCoverHeadingClassName}>{copy.heading}</h3>
        <p
          className={classNames(
            'mt-1 max-w-[34rem]',
            hijackingCoverBodyClassName,
          )}
        >
          {copy.body}
        </p>
        <div className="mt-4 flex flex-row justify-center gap-2.5">
          {actions}
        </div>
      </div>
    </HijackingCoverCard>
  );
}

// The same box as the strip without a sizer, empty: holds its slot.
export function HijackingCoverStripPlaceholder({
  className,
}: {
  className?: string;
}): ReactElement {
  return (
    <section aria-hidden className={classNames('w-full', className)}>
      <div className={hijackingCoverStripMinHeight} />
    </section>
  );
}
