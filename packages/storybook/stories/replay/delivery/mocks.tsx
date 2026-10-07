import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import LogoIcon from '@dailydotdev/shared/src/svg/LogoIcon';
import LogoText from '@dailydotdev/shared/src/svg/LogoText';
import type { Candidate } from '../catalog';
import { byId } from '../catalog';
import { FrameStyles, FrameThumb } from '../frames';
import { sampleData } from '../data';
import type { Person } from '../people';
import { Avatar, ME } from '../people';

/** The card that leads the week. Every channel below quotes its claim. */
export const HERO: Candidate = byId('rank.topicReader');
export const HERO_CLAIM = 'Top 2% of Kubernetes readers this week.';
export const WEEK = 'Week 37';

export const Thumb = ({
  id,
  width = 64,
  aspect,
}: {
  id: string;
  width?: number;
  aspect?: '9:16' | '4:5';
}): ReactElement => (
  <>
    <FrameStyles />
    <FrameThumb
      width={width}
      aspect={aspect}
      candidate={byId(id)}
      data={sampleData[id]}
    />
  </>
);

/* -------------------------------------------------------------------------- */
/* In-app notification                                                         */
/* -------------------------------------------------------------------------- */

export const BellButton = ({
  count = 0,
  active = false,
}: {
  count?: number;
  active?: boolean;
}): ReactElement => (
  <span
    className={classNames(
      'relative flex h-10 w-10 items-center justify-center rounded-12 text-text-tertiary',
      active && 'bg-surface-float text-text-primary',
    )}
  >
    <BellIcon secondary={active} />
    {count > 0 && (
      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-[999px] bg-accent-cabbage-default px-1 font-bold text-white typo-caption2">
        {count}
      </span>
    )}
  </span>
);

export enum RowKind {
  Replay = 'replay',
  Streak = 'streak',
  Comment = 'comment',
  System = 'system',
}

const kindHue: Record<RowKind, string> = {
  [RowKind.Replay]: '#CE3DF3',
  [RowKind.Streak]: '#F25D82',
  [RowKind.Comment]: '#4A7EEE',
  [RowKind.System]: '#887BF8',
};

/**
 * The shape of a row in the notification center: unread dot, a 32px lead
 * (avatar or icon on a hue), bold title with plain description, time on the
 * right, and an optional attachment under the text. Mirrors NotificationItem
 * closely enough that a decision made here survives the port.
 */
export const NotificationRow = ({
  kind = RowKind.Replay,
  unread = true,
  title,
  description,
  time = '2m',
  person,
  thumbId,
  action,
}: {
  kind?: RowKind;
  unread?: boolean;
  title: ReactNode;
  description?: ReactNode;
  time?: string;
  person?: Person;
  thumbId?: string;
  action?: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex w-full gap-3 px-4 py-3',
      unread ? 'bg-surface-float' : 'bg-background-default',
    )}
  >
    <span className="mt-1 flex w-2 shrink-0 justify-center">
      {unread && (
        <span className="h-2 w-2 rounded-[999px] bg-accent-cabbage-default" />
      )}
    </span>
    {person ? (
      <Avatar person={person} size={32} />
    ) : (
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-10 text-white"
        style={{ background: kindHue[kind], '--theme-text-primary': '#FFFFFF' } as CSSProperties}
      >
        {kind === RowKind.Replay ? (
          <span className="flex h-5 w-5 items-center justify-center [&_svg]:h-full [&_svg]:w-full">
            <LogoIcon />
          </span>
        ) : (
          <SparkleIcon />
        )}
      </span>
    )}
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-text-primary typo-callout">{title}</span>
      {description && (
        <span className="text-text-tertiary typo-footnote">{description}</span>
      )}
      {thumbId && (
        <span className="mt-1 flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-default p-2">
          <Thumb id={thumbId} width={44} />
          <span className="flex flex-col">
            <span className="font-bold text-text-primary typo-footnote">
              {sampleData[thumbId]?.headline ?? byId(thumbId).headline}
            </span>
            <span className="text-text-quaternary typo-caption2">
              1 of 5 · {WEEK}
            </span>
          </span>
        </span>
      )}
      {action && <span className="mt-1">{action}</span>}
    </span>
    <span className="shrink-0 text-text-quaternary typo-caption1">{time}</span>
  </div>
);

