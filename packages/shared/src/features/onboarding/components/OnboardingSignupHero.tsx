import type { ReactElement, ReactNode } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import Logo, { LogoPosition } from '../../../components/Logo';
import {
  ThemeMode,
  useSettingsContext,
} from '../../../contexts/SettingsContext';

type AccentKey = 'cabbage' | 'water' | 'onion' | 'bacon' | 'cheese' | 'avocado';

type TagVariant = 'xs' | 'sm' | 'md' | 'lg';

type TagItem = {
  label: string;
  x: number;
  y: number;
  variant: TagVariant;
  accent?: AccentKey;
};

const TAGS: TagItem[] = [
  { label: 'TypeScript', x: 10, y: 11, variant: 'md', accent: 'water' },
  { label: 'React', x: 28, y: 6, variant: 'sm' },
  { label: 'AI', x: 50, y: 14, variant: 'lg', accent: 'onion' },
  { label: 'Next.js', x: 70, y: 7, variant: 'sm' },
  { label: 'Rust', x: 85, y: 13, variant: 'md', accent: 'bacon' },
  { label: 'Open Source', x: 6, y: 22, variant: 'xs' },
  { label: 'JavaScript', x: 35, y: 24, variant: 'sm' },
  { label: 'Vue', x: 60, y: 22, variant: 'xs' },
  { label: 'Python', x: 92, y: 24, variant: 'xs' },
  { label: 'WebAssembly', x: 18, y: 32, variant: 'xs' },
  { label: 'GraphQL', x: 40, y: 36, variant: 'sm' },
  { label: 'LLM', x: 72, y: 32, variant: 'sm', accent: 'cabbage' },
  { label: 'Svelte', x: 90, y: 36, variant: 'xs' },
  { label: 'Tailwind CSS', x: 8, y: 42, variant: 'sm' },
  { label: 'Node.js', x: 28, y: 46, variant: 'xs' },
  { label: 'Edge Computing', x: 58, y: 44, variant: 'sm' },
  { label: 'PostgreSQL', x: 80, y: 46, variant: 'xs' },
  { label: 'Docker', x: 12, y: 54, variant: 'xs' },
  { label: 'System Design', x: 36, y: 55, variant: 'md', accent: 'avocado' },
  { label: 'Architecture', x: 65, y: 56, variant: 'xs' },
  { label: 'Kubernetes', x: 92, y: 52, variant: 'xs' },
  { label: 'DevOps', x: 5, y: 64, variant: 'sm' },
  { label: 'Linux', x: 18, y: 72, variant: 'xs' },
  { label: 'Security', x: 90, y: 64, variant: 'sm' },
  { label: 'Performance', x: 78, y: 72, variant: 'xs' },
  { label: 'Indie Hacking', x: 6, y: 82, variant: 'xs' },
  { label: 'Startups', x: 14, y: 92, variant: 'sm' },
  { label: 'Remote', x: 92, y: 82, variant: 'xs' },
  { label: 'Serverless', x: 86, y: 92, variant: 'sm' },
];

const CONNECTIONS: Array<[number, number, number, number]> = [
  [10, 11, 28, 6],
  [50, 14, 72, 32],
  [85, 13, 18, 32],
  [36, 55, 65, 56],
  [5, 64, 12, 54],
  [40, 36, 80, 46],
];

const VARIANT_CLASSES: Record<TagVariant, string> = {
  xs: 'typo-caption1',
  sm: 'typo-footnote',
  md: 'typo-callout font-medium',
  lg: 'typo-title3 font-bold',
};

const NEUTRAL_OPACITY: Record<TagVariant, string> = {
  xs: 'text-white/25',
  sm: 'text-white/40',
  md: 'text-white/55',
  lg: 'text-white/70',
};

const ACCENT_TEXT: Record<AccentKey, string> = {
  cabbage: 'text-accent-cabbage-default',
  water: 'text-accent-water-default',
  onion: 'text-accent-onion-default',
  bacon: 'text-accent-bacon-default',
  cheese: 'text-accent-cheese-default',
  avocado: 'text-accent-avocado-default',
};

const ACCENT_GLOW: Record<AccentKey, string> = {
  cabbage: 'onb-glow-cabbage',
  water: 'onb-glow-water',
  onion: 'onb-glow-onion',
  bacon: 'onb-glow-bacon',
  cheese: 'onb-glow-cheese',
  avocado: 'onb-glow-avocado',
};

