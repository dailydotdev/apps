import type { ReactElement } from 'react';
import React from 'react';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  cookiePolicy,
  privacyPolicy,
  termsOfService,
} from '../../../lib/constants';

// Legal/footer home for the campaign. Kept flat and muted so it closes the page
// quietly while still surfacing the terms, campaign rules and privacy links the
// initiative needs.
const legalLinks: { label: string; href: string }[] = [
  { label: 'Campaign rules', href: termsOfService },
  { label: 'Terms of Service', href: termsOfService },
  { label: 'Privacy Policy', href: privacyPolicy },
  { label: 'Cookie Policy', href: cookiePolicy },
];

export const GivebackLegalFooter = (): ReactElement => (
  <FlexCol className="w-full items-center gap-2 border-t border-border-subtlest-tertiary pt-5 text-center">
    <FlexRow className="flex-wrap items-center justify-center gap-x-4 gap-y-1">
      {legalLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-text-tertiary transition-colors typo-caption1 hover:text-text-primary"
        >
          {link.label}
        </a>
      ))}
    </FlexRow>

    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Caption2}
      color={TypographyColor.Quaternary}
      className="max-w-xl"
    >
      Funded by daily.dev. Participants never pay. Subject to the campaign
      rules. © {new Date().getFullYear()} Daily Dev Ltd.
    </Typography>
  </FlexCol>
);
