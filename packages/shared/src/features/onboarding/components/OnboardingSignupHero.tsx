import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import Logo, { LogoPosition } from '../../../components/Logo';
import { IconSize } from '../../../components/Icon';
import { UpvoteIcon } from '../../../components/icons/Upvote';
import { DiscussIcon } from '../../../components/icons/Discuss';
import { ShareIcon } from '../../../components/icons/Share';
import { BookmarkIcon } from '../../../components/icons/Bookmark';
import { MenuIcon } from '../../../components/icons/Menu';
import {
  Card,
  CardHeader,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from '../../../components/cards/common/Card';
import { FooterLinks } from '../../../components/footer/FooterLinks';
import SignupDisclaimer from '../../../components/auth/SignupDisclaimer';
import {
  ThemeMode,
  useSettingsContext,
} from '../../../contexts/SettingsContext';

type AccentKey = 'cabbage' | 'water' | 'onion' | 'bacon' | 'cheese' | 'avocado';

const ACCENT_TEXT: Record<AccentKey, string> = {
  cabbage: 'text-accent-cabbage-default',
  water: 'text-accent-water-default',
  onion: 'text-accent-onion-default',
  bacon: 'text-accent-bacon-default',
  cheese: 'text-accent-cheese-default',
  avocado: 'text-accent-avocado-default',
};

const unsplash = (id: string, w = 480, h = 280): string =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=72&auto=format`;

const HERO_STYLES = `
.onb-bg {
  background:
    radial-gradient(ellipse 65% 50% at 15% 18%,
      color-mix(in srgb, var(--theme-accent-cabbage-default) 8%, transparent) 0%,
      transparent 65%),
    radial-gradient(ellipse 55% 45% at 88% 32%,
      color-mix(in srgb, var(--theme-accent-water-default) 7%, transparent) 0%,
      transparent 70%),
    var(--theme-background-default);
}
.onb-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(120px);
  mix-blend-mode: screen;
  pointer-events: none;
  opacity: 0.32;
  animation: onb-breathe 22s ease-in-out infinite;
}
.onb-orb--delay { animation-delay: -8s; }
@keyframes onb-breathe {
  0%, 100% { opacity: 0.26; }
  50% { opacity: 0.42; }
}
@media (prefers-reduced-motion: reduce) {
  .onb-orb { animation: none; opacity: 0.32; }
}
.onb-form-halo {
  background:
    radial-gradient(
      ellipse 78% 55% at 50% 92%,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0.98) 20%,
      rgba(0, 0, 0, 0.9) 36%,
      rgba(0, 0, 0, 0.7) 52%,
      rgba(0, 0, 0, 0.4) 68%,
      rgba(0, 0, 0, 0.15) 82%,
      transparent 94%
    );
}
.onb-center-halo {
  background:
    radial-gradient(
      ellipse 60% 38% at 50% 58%,
      rgba(0, 0, 0, 0.85) 0%,
      rgba(0, 0, 0, 0.65) 28%,
      rgba(0, 0, 0, 0.35) 52%,
      rgba(0, 0, 0, 0.1) 72%,
      transparent 92%
    );
}
.onb-bottom-vignette {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 32%,
    rgba(0, 0, 0, 0.45) 56%,
    rgba(0, 0, 0, 0.85) 78%,
    rgba(0, 0, 0, 1) 100%
  );
}
.onb-top-fade {
  background: linear-gradient(
    to bottom,
    rgba(8, 8, 12, 0.55) 0%,
    rgba(8, 8, 12, 0.12) 28%,
    transparent 44%
  );
}
.onb-headline { text-shadow: 0 2px 32px rgba(0, 0, 0, 0.95), 0 0 64px rgba(0, 0, 0, 0.6); }
.onb-grid-mask {
  -webkit-mask-image:
    radial-gradient(
      ellipse 78% 58% at 50% 95%,
      transparent 0%,
      transparent 16%,
      rgba(0, 0, 0, 0.45) 36%,
      rgba(0, 0, 0, 0.95) 62%,
      black 100%
    );
  mask-image:
    radial-gradient(
      ellipse 78% 58% at 50% 95%,
      transparent 0%,
      transparent 16%,
      rgba(0, 0, 0, 0.45) 36%,
      rgba(0, 0, 0, 0.95) 62%,
      black 100%
    );
}
.onb-cover-shade {
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 60%,
    rgba(0, 0, 0, 0.35) 100%
  );
}
.onb-glow-cabbage { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-cabbage-default) 65%, transparent); }
.onb-glow-water { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-water-default) 65%, transparent); }
.onb-glow-onion { text-shadow: 0 0 28px color-mix(in srgb, var(--theme-accent-onion-default) 70%, transparent); }
.onb-glow-bacon { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-bacon-default) 65%, transparent); }
.onb-glow-cheese { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-cheese-default) 65%, transparent); }
.onb-glow-avocado { text-shadow: 0 0 24px color-mix(in srgb, var(--theme-accent-avocado-default) 65%, transparent); }
`;

// =============================================================
// Variant A — Cards: real daily.dev feed cards
// =============================================================

type FeedItem = {
  id: string;
  title: string;
  source: string;
  sourceDomain: string;
  cover: string;
  upvotes: number;
  comments: number;
  readTime: number;
  daysAgo: number;
  tags: string[];
};

const sourceLogo = (domain: string): string =>
  `https://logo.clearbit.com/${domain}`;

