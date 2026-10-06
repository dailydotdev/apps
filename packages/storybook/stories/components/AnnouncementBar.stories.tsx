import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PromotionalBannerView } from '@dailydotdev/shared/src/components/PromotionalBanner';
import type {
  Banner,
  BannerTheme,
} from '@dailydotdev/shared/src/graphql/banner';
import { BannerCustomTheme } from '@dailydotdev/shared/src/graphql/banner';
import { Theme } from '@dailydotdev/shared/src/components/utilities';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import colors from '@dailydotdev/shared/tailwind/colors';

// ---------------------------------------------------------------------------
// The announcement bar (`PromotionalBanner`) is the backend-configured strip
// above the header: title, subtitle, CTA and one of the themes below come
// from the `banner` query. On laptop it is a fixed 32px row; below that it
// stacks and the X sits in the top-right corner.
//
// Community feedback on the "How much do you know Meta" campaign was that the
// X is hard to see. This page lays out every theme, the shipped look next to
// the proposed one, with measured contrast so each change can be judged.
// ---------------------------------------------------------------------------

type ThemeEntry = {
  theme: BannerTheme;
  label: string;
  isNew?: boolean;
  note: string;
};

const themes: ThemeEntry[] = [
  {
    theme: BannerCustomTheme.CabbageOnion,
    label: 'cabbage-onion (default)',
    note: 'Moved from the -default to the -subtler shades with flipping ink: dark text on a lighter gradient in dark theme, white on a deeper one in light theme. At -default no ink passed AA at both ends in dark theme. White button in both modes (6.3 against the cabbage end in light mode).',
  },
  {
    theme: BannerCustomTheme.WhitePepper,
    label: 'white-pepper',
    note: 'CTA is the neutral primary of the opposite theme: dark button on the white bar in dark mode, white button on the dark bar in light mode. Was the cabbage brand button.',
  },
  {
    theme: Theme.Avocado,
    label: 'avocado',
    note: 'Ink unchanged. CTA follows the app theme: white in dark mode, dark in light mode (white would be 2.0 against the fill there).',
  },
  {
    theme: Theme.Bacon,
    label: 'bacon',
    note: 'Proposed: dark ink. White text was 3.2:1 in dark theme; the button system already puts a dark label on bacon fills. CTA follows the app theme, matching the dark text in light mode.',
  },
  {
    theme: Theme.BlueCheese,
    label: 'blue-cheese',
    note: 'Ink unchanged. CTA follows the app theme (white would be 2.1 in light mode).',
  },
  {
    theme: Theme.Bun,
    label: 'bun',
    note: 'Proposed: dark ink. White text was 2.2:1 in dark theme, the worst pair on the list; the button system already puts a dark label on bun fills. CTA follows the app theme (white would be 2.9 in light mode).',
  },
  {
    theme: Theme.Burger,
    label: 'burger',
    note: 'Unchanged ink: white passes in both themes (4.6 / 6.3). White button in both modes.',
  },
  {
    theme: Theme.Cabbage,
    label: 'cabbage',
    note: 'Flipping ink: dark text in dark theme, white in light. White text was 3.8:1 in dark theme and no dark-theme shade of cabbage reaches 4.5 with white; dark text on -default does (4.9). White button in both modes (4.9 in light).',
  },
  {
    theme: Theme.Cheese,
    label: 'cheese',
    note: 'Ink unchanged. CTA follows the app theme (white would be 1.4 in light mode).',
  },
  {
    theme: Theme.Ketchup,
    label: 'ketchup',
    note: 'Flipping ink, same reasoning as cabbage: white text was 3.9:1 in dark theme; dark text on -default is 4.8. White button in both modes (5.1 in light).',
  },
  {
    theme: Theme.Lettuce,
    label: 'lettuce',
    note: 'Ink unchanged. CTA follows the app theme (white would be 1.5 in light mode).',
  },
  {
    theme: Theme.Onion,
    label: 'onion',
    isNew: true,
    note: 'New. White ink passes in both themes (5.2 / 7.1), the strongest of the saturated set. White button in both modes.',
  },
  {
    theme: Theme.Water,
    label: 'water',
    isNew: true,
    note: 'New. Flipping ink like cabbage: white would be 3.8:1 in dark theme, dark text on -default is 4.9; light theme keeps white at 5.1. White button in both modes.',
  },
  {
    theme: Theme.Salt,
    label: 'salt',
    isNew: true,
    note: 'New neutral that stands out from the app: light gray in dark theme, dark gray in light theme, like white-pepper but softer, and the CTA inverts the same way.',
  },
  {
    theme: Theme.Pepper,
    label: 'pepper',
    isNew: true,
    note: 'New neutral that sits in the theme: dark gray on the dark app, light gray on the light one, with the theme text color and the plain primary button.',
  },
  {
    theme: Theme.Background,
    label: 'background',
    isNew: true,
    note: 'New. Painted in the app background with the theme text and primary button, so it reads as part of the page rather than a strip. No hairline; the header below carries its own border.',
  },
];

