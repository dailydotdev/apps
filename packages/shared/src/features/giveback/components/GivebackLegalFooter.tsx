import type { ReactElement } from 'react';
import React from 'react';
import { FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { privacyPolicy, termsOfService } from '../../../lib/constants';

// Legal/footer home for the campaign. One quiet line: funding disclaimer on the
// left, the terms/rules/privacy links on the right. Cookie policy is omitted on
// purpose since the global cookie banner already covers it.
const legalLinks: { label: string; href: string }[] = [
  { label: 'Campaign rules', href: termsOfService },
  { label: 'Terms of Service', href: termsOfService },
  { label: 'Privacy Policy', href: privacyPolicy },
];

export const GivebackLegalFooter = (): ReactElement => (
  <div className="flex w-full flex-col items-center justify-between gap-2 border-t border-border-subtlest-tertiary pt-5 text-center tablet:flex-row tablet:text-left">
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Caption2}
      color={TypographyColor.Quaternary}
    >
      Funded by daily.dev. Participants never pay. © {new Date().getFullYear()}{' '}
      Daily Dev Ltd.
    </Typography>

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
  </div>
);
