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

export const AVATAR =
  'https://res.cloudinary.com/daily-now/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile';

/* ------------------------------------------------------------------ prose */

const H1 = ({ children }: { children: React.ReactNode }) => (
  <h1 className="font-bold text-text-primary typo-mega3">{children}</h1>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="max-w-[54rem] text-text-secondary typo-body">{children}</p>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="max-w-[54rem] rounded-12 border border-border-subtlest-tertiary bg-surface-float p-4 text-text-secondary typo-callout">
    {children}
  </p>
);

/* ---------------------------------------------------------------- controls */

type LeadAction = 'Link' | 'Share to' | 'Snapshot';

const ICONS: Record<LeadAction, React.ReactElement> = {
  Link: <LinkIcon />,
  'Share to': <ShareIcon />,
  Snapshot: <SnapshotIcon />,
};

const LABELS: Record<LeadAction, string> = {
  Link: 'Copy link',
  'Share to': 'Share',
  Snapshot: 'Snapshot',
};

/**
 * Inert on purpose: this page compares where a control sits inside a real
 * screen. The working buttons and live capture are on the profile itself.
 */
export const Control = ({
  action,
  className,
  label,
  size = ButtonSize.Small,
  variant = ButtonVariant.Tertiary,
}: {
  action: LeadAction;
  className?: string;
  label?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) => (
  <Button
    aria-label={LABELS[action]}
    className={className}
    icon={ICONS[action]}
    size={size}
    variant={variant}
  >
    {label ? LABELS[action] : undefined}
  </Button>
);

/* ---------------------------------------------------------- page furniture */

/**
 * A real context menu. Every production menu in the product leads with a
 * share item — "Share via" on posts and squads, "Share" on profiles and
 * tags — and none of them offers "Copy link" directly, so the items are
 * passed in rather than invented.
 */
export const OverflowMenu = ({
  items,
  highlight,
  className,
}: {
  items: string[];
  /** The share item, whatever this surface actually calls it. */
  highlight?: string;
  className?: string;
}) => (
  <div
    className={`absolute z-20 flex w-56 flex-col rounded-12 border border-border-subtlest-tertiary bg-background-popover p-1 shadow-2 ${
      className ?? 'right-3 top-10'
    }`}
  >
    {items.map((item) => {
      const isShare = item === highlight;

      return (
        <span
          key={item}
          className={`flex items-center gap-3 rounded-8 px-3 py-2 typo-callout ${
            isShare
              ? 'bg-surface-float font-bold text-text-primary'
              : 'text-text-tertiary'
          }`}
        >
          {isShare && <ShareIcon />}
          {item}
        </span>
      );
    })}
  </div>
);

export type DeviceName = 'Desktop' | 'Tablet' | 'Mobile';

const DEVICES: Record<
  DeviceName,
  { width: number; viewport: string }
> = {
  Desktop: { width: 680, viewport: '1020px and up' },
  Tablet: { width: 560, viewport: '768px' },
  Mobile: { width: 375, viewport: '375px' },
};

/** A surface drawn at one real viewport width, so density is comparable. */
export const Device = ({
  name,
  children,
  height,
}: {
  name: DeviceName;
  children: React.ReactNode;
  /** Mobile surfaces pin a floating bar, so the frame needs a known height. */
  height?: number;
}) => (
  <div className="flex shrink-0 flex-col gap-2">
    <span className="font-bold uppercase text-text-quaternary typo-caption2">
      {name} · {DEVICES[name].viewport}
    </span>
    <div
      className="relative shrink-0 overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
      style={{ width: DEVICES[name].width, height }}
    >
      {children}
    </div>
  </div>
);

/** Devices sit in a scroller rather than wrapping, so widths stay honest. */
export const Rail = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-full items-start gap-6 overflow-x-auto pb-3">
    {children}
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
  // Full width so a device rail can scroll across the whole canvas.
  <div className="flex w-full flex-col gap-3">
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
    <div className="flex flex-col gap-10">{children}</div>
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