const baseBanner: Banner = {
  timestamp: '2026-09-16T00:00:00.000Z',
  theme: BannerCustomTheme.CabbageOnion,
  title: 'How much do you know Meta?',
  subtitle: 'Take the 2-minute quiz and win a swag pack.',
  cta: 'Take the quiz',
  url: 'https://daily.dev',
};

const copy: { name: string; note: string; banner: Banner }[] = [
  {
    name: 'Typical',
    note: 'The Meta campaign the feedback came from.',
    banner: baseBanner,
  },
  {
    name: 'Short',
    note: 'Three words and a one-word CTA.',
    banner: {
      ...baseBanner,
      title: 'New:',
      subtitle: 'Dark mode.',
      cta: 'Try',
    },
  },
  {
    name: 'No subtitle',
    note: 'Title only; the subtitle field left empty in the admin.',
    banner: {
      ...baseBanner,
      title: 'daily.dev Hackathon is live',
      subtitle: '',
    },
  },
  {
    name: 'Long title',
    note: 'The bold part wraps before the subtitle.',
    banner: {
      ...baseBanner,
      title:
        'Introducing daily.dev Plus, the all-in-one membership for developers who want to read smarter',
      subtitle: 'Try it free for 30 days.',
      cta: 'Start trial',
    },
  },
  {
    name: 'Long subtitle',
    note: 'Bold lead-in with a full sentence after it.',
    banner: {
      ...baseBanner,
      title: 'Plus is here.',
      subtitle:
        'Get the full picture on every post with AI summaries, an ad-free feed, custom feeds for every topic you follow, and early access to what we ship next.',
      cta: 'Learn more',
    },
  },
  {
    name: 'Long CTA',
    note: 'The button label at the length campaigns tend to reach.',
    banner: {
      ...baseBanner,
      cta: 'Claim your 30-day free trial now',
    },
  },
  {
    name: 'Everything long',
    note: 'Worst case: every field at its longest.',
    banner: {
      ...baseBanner,
      title:
        'Introducing daily.dev Plus, the all-in-one membership for developers who want to read smarter',
      subtitle:
        'Get the full picture on every post with AI summaries, an ad-free feed, custom feeds for every topic you follow, and early access to what we ship next.',
      cta: 'Claim your 30-day free trial now',
    },
  },
];

// The real bar pins itself to the top of the viewport on laptop; on the
// canvas it stays in flow so every variant can be laid out down the page.
const Bar = ({
  banner,
  onDismiss,
}: {
  banner: Banner;
  onDismiss?: () => void;
}): ReactElement => (
  <PromotionalBannerView
    banner={banner}
    onDismiss={onDismiss}
    className="laptop:!relative"
  />
);

// ---------------------------------------------------------------------------
// The bar as it ships today, reproduced for side-by-side review: white text
// on bun and bacon, the theme's primary button (so white on a white bar in
// dark theme), the cabbage brand button on white-pepper, and an X in the
// theme's neutral text color.
// ---------------------------------------------------------------------------

const shippedClassNames: Partial<Record<BannerTheme, [string, string]>> = {
  [BannerCustomTheme.CabbageOnion]: [
    'from-accent-cabbage-default to-accent-onion-default bg-gradient-to-r',
    'text-white',
  ],
  [BannerCustomTheme.WhitePepper]: [
    'bg-surface-primary',
    'text-surface-invert',
  ],
  [Theme.Avocado]: ['bg-accent-avocado-default', 'text-raw-pepper-90'],
  [Theme.Bacon]: ['bg-accent-bacon-default', 'text-white'],
  [Theme.BlueCheese]: ['bg-accent-blueCheese-default', 'text-raw-pepper-90'],
  [Theme.Bun]: ['bg-accent-bun-default', 'text-white'],
  [Theme.Burger]: ['bg-accent-burger-default', 'text-white'],
  [Theme.Cabbage]: ['bg-accent-cabbage-default', 'text-white'],
  [Theme.Cheese]: ['bg-accent-cheese-default', 'text-raw-pepper-90'],
  [Theme.Ketchup]: ['bg-accent-ketchup-default', 'text-white'],
  [Theme.Lettuce]: ['bg-accent-lettuce-default', 'text-raw-pepper-90'],
};

