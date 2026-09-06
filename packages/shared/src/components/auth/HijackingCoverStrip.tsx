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
  signup: string;
  login: string;
}

const coverArtPosition = { objectPosition: '50% 62%' };

// The card's height without a sizer; a placeholder of the same height can
// hold its slot before it renders.
export const hijackingCoverStripMinHeight = 'min-h-[14rem]';

interface HijackingCoverStripProps {
  copy: HijackingCoverCopy;
  onSignupClick: () => void;
  onLoginClick: () => void;
  // Invisible in-flow content that sets the card's height. The extension's
  // arm reserves the control strip's exact height with it; surfaces with no
  // control to match leave it out and the copy sizes the card.
  sizer?: ReactNode;
  className?: string;
}

export function HijackingCoverStrip({
  copy,
  onSignupClick,
  onLoginClick,
  sizer,
  className,
}: HijackingCoverStripProps): ReactElement {
  return (
    <section className={classNames('w-full', className)}>
      <div
        className={classNames(
          'relative overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-raw-pepper-90 shadow-2',
          !sizer && hijackingCoverStripMinHeight,
        )}
      >
        <img
          src={cloudinaryHijackingCoverArt}
          alt=""
          aria-hidden
          role="presentation"
          className="pointer-events-none absolute inset-0 size-full object-cover"
          style={coverArtPosition}
        />
        <div className="cover-hero-dome pointer-events-none absolute inset-0" />
        <div className="from-raw-pepper-90/70 pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t to-transparent" />
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
              : classNames('px-5 py-10', hijackingCoverStripMinHeight),
          )}
        >
          <h3 className="font-bold text-white typo-title2 [text-shadow:0_2px_18px_rgba(0,0,0,0.6)]">
            {copy.heading}
          </h3>
          <p className="text-white/80 mt-1 max-w-[34rem] text-balance text-sm [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">
            {copy.body}
          </p>
          <div className="mt-4 flex flex-row justify-center gap-2.5">
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
              {copy.signup}
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
              {copy.login}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