const HERO_STYLES = `
.onb-bg {
  background:
    radial-gradient(ellipse 65% 50% at 15% 18%,
      color-mix(in srgb, var(--theme-accent-cabbage-default) 9%, transparent) 0%,
      transparent 65%),
    radial-gradient(ellipse 55% 45% at 88% 32%,
      color-mix(in srgb, var(--theme-accent-water-default) 8%, transparent) 0%,
      transparent 70%),
    var(--theme-background-default);
}
.onb-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(96px);
  mix-blend-mode: screen;
  pointer-events: none;
  animation: onb-breathe 18s ease-in-out infinite;
}
.onb-orb--delay {
  animation-delay: -6s;
}
@keyframes onb-breathe {
  0%, 100% { opacity: 0.32; }
  50% { opacity: 0.5; }
}
@media (prefers-reduced-motion: reduce) {
  .onb-orb {
    animation: none;
    opacity: 0.4;
  }
}
.onb-form-halo {
  background:
    radial-gradient(
      ellipse 90% 65% at 50% 82%,
      rgba(8, 8, 12, 0.95) 0%,
      rgba(8, 8, 12, 0.78) 22%,
      rgba(8, 8, 12, 0.4) 52%,
      transparent 82%
    );
}
.onb-top-fade {
  background: linear-gradient(
    to bottom,
    rgba(8, 8, 12, 0.5) 0%,
    rgba(8, 8, 12, 0.1) 20%,
    transparent 35%
  );
}
.onb-headline {
  text-shadow: 0 2px 28px rgba(0, 0, 0, 0.7);
}
.onb-glow-cabbage {
  text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-cabbage-default) 65%, transparent);
}
.onb-glow-water {
  text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-water-default) 65%, transparent);
}
.onb-glow-onion {
  text-shadow: 0 0 28px color-mix(in srgb, var(--theme-accent-onion-default) 70%, transparent);
}
.onb-glow-bacon {
  text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-bacon-default) 65%, transparent);
}
.onb-glow-cheese {
  text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-cheese-default) 65%, transparent);
}
.onb-glow-avocado {
  text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-avocado-default) 65%, transparent);
}
`;

const ConstellationTag = ({ tag }: { tag: TagItem }): ReactElement => {
  const accentClasses = tag.accent
    ? `${ACCENT_TEXT[tag.accent]} ${ACCENT_GLOW[tag.accent]}`
    : NEUTRAL_OPACITY[tag.variant];
  return (
    <span
      className={classNames(
        'absolute whitespace-nowrap tracking-tight',
        VARIANT_CLASSES[tag.variant],
        accentClasses,
      )}
      style={{
        left: `${tag.x}%`,
        top: `${tag.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {tag.label}
    </span>
  );
};

type Props = {
  children: ReactNode;
  isFormExpanded?: boolean;
  headline?: string | null;
};

const DEFAULT_HEADLINE = 'The homepage every developer deserves.';

export const OnboardingSignupHero = ({
  children,
  isFormExpanded = false,
  headline = DEFAULT_HEADLINE,
}: Props): ReactElement => {
  const { applyThemeMode } = useSettingsContext();

  useEffect(() => {
    applyThemeMode(ThemeMode.Dark);
    return () => {
      applyThemeMode();
    };
  }, [applyThemeMode]);

  return (
    <div className="onb-bg relative isolate flex min-h-dvh w-full overflow-hidden bg-raw-pepper-90 text-text-primary">
      <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-2 select-none"
      >
        <span
          className="onb-orb bg-accent-cabbage-default"
          style={{
            width: '38rem',
            height: '38rem',
            top: '-10rem',
            left: '-8rem',
          }}
        />
        <span
          className="onb-orb onb-orb--delay bg-accent-water-default"
          style={{
            width: '32rem',
            height: '32rem',
            top: '18%',
            right: '-10rem',
          }}
        />
        <span
          className="onb-orb bg-accent-onion-default"
          style={{
            width: '26rem',
            height: '26rem',
            top: '36%',
            left: '38%',
            opacity: 0.22,
          }}
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-1 select-none"
      >
        <svg
          className="absolute inset-0 h-full w-full text-white/[0.07]"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          {CONNECTIONS.map(([x1, y1, x2, y2]) => (
            <line
              key={`${x1}-${y1}-${x2}-${y2}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="0.12"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {TAGS.map((tag) => (
          <ConstellationTag key={tag.label} tag={tag} />
        ))}
      </div>

      <div
        aria-hidden
        className="onb-top-fade pointer-events-none absolute inset-x-0 top-0 -z-1 h-40"
      />
      <div
        aria-hidden
        className="onb-form-halo pointer-events-none absolute inset-0 -z-1"
      />

      <main className="relative z-1 flex w-full flex-1 flex-col items-center justify-end px-5 pb-[12vh] pt-10 tablet:pb-[14vh] tablet:pt-14">
        <div className="flex w-full max-w-[26rem] flex-col gap-6 tablet:gap-7">
          <Logo
            position={LogoPosition.Relative}
            className="!left-0 !top-0 !mt-0 !translate-x-0 self-center"
            logoClassName={{ container: 'h-7' }}
          />

          {!isFormExpanded && headline && (
            <h1 className="onb-headline text-balance text-center font-bold leading-[1.05] tracking-tight text-text-primary typo-title2 tablet:typo-mega3">
              {headline}
            </h1>
          )}

          {children}
        </div>
      </main>
    </div>
  );
};

export default OnboardingSignupHero;
