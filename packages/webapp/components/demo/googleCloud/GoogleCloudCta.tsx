import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { gcpButtonStyle, gcpProductBlue } from './brand';

type GoogleCloudCtaProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  // White fill with blue label — for use on the blue strip background where
  // the solid blue button would have no contrast.
  inverted?: boolean;
};

// Google product-blue CTA. Uses an inline style for the brand fill (outside
// the design-system palette) and design-system spacing/typography classes
// for everything else.
export const GoogleCloudCta = ({
  href,
  children,
  className,
  inverted = false,
}: GoogleCloudCtaProps): ReactElement => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={
      inverted
        ? { backgroundColor: '#ffffff', color: gcpProductBlue }
        : gcpButtonStyle
    }
    className={classNames(
      'hover:opacity-90 inline-flex shrink-0 items-center justify-center rounded-12 px-5 py-2.5 font-bold no-underline transition-opacity typo-callout',
      className,
    )}
  >
    {children}
  </a>
);
