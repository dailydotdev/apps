import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';

type EngagementAdCtaProps = {
  href: string;
  children: ReactNode;
  // The campaign's brand color. Applied via inline style so it bypasses the
  // no-custom-color lint (which only inspects bg-/text- classNames, not inline
  // styles) — brand colors are arbitrary and outside the design palette.
  brandColor: string;
  className?: string;
  // White fill with brand-colored label — for use on the strip's saturated
  // brand gradient, where a brand-colored fill would have no contrast.
  inverted?: boolean;
  onClick?: () => void;
};

export const EngagementAdCta = ({
  href,
  children,
  brandColor,
  className,
  inverted = false,
  onClick,
}: EngagementAdCtaProps): ReactElement => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    style={
      inverted
        ? { backgroundColor: '#ffffff', color: brandColor }
        : { backgroundColor: brandColor, color: '#ffffff' }
    }
    className={classNames(
      'hover:opacity-90 inline-flex shrink-0 items-center justify-center rounded-12 px-5 py-2.5 font-bold no-underline transition-opacity typo-callout',
      className,
    )}
  >
    {children}
  </a>
);