const FEED_ITEMS: FeedItem[] = [
  {
    id: 'f1',
    title: 'Why we rewrote our build system in Rust',
    source: 'Stripe Engineering',
    sourceDomain: 'stripe.com',
    cover: '1555066931-4365d14bab8c',
    upvotes: 1247,
    comments: 184,
    readTime: 9,
    daysAgo: 1,
    tags: ['rust', 'tooling', 'performance'],
  },
  {
    id: 'f2',
    title: 'TypeScript 5.5 — the 4 features you will actually use',
    source: 'Fireship',
    sourceDomain: 'fireship.io',
    cover: '1542831371-29b0f74f9713',
    upvotes: 3412,
    comments: 420,
    readTime: 7,
    daysAgo: 2,
    tags: ['typescript', 'webdev'],
  },
  {
    id: 'f3',
    title: 'How Claude Code changed our review culture',
    source: 'The Pragmatic Engineer',
    sourceDomain: 'pragmaticengineer.com',
    cover: '1620712943543-bcc4688e7485',
    upvotes: 2108,
    comments: 312,
    readTime: 12,
    daysAgo: 1,
    tags: ['ai', 'engineering', 'culture'],
  },
  {
    id: 'f4',
    title: 'Edge functions, benchmarked: 14ms vs 280ms cold starts',
    source: 'Vercel',
    sourceDomain: 'vercel.com',
    cover: '1517694712202-14dd9538aa97',
    upvotes: 894,
    comments: 128,
    readTime: 8,
    daysAgo: 3,
    tags: ['edge', 'serverless', 'benchmarks'],
  },
  {
    id: 'f5',
    title: 'Postgres or SQLite in 2026? A pragmatic guide',
    source: 'High Scalability',
    sourceDomain: 'highscalability.com',
    cover: '1581090464777-f3220bbe1b8b',
    upvotes: 2780,
    comments: 512,
    readTime: 14,
    daysAgo: 2,
    tags: ['databases', 'postgres', 'sqlite'],
  },
  {
    id: 'f6',
    title: 'Kubernetes is fine. Your YAML is the problem.',
    source: 'CNCF',
    sourceDomain: 'cncf.io',
    cover: '1535551951406-a19828b0a76b',
    upvotes: 1936,
    comments: 240,
    readTime: 11,
    daysAgo: 4,
    tags: ['kubernetes', 'devops'],
  },
  {
    id: 'f7',
    title: 'A one-line trick to debounce async hooks in React',
    source: 'daily.dev',
    sourceDomain: 'daily.dev',
    cover: '1633356122544-f134324a6cee',
    upvotes: 824,
    comments: 91,
    readTime: 4,
    daysAgo: 1,
    tags: ['react', 'hooks', 'snippet'],
  },
  {
    id: 'f8',
    title: 'The hidden cost of unused indexes in Postgres',
    source: 'Crunchy Data',
    sourceDomain: 'crunchydata.com',
    cover: '1607799279861-4dd421887fb3',
    upvotes: 1234,
    comments: 156,
    readTime: 10,
    daysAgo: 3,
    tags: ['postgres', 'performance'],
  },
  {
    id: 'f9',
    title: 'I tried 7 AI code editors so you do not have to',
    source: 'GitHub',
    sourceDomain: 'github.com',
    cover: '1635070041078-e363dbe005cb',
    upvotes: 4122,
    comments: 602,
    readTime: 18,
    daysAgo: 2,
    tags: ['ai', 'tools', 'review'],
  },
  {
    id: 'f10',
    title: 'Tailwind v4: what changed and what broke for us',
    source: 'Tailwind CSS',
    sourceDomain: 'tailwindcss.com',
    cover: '1573164574572-cb89e39749b4',
    upvotes: 986,
    comments: 174,
    readTime: 7,
    daysAgo: 1,
    tags: ['css', 'tailwind', 'webdev'],
  },
  {
    id: 'f11',
    title: 'Bun vs Node in 2026: surprising benchmarks',
    source: 'Bun',
    sourceDomain: 'bun.sh',
    cover: '1593642632559-0c6d3fc62b89',
    upvotes: 1604,
    comments: 288,
    readTime: 9,
    daysAgo: 2,
    tags: ['node', 'bun', 'benchmarks'],
  },
  {
    id: 'f12',
    title: 'Lessons from scaling Postgres to 1M writes/sec',
    source: 'GitHub Engineering',
    sourceDomain: 'github.blog',
    cover: '1517433670267-08bbd4be890f',
    upvotes: 3208,
    comments: 388,
    readTime: 22,
    daysAgo: 4,
    tags: ['postgres', 'scale', 'architecture'],
  },
];

