import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  BellDisabledIcon,
  MagicIcon,
  SettingsIcon,
  TimerIcon,
} from '../../../components/icons';
import type { IconProps } from '../../../components/Icon';
import { IconSize } from '../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface FirstSessionWelcomeProps {
  className?: string;
}

interface Highlight {
  icon: React.ComponentType<IconProps>;
  title: string;
  body: string;
}

// Three quick-value bullets that each map to a top uninstall reason for the
// new tab. Keeping them tight and benefit-first ("less noise" not "zen mode")
// so the user reads value, not feature names.
const HIGHLIGHTS: Highlight[] = [
  {
    icon: BellDisabledIcon,
    title: 'Less noise',
    body: 'Quiet the feed when it gets overwhelming.',
  },
  {
    icon: TimerIcon,
    title: 'Actually focus',
    body: 'Block the feed behind a timer during deep work.',
  },
  {
    icon: SettingsIcon,
    title: 'Yours to shape',
    body: 'Toggle widgets, shortcuts and layout — all reversible.',
  },
];

/**
 * Prominent welcome hero rendered at the top of the Customize sidebar on a
 * brand-new user's very first new tab. This replaces what would otherwise
 * look like a dense settings drawer with an explicit "this panel is yours,
 * here's what it does for you" moment.
 *
 * Copy is tuned to the top uninstall reasons for the new tab (feed is too
 * busy, FOMO/anxiety, productivity-killer, "just make it cleaner") so the
 * user immediately sees the sidebar as the fix, not more clutter.
 *
 * Visually it uses a full-bleed brand gradient (cabbage → bun → onion) with
 * a soft diagonal light so it reads as a hero — the rest of the sidebar
 * keeps its neutral surface, which makes the contrast intentional.
 */
export const FirstSessionWelcome = ({
  className,
}: FirstSessionWelcomeProps): ReactElement => {
  return (
    <section
      aria-labelledby="newtab-welcome-title"
      className={classNames(
        'relative mx-3 mb-1 mt-2 overflow-hidden rounded-16 shadow-2',
        'bg-gradient-to-br from-accent-cabbage-default via-accent-bun-default to-accent-onion-default',
        className,
      )}
    >
      {/* Diagonal light sweep so the gradient feels lit, not flat. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 bg-[radial-gradient(120%_80%_at_10%_0%,rgba(255,255,255,0.35),transparent_55%)]"
      />
      {/* Soft darken at the bottom for copy legibility. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/25 to-transparent"
      />

      <div className="relative flex flex-col gap-3 px-4 pb-4 pt-4">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-10 bg-white/20 text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm"
          >
            <MagicIcon size={IconSize.Small} secondary />
          </span>
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            bold
            className="uppercase tracking-[0.14em] text-white/80"
          >
            Welcome to daily.dev
          </Typography>
        </div>

        <div className="flex flex-col gap-1.5">
          <Typography
            id="newtab-welcome-title"
            tag={TypographyTag.H2}
            type={TypographyType.Title3}
            bold
            className="text-white"
          >
            This new tab is yours to shape.
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            className="text-white/85"
          >
            Too much at once? Take a breath. Pick a mode below and trim
            anything that isn&apos;t helping — nothing here is permanent, and
            the Customize button stays one click away.
          </Typography>
        </div>

        <ul className="mt-1 flex flex-col gap-2">
          {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="flex items-start gap-2.5 rounded-10 bg-white/10 px-2.5 py-2 ring-1 ring-inset ring-white/15"
            >
              <span
                aria-hidden
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-8 bg-white/20 text-white"
              >
                <Icon size={IconSize.Size16} secondary />
              </span>
              <div className="flex min-w-0 flex-col">
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Footnote}
                  bold
                  className="text-white"
                >
                  {title}
                </Typography>
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  className="text-white/80"
                >
                  {body}
                </Typography>
              </div>
            </li>
          ))}
        </ul>

        <Typography
          type={TypographyType.Caption1}
          className="text-white/75"
        >
          Start below with{' '}
          <Typography
            tag={TypographyTag.Span}
            type={TypographyType.Caption1}
            bold
            className="text-white"
          >
            Mode
          </Typography>{' '}
          — the fastest way to set the vibe.
        </Typography>
      </div>
    </section>
  );
};
