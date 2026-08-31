import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  LinkIcon,
  ShareIcon,
  SnapshotIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { LeadAction } from './sharingMap';

export const AVATAR =
  'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile';

export const ART =
  'https://media.daily.dev/image/upload/s--_MjhSTze--/q_auto/v1773608417/achievements/cant_spend_it_all';

/* ------------------------------------------------------------------ prose */

export const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1 className="font-bold text-text-primary typo-mega3">{children}</h1>
);

export const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="font-bold text-text-primary typo-title1">{children}</h2>
);

export const P = ({ children }: { children: React.ReactNode }) => (
  <p className="max-w-[54rem] text-text-secondary typo-body">{children}</p>
);

export const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="max-w-[54rem] rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-callout">
    {children}
  </p>
);

/* ---------------------------------------------------------------- controls */

export const ICONS: Record<LeadAction, React.ReactElement> = {
  Link: <LinkIcon />,
  'Share to': <ShareIcon />,
  Snapshot: <SnapshotIcon />,
};

export const LABELS: Record<LeadAction, string> = {
  Link: 'Copy link',
  'Share to': 'Share',
  Snapshot: 'Snapshot',
};

/**
 * Inert on purpose: this page compares where a control sits inside a real
 * screen. The working buttons and live capture are on Button placements.
 */
export const Control = ({
  action,
  label,
  size = ButtonSize.Small,
  variant = ButtonVariant.Tertiary,
}: {
  action: LeadAction;
  label?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) => (
  <Button
    aria-label={LABELS[action]}
    icon={ICONS[action]}
    size={size}
    variant={variant}
  >
    {label ? LABELS[action] : undefined}
  </Button>
);

/* ---------------------------------------------------------- page furniture */

/** The frame every surface is drawn inside, so variants compare like for like. */
export const Screen = ({
  children,
  width = 'w-[26rem]',
}: {
  children: React.ReactNode;
  width?: string;
}) => (
  <div
    className={`${width} shrink-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default`}
  >
    {children}
  </div>
);

export const OverflowMenu = ({ action }: { action: LeadAction }) => (
  <div className="absolute right-3 top-10 z-10 flex w-52 flex-col rounded-12 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2">
    {['Report post', 'Hide'].map((item) => (
      <span key={item} className="px-3 py-2 text-text-tertiary typo-callout">
        {item}
      </span>
    ))}
    <span className="flex items-center gap-2 rounded-8 bg-surface-float px-3 py-2 text-text-primary typo-callout">
      {ICONS[action]}
      {LABELS[action]}
    </span>
  </div>
);

export const Variant = ({
  step,
  headline,
  note,
  children,
}: {
  step: string;
  headline: string;
  note: string;
  children: React.ReactNode;
}) => (
  <div className="flex w-[26rem] shrink-0 flex-col gap-3">
    <div className="flex flex-col gap-1">
      <span className="font-bold uppercase text-text-quaternary typo-caption2">
        {step}
      </span>
      <span className="font-bold text-text-primary typo-callout">
        {headline}
      </span>
      <span className="text-text-tertiary typo-footnote">{note}</span>
    </div>
    {children}
  </div>
);

export const Category = ({
  title,
  covers,
  verdict,
  children,
}: {
  title: string;
  covers: string;
  verdict: string;
  children: React.ReactNode;
}) => (
  <section className="flex flex-col gap-6 border-t border-border-subtlest-tertiary pt-10">
    <div className="flex flex-col gap-2">
      <h2 className="font-bold text-text-primary typo-mega3">{title}</h2>
      <span className="text-text-tertiary typo-footnote">{covers}</span>
      <p className="max-w-[54rem] text-text-secondary typo-callout">
        {verdict}
      </p>
    </div>
    <div className="flex flex-wrap items-start gap-8">{children}</div>
  </section>
);

/** Every category page opens with the same header, so they read as a set. */
export const SurfacePage = ({
  title,
  intro,
  map,
  children,
}: {
  title: string;
  intro: string;
  map: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-6 p-8">
    <div className="flex flex-col gap-3">
      <H1>{title}</H1>
      <P>{intro}</P>
      <Note>{map}</Note>
    </div>
    {children}
  </div>
);
