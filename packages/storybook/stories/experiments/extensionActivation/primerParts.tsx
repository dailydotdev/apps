import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

// Chrome's own dialog, drawn in its own colours so people recognise it. Its
// real look stays untouched, including the blue "Change it back": the coach is
// added around it and never swaps the buttons' weight.
const chromeBlue = '#0b57d0';

export const ChromePrompt = ({
  coach,
  className,
}: {
  coach?: boolean;
  className?: string;
}): ReactElement => (
  <div
    role="img"
    aria-label='The Chrome prompt, "Change back to Google?", with the buttons Keep it and Change it back'
    className={classNames('w-full max-w-[24rem] rounded-20 p-5', className)}
    style={{
      backgroundColor: '#ffffff',
      color: '#1f1f1f',
      boxShadow: '0 12px 40px rgba(0,0,0,.45)',
    }}
  >
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="flex size-5 items-center justify-center rounded-max font-bold typo-caption1"
        style={{ color: '#ffffff', backgroundColor: '#4285f4' }}
      >
        G
      </span>
      <p className="font-bold typo-callout">Change back to Google?</p>
    </div>
    <p className="mt-3 typo-footnote" style={{ color: '#444746' }}>
      This page was changed by the &quot;daily.dev | Developer News Done Right,
      in Every New Tab&quot; extension
    </p>
    <div className="mt-4 flex items-center justify-end gap-2">
      <span
        className="rounded-max px-4 py-2 font-bold typo-footnote"
        style={{
          backgroundColor: '#d3e3fd',
          color: '#041e49',
          boxShadow: coach ? '0 0 0 3px #ce3df3' : undefined,
        }}
      >
        Keep it
      </span>
      <span
        className="rounded-max px-4 py-2 font-bold typo-footnote"
        style={{ backgroundColor: chromeBlue, color: '#ffffff' }}
      >
        Change it back
      </span>
    </div>
    {coach && (
      <p
        className="mt-2 pr-[7.5rem] text-right font-bold typo-caption1"
        style={{ color: '#a01cc4' }}
      >
        ↑ Press this one
      </p>
    )}
  </div>
);

export const PrimerShell = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex min-h-dvh w-full flex-col items-center justify-center bg-background-default px-6 py-8',
      className,
    )}
  >
    {children}
  </div>
);

export const PrimerCta = ({
  label,
  note,
}: {
  label: string;
  note?: string;
}): ReactElement => (
  <div className="flex flex-col items-center gap-3">
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.XLarge}
    >
      {label}
    </Button>
    {note && (
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        {note}
      </Typography>
    )}
  </div>
);

export const Benefit = ({
  title,
  body,
}: {
  title: string;
  body: string;
}): ReactElement => (
  <li className="flex items-start gap-3">
    <span className="mt-0.5 flex size-6 items-center justify-center rounded-max bg-action-upvote-float text-action-upvote-default">
      <VIcon aria-hidden size={IconSize.XSmall} />
    </span>
    <div className="min-w-0 flex-1">
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
      >
        {title}
      </Typography>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
        className="text-pretty"
      >
        {body}
      </Typography>
    </div>
  </li>
);

// Stands in for the real feed, which needs the whole extension to render.
export const FeedSkeleton = (): ReactElement => (
  <div aria-hidden className="grid grid-cols-4 gap-4">
    {[...Array(8).keys()].map((key) => (
      <div
        key={key}
        className="flex h-64 flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3"
      >
        <div className="size-8 rounded-max bg-surface-float" />
        <div className="h-3 w-full rounded-4 bg-surface-float" />
        <div className="h-3 w-2/3 rounded-4 bg-surface-float" />
        <div className="mt-auto h-24 w-full rounded-12 bg-surface-float" />
      </div>
    ))}
  </div>
);

export const PromptOverlay = ({
  children,
  coach,
}: {
  children: ReactNode;
  coach?: ReactNode;
}): ReactElement => (
  <div className="relative min-h-dvh w-full overflow-hidden bg-background-default">
    {children}
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-5 px-6"
      style={{ backgroundColor: 'rgba(0,0,0,.45)', zIndex: 100 }}
    >
      {coach}
      <ChromePrompt />
    </div>
  </div>
);