const formatCount = (n: number): string => {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `${n}`;
};

const SourceImage = ({
  domain,
  source,
}: {
  domain: string;
  source: string;
}): ReactElement => (
  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-float">
    <img
      src={sourceLogo(domain)}
      alt={source}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const target = e.currentTarget;
        target.onerror = null;
        target.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      }}
    />
  </span>
);

const FeedActionButton = ({
  icon,
  count,
}: {
  icon: ReactElement;
  count?: string;
}): ReactElement => (
  <span className="inline-flex h-8 items-center gap-1 rounded-12 px-1.5 text-text-tertiary typo-callout">
    {icon}
    {count && (
      <span className="font-bold tabular-nums leading-none">{count}</span>
    )}
  </span>
);

const FeedItemReplica = ({ item }: { item: FeedItem }): ReactElement => (
  <Card className="max-h-none">
    <CardTextContainer>
      <CardHeader>
        <SourceImage domain={item.sourceDomain} source={item.source} />
        <div className="ml-2 flex min-w-0 flex-1 flex-col">
          <span className="truncate font-bold text-text-primary typo-footnote">
            {item.source}
          </span>
          <span className="text-text-tertiary typo-caption2">
            {item.daysAgo}d ago
          </span>
        </div>
        <span className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary">
          <MenuIcon size={IconSize.Small} secondary />
        </span>
      </CardHeader>
      <CardTitle lineClamp="line-clamp-3">{item.title}</CardTitle>
    </CardTextContainer>
    <CardSpace />
    <div className="mx-4 mt-2 flex items-center gap-1 overflow-hidden">
      {item.tags.slice(0, 3).map((tag) => (
        <span
          key={tag}
          className="inline-flex shrink-0 items-center text-text-tertiary typo-footnote"
        >
          #{tag}
        </span>
      ))}
    </div>
    <p className="mx-4 mt-2 flex items-center text-text-tertiary typo-footnote">
      <span>{item.daysAgo}d ago</span>
      <span className="mx-1.5 h-0.5 w-0.5 rounded-full bg-text-tertiary" />
      <span>{item.readTime} min read time</span>
    </p>
    <div className="mx-4 mb-3 mt-3">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-12">
        <img
          src={unsplash(item.cover, 480, 300)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="onb-cover-shade absolute inset-0" />
      </div>
    </div>
    <div className="flex items-center px-3 pb-2">
      <FeedActionButton
        icon={<UpvoteIcon size={IconSize.Small} secondary />}
        count={formatCount(item.upvotes)}
      />
      <FeedActionButton
        icon={<DiscussIcon size={IconSize.Small} secondary />}
        count={formatCount(item.comments)}
      />
      <FeedActionButton
        icon={<BookmarkIcon size={IconSize.Small} secondary />}
      />
      <span className="ml-auto">
        <FeedActionButton
          icon={<ShareIcon size={IconSize.Small} secondary />}
        />
      </span>
    </div>
  </Card>
);

const CardsBackground = (): ReactElement => (
  <div
    aria-hidden
    className="onb-grid-mask pointer-events-none absolute inset-0 -z-1 select-none overflow-hidden"
  >
    <div className="grid grid-cols-2 gap-5 p-5 tablet:grid-cols-3 tablet:gap-6 tablet:p-7 laptop:grid-cols-4 laptopL:grid-cols-5">
      {FEED_ITEMS.map((item) => (
        <FeedItemReplica key={item.id} item={item} />
      ))}
    </div>
  </div>
);

// =============================================================
// Variant B — Tags: topic constellation
// =============================================================

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

const TAG_VARIANT_CLASSES: Record<TagVariant, string> = {
  xs: 'typo-caption1',
  sm: 'typo-footnote',
  md: 'typo-callout font-medium',
  lg: 'typo-title3 font-bold',
};

const TAG_NEUTRAL: Record<TagVariant, string> = {
  xs: 'text-white/25',
  sm: 'text-white/40',
  md: 'text-white/55',
  lg: 'text-white/70',
};

const ACCENT_GLOW: Record<AccentKey, string> = {
  cabbage: 'onb-glow-cabbage',
  water: 'onb-glow-water',
  onion: 'onb-glow-onion',
  bacon: 'onb-glow-bacon',
  cheese: 'onb-glow-cheese',
  avocado: 'onb-glow-avocado',
};

const ConstellationTag = ({ tag }: { tag: TagItem }): ReactElement => {
  const accentClasses = tag.accent
    ? `${ACCENT_TEXT[tag.accent]} ${ACCENT_GLOW[tag.accent]}`
    : TAG_NEUTRAL[tag.variant];
  return (
    <span
      className={classNames(
        'absolute whitespace-nowrap tracking-tight',
        TAG_VARIANT_CLASSES[tag.variant],
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

const TagsBackground = (): ReactElement => (
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
);

// =============================================================
// Variant C — Desk: full-cover photo backdrop
// =============================================================

const DeskBackground = (): ReactElement => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-1 select-none"
  >
    <picture>
      <img
        src="/assets/onboarding-hero-desk.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        decoding="async"
      />
    </picture>
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(180deg, rgba(8,8,12,0.35) 0%, rgba(8,8,12,0.1) 30%, rgba(8,8,12,0.25) 60%, rgba(8,8,12,0.7) 100%)',
      }}
    />
  </div>
);

// =============================================================
// Variant registry & switcher
// =============================================================

type VariantId = 'cards' | 'tags' | 'desk';

type VariantDef = {
  id: VariantId;
  label: string;
  render: () => ReactElement;
};

const VARIANTS: VariantDef[] = [
  { id: 'cards', label: 'Cards', render: () => <CardsBackground /> },
  { id: 'tags', label: 'Tags', render: () => <TagsBackground /> },
  { id: 'desk', label: 'Desk', render: () => <DeskBackground /> },
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

const VariantSwitcher = ({
  value,
  onChange,
}: {
  value: VariantId;
  onChange: (next: VariantId) => void;
}): ReactElement => (
  <div
    className="bg-raw-pepper-90/85 border-white/10 pointer-events-auto fixed right-4 top-4 flex items-center gap-1 rounded-full border p-1 backdrop-blur-md tablet:right-6 tablet:top-6"
    style={{ zIndex: 50 }}
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
            'pointer-events-auto cursor-pointer rounded-full px-3 py-1 font-medium tracking-tight transition-colors typo-caption2',
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

// =============================================================
// Main hero
// =============================================================

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
      </div>

      {activeVariant.render()}

      <div
        aria-hidden
        className="onb-top-fade pointer-events-none absolute inset-x-0 top-0 -z-1 h-40"
      />
      <div
        aria-hidden
        className="onb-bottom-vignette pointer-events-none absolute inset-x-0 bottom-0 -z-1 h-[55vh]"
      />
      <div
        aria-hidden
        className="onb-center-halo pointer-events-none absolute inset-0 -z-1"
      />
      <div
        aria-hidden
        className="onb-form-halo pointer-events-none absolute inset-0 -z-1"
      />

      <VariantSwitcher value={variantId} onChange={setVariantId} />

      <main className="relative z-1 flex w-full flex-1 flex-col items-center justify-end px-5 pb-[7.5rem] pt-10 tablet:pb-[5.5rem] tablet:pt-14">
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

      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-1 hidden items-end justify-between gap-6 px-6 pb-4 tablet:flex">
        <div className="[&_footer]:!pb-0 [&_ul]:!mb-0 [&_ul]:!justify-start">
          <FooterLinks />
        </div>
        <div className="max-w-sm text-right">
          <SignupDisclaimer className="!text-right !text-text-tertiary typo-caption1" />
        </div>
      </div>

      <div className="pointer-events-auto relative z-1 flex w-full flex-col items-center gap-4 px-5 pb-5 tablet:hidden">
        <div className="[&_footer]:!pb-0 [&_ul]:!mb-0">
          <FooterLinks />
        </div>
        <SignupDisclaimer className="!text-text-tertiary typo-caption1" />
      </div>
    </div>
  );
};

export default OnboardingSignupHero;
