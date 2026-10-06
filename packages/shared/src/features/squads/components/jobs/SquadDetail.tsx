import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';

// Pieces shared by a role's page and a perk's page.

/** A section under a heading with a rule, like the tool page. */
export const SquadDetailSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex items-center gap-4">
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
        bold
        className="shrink-0"
      >
        {title}
      </Typography>
      <span aria-hidden className="h-px flex-1 bg-border-subtlest-tertiary" />
    </div>
    {children}
  </section>
);

export const SquadDetailBullets = ({
  items,
}: {
  items: string[];
}): ReactElement => (
  <ul className="flex flex-col gap-2">
    {items.map((item) => (
      <li key={item} className="flex gap-2">
        <span
          aria-hidden
          className="mt-2 size-1.5 shrink-0 rounded-full bg-text-quaternary"
        />
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          {item}
        </Typography>
      </li>
    ))}
  </ul>
);

export const SquadDetailFacts = ({
  facts,
}: {
  facts: string[];
}): ReactElement => (
  <ul className="flex flex-wrap gap-2">
    {facts.map((fact) => (
      <li
        key={fact}
        className="rounded-10 bg-surface-float px-2.5 py-1 text-text-secondary typo-footnote"
      >
        {fact}
      </li>
    ))}
  </ul>
);

/**
 * A role or perk page that has nothing to show: gone (or another squad's),
 * or a load that failed and can be tried again.
 */
export const SquadDetailUnavailable = ({
  isGone,
  goneText,
  onRetry,
}: {
  isGone: boolean;
  goneText: string;
  onRetry: () => void;
}): ReactElement => (
  <div className="flex flex-col items-start gap-3">
    <Typography type={TypographyType.Callout} color={TypographyColor.Secondary}>
      {isGone ? goneText : 'We couldn’t load this. Please try again.'}
    </Typography>
    {!isGone && (
      <Button
        type="button"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        onClick={onRetry}
      >
        Try again
      </Button>
    )}
  </div>
);