export const NotificationCenter = ({
  children,
  width = 26,
}: {
  children: ReactNode;
  width?: number;
}): ReactElement => (
  <div
    className="flex flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-3"
    style={{ width: `${width}rem`, maxWidth: '100%' }}
  >
    <div className="flex items-center justify-between border-b border-border-subtlest-tertiary px-4 py-3">
      <span className="font-bold text-text-primary typo-body">Notifications</span>
      <span className="text-text-quaternary typo-caption1">Mark all as read</span>
    </div>
    <div className="flex flex-col divide-y divide-border-subtlest-tertiary">
      {children}
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Push, as the OS shows it                                                    */
/* -------------------------------------------------------------------------- */

export enum PushPlatform {
  MacOs = 'macos',
  Ios = 'ios',
}

export const SystemPush = ({
  platform = PushPlatform.MacOs,
  title,
  body,
  time = 'now',
  thumbId,
}: {
  platform?: PushPlatform;
  title: string;
  body: string;
  time?: string;
  thumbId?: string;
}): ReactElement => (
  <div
    className={classNames(
      'flex items-start gap-3 text-left',
      platform === PushPlatform.MacOs
        ? 'w-[22rem] rounded-16 p-3'
        : 'w-[23rem] rounded-[1.4rem] p-3.5',
    )}
    style={{
      background: 'rgba(28, 28, 32, 0.78)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      boxShadow: '0 12px 40px -12px rgba(0,0,0,.6), inset 0 0 0 1px rgba(255,255,255,.08)',
      color: '#fff',
    }}
  >
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-10 [&_svg]:h-6 [&_svg]:w-6"
      style={{ background: '#0E1217', color: '#FFFFFF', '--theme-text-primary': '#FFFFFF', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.12)' } as CSSProperties}
    >
      <LogoIcon />
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-bold typo-footnote">
          {platform === PushPlatform.MacOs ? 'daily.dev' : 'DAILY.DEV'}
        </span>
        <span className="typo-caption2" style={{ color: 'rgba(255,255,255,.55)' }}>
          {time}
        </span>
      </span>
      <span className="font-bold typo-callout">{title}</span>
      <span className="typo-footnote" style={{ color: 'rgba(255,255,255,.8)' }}>
        {body}
      </span>
    </span>
    {thumbId && (
      <span className="shrink-0 overflow-hidden rounded-8">
        <Thumb id={thumbId} width={38} />
      </span>
    )}
  </div>
);

/** The wallpaper the push sits on, so the contrast is judged honestly. */
export const LockScreen = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    className="flex w-[26rem] max-w-full flex-col items-center gap-3 rounded-24 p-6"
    style={{
      background:
        'radial-gradient(120% 90% at 20% 0%, #6D3EF2 0%, #2A0B3D 45%, #0F0F12 100%)',
    }}
  >
    <span className="font-bold typo-mega3" style={{ color: 'rgba(255,255,255,.92)' }}>
      8:02
    </span>
    <span className="-mt-2 typo-footnote" style={{ color: 'rgba(255,255,255,.6)' }}>
      Monday 15 September
    </span>
    <div className="mt-4 flex w-full flex-col items-center gap-2">{children}</div>
  </div>
);

export const Toast = ({
  title,
  cta = 'Open',
}: {
  title: string;
  cta?: string;
}): ReactElement => (
  <div className="flex w-[22rem] max-w-full items-center gap-3 rounded-14 bg-text-primary px-4 py-3 text-surface-invert shadow-3">
    <span
      className="flex h-6 w-6 items-center justify-center [&_svg]:h-full [&_svg]:w-full"
      style={{ '--theme-text-primary': '#CE3DF3' } as CSSProperties}
    >
      <LogoIcon />
    </span>
    <span className="flex-1 font-bold typo-footnote">{title}</span>
    <span className="rounded-8 bg-surface-invert/20 px-2.5 py-1 font-bold typo-caption1">
      {cta}
    </span>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Turning notifications on                                                    */
/* -------------------------------------------------------------------------- */

export enum PromptTone {
  Card = 'card',
  Banner = 'banner',
  Row = 'row',
}

/**
 * The soft ask. daily.dev already has EnableNotification for this pattern;
 * these are the shapes it would take with a Replay source, before the browser
 * prompt is ever triggered.
 */
export const SoftPrompt = ({
  tone = PromptTone.Card,
  headline,
  body,
  primary = 'Notify me on Mondays',
  secondary = 'Not now',
  thumbId,
}: {
  tone?: PromptTone;
  headline: string;
  body?: string;
  primary?: string;
  secondary?: string;
  thumbId?: string;
}): ReactElement => {
  if (tone === PromptTone.Row) {
    return (
      <div className="flex w-[26rem] max-w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 py-3">
        <span className="text-accent-cabbage-default">
          <BellIcon secondary />
        </span>
        <span className="flex flex-1 flex-col">
          <span className="font-bold text-text-primary typo-footnote">{headline}</span>
          {body && <span className="text-text-quaternary typo-caption2">{body}</span>}
        </span>
        <span className="rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-caption1">
          {primary}
        </span>
      </div>
    );
  }

  if (tone === PromptTone.Banner) {
    return (
      <div
        className="flex w-[26rem] max-w-full items-center gap-4 rounded-16 p-4 text-white"
        style={{
          background:
            'linear-gradient(120deg, #2A0B3D 0%, #5A1E75 60%, #CE3DF3 140%)',
        }}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-12 bg-white/15">
          <BellIcon secondary />
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="font-bold typo-callout">{headline}</span>
          {body && <span className="typo-footnote text-white/75">{body}</span>}
        </span>
        <span className="rounded-10 bg-white px-3 py-1.5 font-bold text-[#2A0B3D] typo-caption1">
          {primary}
        </span>
      </div>
    );
  }

  return (
    <div className="flex w-[22rem] max-w-full flex-col items-center gap-4 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-6 text-center">
      {thumbId ? (
        <div className="relative">
          <Thumb id={thumbId} width={96} />
          <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-[999px] bg-accent-cabbage-default text-white shadow-2">
            <BellIcon secondary />
          </span>
        </div>
      ) : (
        <span className="flex h-14 w-14 items-center justify-center rounded-[999px] bg-overlay-float-cabbage text-accent-cabbage-default">
          <BellIcon secondary />
        </span>
      )}
      <div className="flex flex-col gap-1.5">
        <span className="font-bold text-text-primary typo-title3">{headline}</span>
        {body && <span className="text-text-tertiary typo-footnote">{body}</span>}
      </div>
      <div className="flex w-full flex-col gap-2">
        <span className="w-full rounded-12 bg-text-primary py-2.5 font-bold text-surface-invert typo-callout">
          {primary}
        </span>
        <span className="w-full py-1.5 font-bold text-text-tertiary typo-callout">
          {secondary}
        </span>
      </div>
    </div>
  );
};

export enum PermissionState {
  Ask = 'ask',
  Granted = 'granted',
  Denied = 'denied',
}

/** What Chrome puts up when we finally call Notification.requestPermission(). */
export const NativePermission = ({
  state = PermissionState.Ask,
}: {
  state?: PermissionState;
}): ReactElement => (
  <div
    className="w-[22rem] max-w-full rounded-12 p-4 text-left"
    style={{
      background: '#FFFFFF',
      color: '#1F1F1F',
      boxShadow: '0 8px 28px -8px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.08)',
      fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    }}
  >
    <div className="flex items-center gap-2 text-[13px]">
      <span
        className="flex h-5 w-5 items-center justify-center rounded-[999px]"
        style={{ background: '#0E1217', '--theme-text-primary': '#FFFFFF' } as CSSProperties}
      >
        <span className="flex h-3 w-3 [&_svg]:h-full [&_svg]:w-full">
          <LogoIcon />
        </span>
      </span>
      <span className="font-medium">app.daily.dev wants to</span>
    </div>
    <div className="mt-2 flex items-center gap-2 text-[13px]" style={{ color: '#444' }}>
      <BellIcon />
      <span>Show notifications</span>
    </div>
    {state === PermissionState.Ask ? (
      <div className="mt-3 flex justify-end gap-2 text-[13px] font-medium">
        <span className="rounded-[999px] px-3.5 py-1.5" style={{ color: '#0B57D0', background: '#F1F3F4' }}>
          Block
        </span>
        <span className="rounded-[999px] px-3.5 py-1.5 text-white" style={{ background: '#0B57D0' }}>
          Allow
        </span>
      </div>
    ) : (
      <div className="mt-3 text-[13px]" style={{ color: state === PermissionState.Granted ? '#137333' : '#B3261E' }}>
        {state === PermissionState.Granted ? 'Allowed' : 'Blocked'}
      </div>
    )}
  </div>
);

export const SettingsToggle = ({
  label,
  description,
  on = true,
  children,
}: {
  label: string;
  description?: string;
  on?: boolean;
  children?: ReactNode;
}): ReactElement => (
  <div className="flex w-full flex-col gap-2 border-b border-border-subtlest-tertiary py-3 last:border-b-0">
    <div className="flex items-center gap-4">
      <span className="flex flex-1 flex-col">
        <span className="font-bold text-text-primary typo-callout">{label}</span>
        {description && (
          <span className="text-text-tertiary typo-footnote">{description}</span>
        )}
      </span>
      <span
        className={classNames(
          'relative h-6 w-10 shrink-0 rounded-[999px] transition-colors',
          on ? 'bg-accent-cabbage-default' : 'bg-border-subtlest-secondary',
        )}
      >
        <span
          className={classNames(
            'absolute top-0.5 h-5 w-5 rounded-[999px] bg-white shadow-2',
            on ? 'left-[1.125rem]' : 'left-0.5',
          )}
        />
      </span>
    </div>
    {children}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Email                                                                       */
/* -------------------------------------------------------------------------- */

const EMAIL_INK = '#0E1217';
const EMAIL_MUTED = '#6B6F7B';
const EMAIL_HAIRLINE = '#E8E9EE';

/**
 * A 600px email as a mail client shows it: light canvas whatever the app
 * theme, a sender row, the subject and preheader as the inbox truncates them,
 * then the body. Cards inside are pre-rendered images, never live markup.
 */
export const EmailFrame = ({
  subject,
  preheader,
  children,
  compact = false,
}: {
  subject: string;
  preheader: string;
  children: ReactNode;
  compact?: boolean;
}): ReactElement => (
  <div
    className="w-[40rem] max-w-full overflow-hidden rounded-16"
    style={{
      background: '#F4F5F8',
      color: EMAIL_INK,
      '--theme-text-primary': EMAIL_INK,
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      boxShadow: '0 1px 2px rgba(0,0,0,.08), 0 12px 32px -16px rgba(0,0,0,.25)',
    } as CSSProperties}
  >
    <div className="flex flex-col gap-1 border-b px-5 py-3" style={{ borderColor: EMAIL_HAIRLINE, background: '#FFFFFF' }}>
      <div className="flex items-center gap-2 text-[13px]">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-[999px] [&_svg]:h-4 [&_svg]:w-4"
          style={{ background: EMAIL_INK, '--theme-text-primary': '#FFFFFF' } as CSSProperties}
        >
          <LogoIcon />
        </span>
        <span className="font-semibold">daily.dev</span>
        <span style={{ color: EMAIL_MUTED }}>&lt;hi@daily.dev&gt;</span>
        <span className="ml-auto" style={{ color: EMAIL_MUTED }}>Mon 08:02</span>
      </div>
      <div className="text-[15px] font-semibold">{subject}</div>
      <div className="truncate text-[13px]" style={{ color: EMAIL_MUTED }}>
        {preheader}
      </div>
    </div>
    <div className={classNames('mx-auto flex w-full flex-col', compact ? 'gap-4 p-5' : 'gap-5 p-6')} style={{ maxWidth: 600 }}>
      <div className="flex items-center gap-1.5 [&_svg]:h-5">
        <span className="flex h-5 w-5 [&_svg]:h-full [&_svg]:w-full" style={{ color: EMAIL_INK }}>
          <LogoIcon />
        </span>
        <span className="flex h-4 [&_svg]:h-full [&_svg]:w-auto" style={{ color: EMAIL_INK }}>
          <LogoText />
        </span>
        <span className="ml-auto text-[12px] uppercase tracking-[0.12em]" style={{ color: EMAIL_MUTED }}>
          Replay · {WEEK}
        </span>
      </div>
      {children}
      <div className="flex flex-col gap-1 border-t pt-4 text-[12px]" style={{ borderColor: EMAIL_HAIRLINE, color: EMAIL_MUTED }}>
        <span>You get this because Replay emails are on. Turn off Replay emails · Manage all emails</span>
        <span>daily.dev · 2261 Market Street, San Francisco</span>
      </div>
    </div>
  </div>
);

export const EmailHeading = ({ children }: { children: ReactNode }): ReactElement => (
  <h2 className="text-[24px] font-bold leading-[1.15] tracking-[-0.01em]" style={{ color: EMAIL_INK }}>
    {children}
  </h2>
);

export const EmailText = ({ children, muted = false }: { children: ReactNode; muted?: boolean }): ReactElement => (
  <p className="text-[15px] leading-[1.5]" style={{ color: muted ? EMAIL_MUTED : EMAIL_INK }}>
    {children}
  </p>
);

export const EmailButton = ({ children }: { children: ReactNode }): ReactElement => (
  <span
    className="inline-flex w-fit items-center rounded-12 px-5 py-3 text-[15px] font-bold text-white"
    style={{ background: EMAIL_INK }}
  >
    {children}
  </span>
);

export const EmailCardImage = ({
  id,
  width = 300,
  caption,
}: {
  id: string;
  width?: number;
  caption?: string;
}): ReactElement => (
  <div className="flex flex-col items-center gap-2">
    <div className="overflow-hidden rounded-20" style={{ boxShadow: '0 20px 40px -20px rgba(14,18,23,.45)' }}>
      <Thumb id={id} width={width} aspect="4:5" />
    </div>
    {caption && (
      <span className="text-[12px]" style={{ color: EMAIL_MUTED }}>
        {caption}
      </span>
    )}
  </div>
);

/* -------------------------------------------------------------------------- */
/* Timeline                                                                    */
/* -------------------------------------------------------------------------- */

export interface TimelineStep {
  when: string;
  channel: string;
  what: string;
  hue?: string;
}

export const Timeline = ({ steps }: { steps: TimelineStep[] }): ReactElement => (
  <div className="flex w-full flex-col gap-0 overflow-x-auto pb-2">
    <div className="flex min-w-[52rem] items-stretch gap-3">
      {steps.map((step, index) => (
        <div key={step.when + step.channel} className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 shrink-0 rounded-[999px]"
              style={{ background: step.hue ?? '#CE3DF3' }}
            />
            {index < steps.length - 1 && (
              <span className="h-px flex-1 bg-border-subtlest-secondary" />
            )}
          </div>
          <span className="font-mono uppercase tracking-[0.1em] text-text-quaternary typo-caption2">
            {step.when}
          </span>
          <span className="font-bold text-text-primary typo-footnote">{step.channel}</span>
          <span className="text-text-tertiary typo-caption1">{step.what}</span>
        </div>
      ))}
    </div>
  </div>
);

/** A labelled variant in a row of variants. */
export const Variant = ({
  label,
  note,
  tag,
  children,
  width,
}: {
  label: string;
  note?: ReactNode;
  tag?: 'recommended' | 'fallback' | 'rejected';
  children: ReactNode;
  width?: number | string;
}): ReactElement => (
  <figure className="flex flex-col gap-3" style={{ width: width ?? 'auto', maxWidth: '100%' } as CSSProperties}>
    <div>{children}</div>
    <figcaption className="flex flex-col gap-1">
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-bold text-text-primary typo-callout">{label}</span>
        {tag && (
          <span
            className={classNames(
              'rounded-6 px-1.5 py-0.5 font-mono uppercase tracking-[0.08em] typo-caption2',
              tag === 'recommended' && 'bg-accent-cabbage-default text-white',
              tag === 'fallback' && 'bg-surface-hover text-text-tertiary',
              tag === 'rejected' && 'border border-dashed border-border-subtlest-secondary text-text-quaternary',
            )}
          >
            {tag}
          </span>
        )}
      </span>
      {note && <span className="max-w-[36ch] text-text-tertiary typo-footnote">{note}</span>}
    </figcaption>
  </figure>
);

export { ME };
