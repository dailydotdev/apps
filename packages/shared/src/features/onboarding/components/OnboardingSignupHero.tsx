import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import Logo, { LogoPosition } from '../../../components/Logo';
import {
  ThemeMode,
  useSettingsContext,
} from '../../../contexts/SettingsContext';

type AccentKey = 'cabbage' | 'water' | 'onion' | 'bacon' | 'cheese' | 'avocado';

const ACCENT_BG: Record<AccentKey, string> = {
  cabbage: 'bg-accent-cabbage-default',
  water: 'bg-accent-water-default',
  onion: 'bg-accent-onion-default',
  bacon: 'bg-accent-bacon-default',
  cheese: 'bg-accent-cheese-default',
  avocado: 'bg-accent-avocado-default',
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
.onb-orb--delay { animation-delay: -6s; }
@keyframes onb-breathe {
  0%, 100% { opacity: 0.32; }
  50% { opacity: 0.5; }
}
@media (prefers-reduced-motion: reduce) {
  .onb-orb { animation: none; opacity: 0.4; }
}
.onb-form-halo {
  background: radial-gradient(
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
.onb-headline { text-shadow: 0 2px 28px rgba(0, 0, 0, 0.7); }
.onb-glow-cabbage { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-cabbage-default) 65%, transparent); }
.onb-glow-water { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-water-default) 65%, transparent); }
.onb-glow-onion { text-shadow: 0 0 28px color-mix(in srgb, var(--theme-accent-onion-default) 70%, transparent); }
.onb-glow-bacon { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-bacon-default) 65%, transparent); }
.onb-glow-cheese { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-cheese-default) 65%, transparent); }
.onb-glow-avocado { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-avocado-default) 65%, transparent); }
.onb-avatar-shadow { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5); }
.onb-squad-ring {
  filter: drop-shadow(0 0 12px color-mix(in srgb, var(--theme-accent-onion-default) 22%, transparent));
}
`;

// ---------- Variant A: Constellation ----------

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

const ConstellationBackground = (): ReactElement => (
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
    {TAGS.map((tag) => {
      const accentClasses = tag.accent
        ? `${ACCENT_TEXT[tag.accent]} ${ACCENT_GLOW[tag.accent]}`
        : NEUTRAL_OPACITY[tag.variant];
      return (
        <span
          key={tag.label}
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
    })}
  </div>
);

// ---------- Variant B: Squad Universe ----------

type SquadMember = { initial: string; accent: AccentKey };

type Squad = {
  name: string;
  x: number;
  y: number;
  accent: AccentKey;
  highlighted?: boolean;
  hideOnMobile?: boolean;
  members: SquadMember[];
};

const SQUADS: Squad[] = [
  {
    name: 'Frontend',
    x: 14,
    y: 18,
    accent: 'water',
    members: [
      { initial: 'J', accent: 'cabbage' },
      { initial: 'M', accent: 'water' },
      { initial: 'S', accent: 'cheese' },
      { initial: 'A', accent: 'bacon' },
      { initial: 'K', accent: 'onion' },
    ],
  },
  {
    name: 'AI & LLM',
    x: 50,
    y: 14,
    accent: 'onion',
    highlighted: true,
    members: [
      { initial: 'D', accent: 'onion' },
      { initial: 'R', accent: 'cabbage' },
      { initial: 'T', accent: 'water' },
      { initial: 'L', accent: 'cheese' },
      { initial: 'P', accent: 'bacon' },
      { initial: 'H', accent: 'avocado' },
    ],
  },
  {
    name: 'Rust Devs',
    x: 84,
    y: 20,
    accent: 'bacon',
    members: [
      { initial: 'O', accent: 'bacon' },
      { initial: 'V', accent: 'water' },
      { initial: 'E', accent: 'cabbage' },
      { initial: 'Z', accent: 'cheese' },
    ],
  },
  {
    name: 'DevOps',
    x: 14,
    y: 50,
    accent: 'cheese',
    hideOnMobile: true,
    members: [
      { initial: 'C', accent: 'cheese' },
      { initial: 'B', accent: 'avocado' },
      { initial: 'F', accent: 'cabbage' },
      { initial: 'G', accent: 'water' },
      { initial: 'N', accent: 'bacon' },
    ],
  },
  {
    name: 'Backend',
    x: 86,
    y: 52,
    accent: 'avocado',
    members: [
      { initial: 'Q', accent: 'avocado' },
      { initial: 'W', accent: 'water' },
      { initial: 'X', accent: 'onion' },
      { initial: 'Y', accent: 'cabbage' },
    ],
  },
  {
    name: 'Mobile',
    x: 18,
    y: 80,
    accent: 'cabbage',
    members: [
      { initial: 'I', accent: 'cabbage' },
      { initial: 'U', accent: 'cheese' },
      { initial: 'R', accent: 'water' },
    ],
  },
  {
    name: 'Indie Hackers',
    x: 82,
    y: 80,
    accent: 'onion',
    highlighted: true,
    members: [
      { initial: 'S', accent: 'onion' },
      { initial: 'A', accent: 'bacon' },
      { initial: 'K', accent: 'cabbage' },
      { initial: 'P', accent: 'water' },
      { initial: 'B', accent: 'cheese' },
    ],
  },
];

const orbitalPositions = (
  count: number,
  radius: number,
): Array<{ dx: number; dy: number }> =>
  Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    return {
      dx: Math.cos(angle) * radius,
      dy: Math.sin(angle) * radius,
    };
  });

const SquadCluster = ({ squad }: { squad: Squad }): ReactElement => {
  const radius = squad.highlighted ? 3.4 : 3;
  const positions = orbitalPositions(squad.members.length, radius);
  const ringSize = squad.highlighted ? 7.4 : 6.6;
  return (
    <div
      className={classNames(
        'absolute',
        squad.hideOnMobile && 'hidden tablet:block',
      )}
      style={{
        left: `${squad.x}%`,
        top: `${squad.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <svg
        className={classNames(
          'absolute left-1/2 top-1/2 text-white/[0.08]',
          squad.highlighted && 'onb-squad-ring',
        )}
        style={{
          width: `${ringSize}rem`,
          height: `${ringSize}rem`,
          transform: 'translate(-50%, -50%)',
        }}
        viewBox="0 0 100 100"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="1.4 2.2"
        />
      </svg>

      <div className="flex flex-col items-center gap-1.5">
        <span
          className={classNames(
            'h-1.5 w-1.5 rounded-full',
            ACCENT_BG[squad.accent],
          )}
        />
        <span
          className={classNames(
            'whitespace-nowrap font-medium tracking-tight typo-caption2',
            squad.highlighted ? 'text-white/80' : 'text-white/45',
          )}
        >
          {squad.name}
        </span>
      </div>

      {squad.members.map((member, i) => {
        const { dx, dy } = positions[i];
        const avatarSize = squad.highlighted ? 'h-5 w-5' : 'h-4 w-4';
        return (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={`${squad.name}-${i}-${member.initial}`}
            className={classNames(
              'onb-avatar-shadow border-white/15 absolute flex items-center justify-center rounded-full border font-bold leading-none text-white',
              avatarSize,
              ACCENT_BG[member.accent],
            )}
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${dx}rem), calc(-50% + ${dy}rem))`,
              fontSize: '0.5625rem',
            }}
          >
            {member.initial}
          </span>
        );
      })}
    </div>
  );
};

const SquadUniverseBackground = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-1 select-none"
  >
    {SQUADS.map((squad) => (
      <SquadCluster key={squad.name} squad={squad} />
    ))}
  </div>
);

// ---------- Variant registry ----------

type VariantId = 'constellation' | 'squads';

type VariantDef = {
  id: VariantId;
  label: string;
  render: () => ReactElement;
};

const VARIANTS: VariantDef[] = [
  {
    id: 'constellation',
    label: 'Topics',
    render: () => <ConstellationBackground />,
  },
  {
    id: 'squads',
    label: 'Squads',
    render: () => <SquadUniverseBackground />,
  },
];

const VARIANT_STORAGE_KEY = 'onb-hero-variant';
const VARIANT_IDS = new Set(VARIANTS.map((v) => v.id));

const isVariantId = (value: string | null): value is VariantId =>
  !!value && VARIANT_IDS.has(value as VariantId);

const readInitialVariant = (): VariantId => {
  if (typeof window === 'undefined') {
    return VARIANTS[0].id;
  }
  const fromUrl = new URLSearchParams(window.location.search).get('variant');
  if (isVariantId(fromUrl)) {
    return fromUrl;
  }
  const fromStorage = window.localStorage.getItem(VARIANT_STORAGE_KEY);
  if (isVariantId(fromStorage)) {
    return fromStorage;
  }
  return VARIANTS[0].id;
};

type VariantSwitcherProps = {
  value: VariantId;
  onChange: (next: VariantId) => void;
};

const VariantSwitcher = ({
  value,
  onChange,
}: VariantSwitcherProps): ReactElement => (
  <div
    className="z-10 border-white/10 absolute right-4 top-4 flex items-center gap-1 rounded-full border bg-overlay-tertiary-onion p-1 backdrop-blur-md tablet:right-6 tablet:top-6"
    role="radiogroup"
    aria-label="Background variant"
  >
    <span className="px-2 text-text-quaternary typo-caption2">Variant</span>
    {VARIANTS.map((variant) => {
      const active = variant.id === value;
      return (
        <button
          key={variant.id}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(variant.id)}
          className={classNames(
            'rounded-full px-3 py-1 font-medium tracking-tight transition-colors typo-caption2',
            active
              ? 'bg-white/15 text-text-primary'
              : 'text-text-tertiary hover:text-text-primary',
          )}
        >
          {variant.label}
        </button>
      );
    })}
  </div>
);

// ---------- Main hero ----------

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
  const [variantId, setVariantId] = useState<VariantId>(VARIANTS[0].id);

  useEffect(() => {
    setVariantId(readInitialVariant());
  }, []);

  useEffect(() => {
    applyThemeMode(ThemeMode.Dark);
    return () => {
      applyThemeMode();
    };
  }, [applyThemeMode]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(VARIANT_STORAGE_KEY, variantId);
  }, [variantId]);

  const activeVariant = VARIANTS.find((v) => v.id === variantId) ?? VARIANTS[0];

  return (
    <div className="onb-bg relative isolate flex min-h-dvh w-full overflow-hidden bg-raw-pepper-90 text-text-primary">
      <style dangerouslySetInnerHTML={{ __html: HERO_STYLES }} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-1 select-none"
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

      {activeVariant.render()}

      <div
        aria-hidden
        className="onb-top-fade pointer-events-none absolute inset-x-0 top-0 -z-1 h-40"
      />
      <div
        aria-hidden
        className="onb-form-halo pointer-events-none absolute inset-0 -z-1"
      />

      <VariantSwitcher value={variantId} onChange={setVariantId} />

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