const ShippedBar = ({ banner }: { banner: Banner }): ReactElement | null => {
  const entry = shippedClassNames[banner.theme];
  if (!entry) {
    return null;
  }
  const [container, text] = entry;
  return (
    <div
      className={classNames(
        'relative z-3 flex w-full flex-col items-start py-3 pl-3 pr-12 typo-footnote tablet:pl-20 laptop:h-8 laptop:flex-row laptop:items-center laptop:justify-center laptop:p-0',
        container,
        text,
      )}
    >
      <div>
        <strong>{banner.title}</strong>
        <span className="ml-0.5">{banner.subtitle}</span>
      </div>
      <Button
        tag="a"
        href={banner.url}
        size={ButtonSize.XSmall}
        variant={ButtonVariant.Primary}
        color={
          banner.theme === BannerCustomTheme.WhitePepper
            ? ButtonColor.Cabbage
            : undefined
        }
        className="mt-2 laptop:ml-4 laptop:mt-0"
      >
        {banner.cta}
      </Button>
      <CloseButton
        size={ButtonSize.XSmall}
        className="absolute right-2 top-2 laptop:inset-y-0 laptop:my-auto"
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Contrast, measured from the palette the fills resolve to: `-default` accent
// tokens are the 40 shade in dark theme and the 60 shade in light theme.
// ---------------------------------------------------------------------------

type CanvasTheme = 'light' | 'dark';

const palette = colors as Record<string, Record<string, string>>;
const WHITE = '#FFFFFF';
const PEPPER = palette.pepper['90'];

const luminance = (hex: string): number => {
  const channel = (c: number): number =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const [r, g, b] = [1, 3, 5].map((i) =>
    channel(parseInt(hex.slice(i, i + 2), 16) / 255),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// A gradient is measured at both ends and the worse one is reported.
type Swatch = { fills: string[]; ink: string; cta: string };

// What each theme resolves to per app theme: bar fill, text ink, CTA fill.
// The CTA is the theme's primary (white in dark, dark in light) on dark-ink
// fills, always white on white-ink fills, and inverted on the neutral fills
// that flip with the theme.
const resolve = (theme: BannerTheme, mode: CanvasTheme): Swatch => {
  const shade = mode === 'dark' ? '40' : '60';
  const themeCta = mode === 'dark' ? WHITE : PEPPER;
  const invertedCta = mode === 'dark' ? PEPPER : WHITE;
  const white = (name: string): Swatch => ({
    fills: [palette[name][shade]],
    ink: WHITE,
    cta: WHITE,
  });
  const pepper = (name: string): Swatch => ({
    fills: [palette[name][shade]],
    ink: PEPPER,
    cta: themeCta,
  });
  // Flipping ink: dark text in dark theme, white in light theme.
  const invert = (fills: string[], cta = WHITE): Swatch =>
    mode === 'dark' ? { fills, ink: PEPPER, cta } : { fills, ink: WHITE, cta };
  switch (theme) {
    case BannerCustomTheme.CabbageOnion: {
      const subtler = mode === 'dark' ? '20' : '80';
      return invert([palette.cabbage[subtler], palette.onion[subtler]]);
    }
    case BannerCustomTheme.WhitePepper:
      return invert([mode === 'dark' ? WHITE : PEPPER], invertedCta);
    case Theme.Salt:
      return invert(
        [mode === 'dark' ? palette.salt['90'] : palette.pepper['10']],
        invertedCta,
      );
    case Theme.Cabbage:
    case Theme.Ketchup:
    case Theme.Water:
      return invert([palette[theme][shade]]);
    case Theme.Pepper:
      return mode === 'dark'
        ? { fills: [palette.pepper['10']], ink: WHITE, cta: themeCta }
        : { fills: [palette.salt['90']], ink: PEPPER, cta: themeCta };
    case Theme.Background:
      return mode === 'dark'
        ? { fills: [PEPPER], ink: WHITE, cta: themeCta }
        : { fills: [WHITE], ink: PEPPER, cta: themeCta };
    case Theme.BlueCheese:
      return pepper('blueCheese');
    case Theme.Avocado:
    case Theme.Cheese:
    case Theme.Lettuce:
    case Theme.Bun:
    case Theme.Bacon:
      return pepper(theme);
    default:
      return white(theme);
  }
};

// The shipped bar: `-default` fills everywhere, white ink on every saturated
// fill, the app theme's primary button, the cabbage brand button on
// white-pepper.
const resolveShipped = (
  theme: BannerTheme,
  mode: CanvasTheme,
): Swatch | null => {
  if (!shippedClassNames[theme]) {
    return null;
  }
  const shade = mode === 'dark' ? '40' : '60';
  const themeCta = mode === 'dark' ? WHITE : PEPPER;
  switch (theme) {
    case BannerCustomTheme.CabbageOnion:
      return {
        fills: [palette.cabbage[shade], palette.onion[shade]],
        ink: WHITE,
        cta: themeCta,
      };
    case BannerCustomTheme.WhitePepper:
      return { ...resolve(theme, mode), cta: palette.cabbage[shade] };
    case Theme.Bun:
    case Theme.Bacon:
    case Theme.Cabbage:
    case Theme.Ketchup:
    case Theme.Water:
      return { fills: [palette[theme][shade]], ink: WHITE, cta: themeCta };
    default:
      return { ...resolve(theme, mode), cta: themeCta };
  }
};

const worst = (fills: string[], against: string): number =>
  Math.min(...fills.map((fill) => contrast(fill, against)));

const Ratio = ({ value }: { value: number }) => (
  <span
    className={classNames(
      'tabular-nums',
      value < 3 && 'text-status-error',
      value >= 3 && value < 4.5 && 'text-status-warning',
      value >= 4.5 && 'text-status-success',
    )}
  >
    {value.toFixed(1)}:1
  </span>
);

const Pair = ({
  label,
  before,
  after,
}: {
  label: string;
  before?: number;
  after: number;
}): ReactElement => (
  <span className="flex items-center gap-1">
    <span>{label}</span>
    {before !== undefined && before.toFixed(1) !== after.toFixed(1) && (
      <>
        <Ratio value={before} />
        <span>→</span>
      </>
    )}
    <Ratio value={after} />
  </span>
);

const Contrast = ({
  theme,
  mode,
}: {
  theme: BannerTheme;
  mode: CanvasTheme;
}): ReactElement => {
  const now = resolve(theme, mode);
  const was = resolveShipped(theme, mode);
  return (
    <div className="flex gap-4 text-text-quaternary typo-caption1">
      <Pair
        label="text"
        before={was ? worst(was.fills, was.ink) : undefined}
        after={worst(now.fills, now.ink)}
      />
      <Pair
        label="button"
        before={was ? worst(was.fills, was.cta) : undefined}
        after={worst(now.fills, now.cta)}
      />
    </div>
  );
};

const useAmbientTheme = (): CanvasTheme => {
  const read = (): CanvasTheme =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('light')
      ? 'light'
      : 'dark';
  const [theme, setTheme] = useState<CanvasTheme>(read);

  useEffect(() => {
    setTheme(read());
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
};

const ThemePanel = ({
  theme,
  ambient,
  children,
}: {
  theme: CanvasTheme;
  ambient: CanvasTheme;
  children: ReactNode;
}): ReactElement => (
  <div className={classNames('min-w-0 flex-1', theme !== ambient && 'invert')}>
    <div className="flex h-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 text-text-primary">
      <span className="font-bold uppercase text-text-quaternary typo-caption2">
        {theme === 'dark' ? 'Dark theme' : 'Light theme'}
      </span>
      {children}
    </div>
  </div>
);

const BothThemes = ({
  children,
}: {
  children: (theme: CanvasTheme) => ReactNode;
}): ReactElement => {
  const ambient = useAmbientTheme();
  return (
    <div className="flex w-full flex-col gap-4 laptopL:flex-row">
      <ThemePanel theme="dark" ambient={ambient}>
        {children('dark')}
      </ThemePanel>
      <ThemePanel theme="light" ambient={ambient}>
        {children('light')}
      </ThemePanel>
    </div>
  );
};

const Labeled = ({
  label,
  note,
  tag,
  children,
}: {
  label: string;
  note?: string;
  tag?: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-col">
      <span className="flex items-center gap-2 font-bold text-text-secondary typo-footnote">
        {label}
        {tag && (
          <span className="rounded-6 bg-surface-float px-1.5 py-0.5 font-normal uppercase text-text-quaternary typo-caption2">
            {tag}
          </span>
        )}
      </span>
      {note && (
        <span className="text-text-quaternary typo-caption1">{note}</span>
      )}
    </div>
    {children}
  </div>
);

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <h2 className="font-bold typo-title3">{title}</h2>
      {description && (
        <p className="max-w-[48rem] text-text-tertiary typo-callout">
          {description}
        </p>
      )}
    </div>
    {children}
  </section>
);

const Page = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex flex-col gap-10 bg-background-default p-6 text-text-primary">
    {children}
  </div>
);

const meta: Meta = {
  title: 'Components/Announcement bar',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The backend-configured announcement strip above the header. Every theme, copy length and viewport is laid out here for review, shipped next to proposed, with measured contrast.',
      },
    },
  },
};

export default meta;

export const Brief: StoryObj = {
  name: '0. Brief',
  render: () => (
    <Page>
      <div className="flex max-w-[48rem] flex-col gap-4 typo-callout">
        <h2 className="font-bold typo-title2">Announcement bar</h2>
        <p className="text-text-tertiary">
          The strip above the header. Copy, CTA and theme are set in the admin
          (the <code>banner</code> query); the frontend only paints it. On
          laptop it is a fixed 32px single row; on tablet and phone it stacks
          the CTA under the copy and pins the X to the top-right corner.
        </p>
        <div className="flex flex-col gap-2">
          <span className="font-bold">What changed</span>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-text-tertiary">
            <li>
              <strong>X.</strong> It took the theme&apos;s neutral text color,
              tuned for app surfaces, and disappeared on saturated and white
              fills. It now takes the bar&apos;s own text color on every theme.
            </li>
            <li>
              <strong>CTA.</strong> White in dark mode on every bar. In light
              mode it stays white on the bars whose text is white (the purples,
              blue, red, brown) and goes dark on the pale bars whose text is
              dark. The two neutral fills that flip with the theme (white-pepper
              and salt) invert it so it never matches the bar. No more
              brand-colored button on white-pepper.
            </li>
            <li>
              <strong>Ink.</strong> Bun and bacon move to dark text, matching
              the label the button system already uses on those fills.
            </li>
            <li>
              <strong>Five new themes.</strong> onion, water, two neutrals (salt
              and pepper), and background, which paints the bar in the page
              background.
            </li>
            <li>
              <strong>Sizing.</strong> Below laptop the CTA and X are 32px
              instead of 24px, a real space separates title from subtitle so
              phones can break the line there, and on laptop long copy truncates
              instead of running off-screen.
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold">Contrast policy</span>
          <p className="text-text-tertiary">
            The copy is 13px, which WCAG treats as normal text, so every theme
            is held to AA: 4.5:1 for the text and the button label, 3:1 for the
            X and the button against the bar. Fills use the semantic accent
            tokens (<code>-default</code> is shade 40 in dark theme and 60 in
            light), and where white text cannot reach 4.5 on a ramp in dark
            theme the bar flips to dark text there, the same call the button
            system makes for those ramps.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold">How to review</span>
          <ul className="flex list-disc flex-col gap-1 pl-4 text-text-tertiary">
            <li>
              <strong>1. Before and after</strong> puts the shipped bar above
              the proposed one for every theme, in both app themes, with
              measured text and button contrast (red under 3:1, amber under
              4.5:1).
            </li>
            <li>
              <strong>2. All themes</strong> is the proposed set on its own.
            </li>
            <li>
              <strong>3. Copy lengths</strong> runs the bar through short,
              typical and worst-case copy.
            </li>
            <li>
              <strong>4. Phone</strong> and <strong>5. Laptop</strong> open the
              canvas at those viewports, since the bar changes layout on the
              laptop breakpoint (1020px).
            </li>
            <li>
              <strong>6. Playground</strong> is a single bar with controls for
              theme and copy.
            </li>
          </ul>
        </div>
        <Bar banner={baseBanner} />
      </div>
    </Page>
  ),
};

export const BeforeAfter: StoryObj = {
  name: '1. Before and after',
  render: () => (
    <Page>
      <Section
        title="Shipped vs proposed"
        description="Top bar in each pair is the bar before #6672, bottom is the current one. Ratios are measured against the palette shade the fill resolves to in that theme. Hover the X and the CTA to check the tints."
      >
        <BothThemes>
          {(mode) => (
            <div className="flex flex-col gap-6">
              {themes.map(({ theme, label, note, isNew }) => (
                <Labeled
                  key={theme}
                  label={label}
                  note={note}
                  tag={isNew ? 'new' : undefined}
                >
                  <div className="flex flex-col gap-1">
                    <ShippedBar banner={{ ...baseBanner, theme }} />
                    <Bar banner={{ ...baseBanner, theme }} />
                  </div>
                  <Contrast theme={theme} mode={mode} />
                </Labeled>
              ))}
            </div>
          )}
        </BothThemes>
      </Section>
    </Page>
  ),
};

export const AllThemes: StoryObj = {
  name: '2. All themes',
  render: () => (
    <Page>
      <Section
        title="Every theme"
        description="One bar per theme key the admin can pick. The theme field is a free string on the backend; anything unknown falls back to cabbage-onion."
      >
        <BothThemes>
          {() => (
            <div className="flex flex-col gap-4">
              {themes.map(({ theme, label, isNew }) => (
                <Labeled
                  key={theme}
                  label={label}
                  tag={isNew ? 'new' : undefined}
                >
                  <Bar banner={{ ...baseBanner, theme }} />
                </Labeled>
              ))}
            </div>
          )}
        </BothThemes>
      </Section>
    </Page>
  ),
};

export const CopyLengths: StoryObj = {
  name: '3. Copy lengths',
  render: () => (
    <Page>
      <Section
        title="Copy lengths"
        description="The same bar through every copy length the admin can realistically enter. Resize the canvas or open the phone and laptop stories to see how each wraps."
      >
        <BothThemes>
          {() => (
            <div className="flex flex-col gap-4">
              {copy.map(({ name, note, banner }) => (
                <Labeled key={name} label={name} note={note}>
                  <Bar banner={banner} />
                </Labeled>
              ))}
            </div>
          )}
        </BothThemes>
      </Section>
      <Section
        title="Long copy on dark-ink themes"
        description="The pale fills, where the dark CTA and X sit on the brightest backgrounds."
      >
        <BothThemes>
          {() => (
            <div className="flex flex-col gap-4">
              {[Theme.Avocado, Theme.Cheese, Theme.Bun, Theme.Salt].map(
                (theme) => (
                  <Labeled key={theme} label={theme}>
                    <Bar banner={{ ...copy[6].banner, theme }} />
                  </Labeled>
                ),
              )}
            </div>
          )}
        </BothThemes>
      </Section>
    </Page>
  ),
};

const Stack = (): ReactElement => (
  <div className="flex flex-col gap-6 bg-background-default p-4 text-text-primary">
    <Section title="Themes">
      <div className="flex flex-col gap-3">
        {themes.map(({ theme, label, isNew }) => (
          <Labeled key={theme} label={label} tag={isNew ? 'new' : undefined}>
            <Bar banner={{ ...baseBanner, theme }} />
          </Labeled>
        ))}
      </div>
    </Section>
    <Section title="Copy lengths">
      <div className="flex flex-col gap-3">
        {copy.map(({ name, note, banner }) => (
          <Labeled key={name} label={name} note={note}>
            <Bar banner={banner} />
          </Labeled>
        ))}
      </div>
    </Section>
  </div>
);

export const Phone: StoryObj = {
  name: '4. Phone',
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: {
    docs: {
      description: {
        story:
          'The stacked layout: copy, CTA underneath, X pinned top-right. Use the theme toggle in the toolbar to flip light and dark.',
      },
    },
  },
  render: () => <Stack />,
};

export const Laptop: StoryObj = {
  name: '5. Laptop',
  globals: { viewport: { value: 'reset', isRotated: false } },
  parameters: {
    docs: {
      description: {
        story:
          'The single fixed 32px row. Copy that does not fit truncates with an ellipsis and the CTA and X stay in view; it used to spill past both edges of the viewport at the narrow end of the breakpoint (1020px).',
      },
    },
  },
  render: () => <Stack />,
};

type PlaygroundArgs = {
  theme: BannerTheme;
  title: string;
  subtitle: string;
  cta: string;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  name: '6. Playground',
  args: {
    theme: baseBanner.theme,
    title: baseBanner.title,
    subtitle: baseBanner.subtitle,
    cta: baseBanner.cta,
  },
  argTypes: {
    theme: {
      control: 'select',
      options: themes.map(({ theme }) => theme),
    },
  },
  render: (args) => {
    const [dismissed, setDismissed] = useState(false);
    return (
      <Page>
        {dismissed ? (
          <button
            type="button"
            className="self-start text-text-link typo-callout"
            onClick={() => setDismissed(false)}
          >
            Bring the bar back
          </button>
        ) : (
          <Bar
            banner={{ ...baseBanner, ...args }}
            onDismiss={() => setDismissed(true)}
          />
        )}
      </Page>
    );
  },
};
