import type {
  ComponentType,
  CSSProperties,
  ReactElement,
  ReactNode,
} from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import type { IconProps } from '../Icon';
import { IconSize } from '../Icon';
import { BlockIcon } from '../icons/Block';
import { ShieldPlusIcon } from '../icons/ShieldPlus';
import { HashtagIcon } from '../icons/Hashtag';
import { LabelIcon } from '../icons/Label';
import { FolderIcon } from '../icons/Folder';
import { BriefIcon } from '../icons/Brief';
import { BookmarkIcon } from '../icons/Bookmark';
import { PlusIcon } from '../icons/Plus';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export type PlusBannerAccent =
  | 'blueCheese'
  | 'cheese'
  | 'avocado'
  | 'water'
  | 'ketchup'
  | 'bun'
  | 'onion';

export const accentStyle = (
  accent?: PlusBannerAccent,
): CSSProperties | undefined =>
  accent
    ? ({
        '--plus-banner-accent': `var(--theme-accent-${accent}-default)`,
      } as CSSProperties)
    : undefined;

// Returns how many of the moments (ms after mount) have passed. Reduced
// motion skips to `reducedStep`, the state that best explains the scene.
const useTimeline = (
  moments: number[],
  reducedStep = moments.length,
): number => {
  const isReducedMotion = usePrefersReducedMotion();
  const [step, setStep] = useState(isReducedMotion ? reducedStep : 0);
  const key = moments.join(',');

  useEffect(() => {
    if (isReducedMotion) {
      setStep(reducedStep);
      return undefined;
    }
    const ids = key
      .split(',')
      .map((ms, index) =>
        window.setTimeout(() => setStep(index + 1), Number(ms)),
      );
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [key, isReducedMotion, reducedStep]);

  return step;
};

const Bar = ({
  width,
  className = 'h-2',
}: {
  width: string;
  className?: string;
}): ReactElement => (
  <span
    aria-hidden
    className={classNames('block rounded-max bg-surface-float', className)}
    style={{ width }}
  />
);

const Pill = ({
  accent,
  children,
}: {
  accent?: PlusBannerAccent;
  children: ReactNode;
}): ReactElement => (
  <span
    className={classNames(
      'flex h-5 shrink-0 items-center gap-1 rounded-6 px-1.5 transition-colors duration-300 typo-caption2',
      accent
        ? 'plus-banner-tint-chip font-bold'
        : 'bg-surface-float text-text-secondary',
    )}
    style={accentStyle(accent)}
  >
    {children}
  </span>
);

interface CardProps {
  source?: string;
  meta?: ReactNode;
  title?: ReactNode;
  tag?: string;
  tagAccent?: PlusBannerAccent;
  accent?: PlusBannerAccent;
}

const Card = ({
  source,
  meta,
  title,
  tag,
  tagAccent,
  accent,
}: CardProps): ReactElement => (
  <div
    className={classNames(
      'flex min-h-[5.75rem] gap-3 rounded-16 border p-3 transition-colors duration-300',
      accent
        ? 'plus-banner-tint'
        : 'border-border-subtlest-tertiary bg-background-subtle',
    )}
    style={accentStyle(accent)}
  >
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-5 shrink-0 rounded-max bg-surface-float"
        />
        {source ? (
          <span className="truncate text-text-tertiary typo-caption1">
            {source}
          </span>
        ) : (
          <Bar width="28%" className="h-1.5" />
        )}
        {meta}
      </div>
      {title ?? (
        <>
          <Bar width="90%" className="h-2.5" />
          <Bar width="62%" className="h-2.5" />
        </>
      )}
      <div className="mt-auto flex items-center gap-2">
        {tag ? (
          <Pill accent={tagAccent}>#{tag}</Pill>
        ) : (
          <Bar width="18%" className="h-1.5" />
        )}
        <Bar width="10%" className="h-1.5" />
        <Bar width="10%" className="h-1.5" />
      </div>
    </div>
    <span
      aria-hidden
      className="w-[4.5rem] shrink-0 rounded-10 bg-surface-float"
    />
  </div>
);

const Title = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
    {children}
  </span>
);

const Row = ({
  gone = false,
  enter = false,
  delay = 0,
  children,
}: {
  gone?: boolean;
  enter?: boolean;
  delay?: number;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames('plus-banner-row', gone && 'plus-banner-row--gone')}
  >
    <div>
      <div
        className={classNames('pb-2', enter && 'plus-perk-in')}
        style={enter ? { animationDelay: `${delay}ms` } : undefined}
      >
        {children}
      </div>
    </div>
  </div>
);

const Scene = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    aria-hidden
    className="plus-banner-scene relative min-h-0 flex-1 overflow-hidden"
  >
    <div className="plus-banner-scene-content absolute inset-x-0 top-0 mx-auto flex flex-col">
      {children}
    </div>
  </div>
);

const AdFreeScene = (): ReactElement => {
  const gone = useTimeline([1100], 0) >= 1;
  return (
    <Scene>
      <Row gone={gone}>
        <Card
          accent="blueCheese"
          source="Northwind Cloud"
          meta={<Pill accent="blueCheese">Promoted</Pill>}
          title={
            <Title>Ship preview environments for every pull request</Title>
          }
        />
      </Row>
      <Row>
        <Card />
      </Row>
      <Row>
        <Card />
      </Row>
    </Scene>
  );
};

const briefItems = [
  'Bundlers race to cut cold builds in half',
  'Rust keeps spreading into OS kernels',
  'A popular JWT library has a CVE: who needs to patch',
];

const BriefingScene = (): ReactElement => {
  const arrived = useTimeline([900]) >= 1;
  return (
    <Scene>
      <Row gone={!arrived} enter={arrived}>
        <div
          className="plus-banner-tint flex flex-col gap-2 rounded-16 border p-3"
          style={accentStyle('onion')}
        >
          <div className="flex items-center gap-2">
            <BriefIcon
              secondary
              size={IconSize.Size16}
              className="plus-banner-tint-text"
            />
            <span className="flex-1 font-bold text-text-primary typo-footnote">
              Your briefing is ready
            </span>
            <span className="text-text-tertiary typo-caption1">3 min read</span>
          </div>
          {briefItems.map((item, index) => (
            <div key={item} className="flex items-baseline gap-2">
              <span className="w-3 shrink-0 tabular-nums text-text-tertiary typo-caption1">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-text-secondary typo-caption1">
                {item}
              </span>
            </div>
          ))}
          <span className="text-text-quaternary typo-caption2">
            From 5,214 posts across 312 sources
          </span>
        </div>
      </Row>
      <Row>
        <Card />
      </Row>
      <Row>
        <Card />
      </Row>
    </Scene>
  );
};

const ClickbaitScene = (): ReactElement => {
  const step = useTimeline([800, 1500]);
  const clean = step >= 2;
  return (
    <Scene>
      <Row>
        <Card
          accent={clean ? 'avocado' : 'cheese'}
          source="Dev Weekly"
          tag="react"
          meta={
            clean ? (
              <Pill accent="avocado">
                <ShieldPlusIcon secondary size={IconSize.Size16} />
                Clickbait-free
              </Pill>
            ) : (
              <Pill accent="cheese">Clickbait</Pill>
            )
          }
          title={
            clean ? (
              <span key="clean" className="plus-perk-in">
                <Title>
                  useTransition keeps inputs responsive during heavy renders
                </Title>
              </span>
            ) : (
              <Title>
                <span
                  className={classNames(
                    'plus-banner-strike',
                    step >= 1 && 'plus-banner-strike--on text-text-tertiary',
                  )}
                >
                  You WON’T BELIEVE what this one React hook does
                </span>
              </Title>
            )
          }
        />
      </Row>
      <Row>
        <Card />
      </Row>
      <Row>
        <Card />
      </Row>
    </Scene>
  );
};

const FeedTab = ({
  active = false,
  accent,
  children,
}: {
  active?: boolean;
  accent?: PlusBannerAccent;
  children: ReactNode;
}): ReactElement => (
  <span
    className={classNames(
      'flex h-7 items-center gap-1 rounded-10 px-2.5 font-bold transition-colors duration-300 typo-footnote',
      active && accent && 'plus-banner-tint-chip',
      active && !accent && 'bg-surface-float text-text-primary',
      !active && 'text-text-tertiary',
    )}
    style={accentStyle(accent)}
  >
    <HashtagIcon size={IconSize.Size16} />
    {children}
  </span>
);

const mixedFeed = [{ tag: 'career' }, { tag: 'design' }, { tag: 'kubernetes' }];
const aiCodingFeed = [
  {
    tag: 'ai-coding',
    source: 'Agent Digest',
    title: 'Coding agents can now run tasks in the background',
  },
  {
    tag: 'llm',
    source: 'Model Notes',
    title: 'Why models forget the middle of your prompt',
  },
  {
    tag: 'code-review',
    source: 'AI Weekly',
    title: 'How to review code your agent wrote',
  },
];

const CustomFeedsScene = (): ReactElement => {
  const step = useTimeline([700, 1500]);
  const switched = step >= 2;
  const feed: { tag: string; source?: string; title?: string }[] = switched
    ? aiCodingFeed
    : mixedFeed;
  return (
    <Scene>
      <div className="flex items-center gap-1 pb-3">
        <FeedTab active={!switched}>My feed</FeedTab>
        {step >= 1 ? (
          <span className="plus-perk-in">
            <FeedTab active={switched} accent="water">
              AI coding
            </FeedTab>
          </span>
        ) : (
          <span className="flex size-7 items-center justify-center rounded-10 text-text-tertiary">
            <PlusIcon size={IconSize.Size16} />
          </span>
        )}
      </div>
      {feed.map((post, index) => (
        <Row key={post.tag} enter={switched} delay={index * 90}>
          <Card
            tag={post.tag}
            tagAccent={switched ? 'water' : undefined}
            source={post.source}
            title={post.title && <Title>{post.title}</Title>}
          />
        </Row>
      ))}
    </Scene>
  );
};

const KeywordFiltersScene = (): ReactElement => {
  const step = useTimeline([700, 1700]);
  return (
    <Scene>
      <div className="flex h-7 items-center gap-2 pb-3">
        <span className="text-text-tertiary typo-footnote">Muted words</span>
        {step >= 1 && (
          <span
            className="plus-banner-tint-chip plus-perk-in flex h-7 items-center gap-1 rounded-10 px-2.5 font-bold typo-footnote"
            style={accentStyle('ketchup')}
          >
            crypto
            <BlockIcon size={IconSize.Size16} />
          </span>
        )}
        {step >= 2 && (
          <span className="plus-perk-in ml-auto text-text-tertiary typo-caption1">
            1 post hidden
          </span>
        )}
      </div>
      <Row gone={step >= 2}>
        <Card
          accent={step >= 1 ? 'ketchup' : undefined}
          source="Coin Weekly"
          tag="crypto"
          title={
            <Title>10 crypto coins every developer should buy right now</Title>
          }
        />
      </Row>
      <Row>
        <Card />
      </Row>
      <Row>
        <Card />
      </Row>
    </Scene>
  );
};

const folders = [
  {
    name: 'AI coding',
    count: 12,
    latest: 'Why models forget the middle of your prompt',
  },
  { name: 'Rust', count: 7, latest: 'Rust keeps spreading into OS kernels' },
  {
    name: 'System design',
    count: 9,
    latest: 'Designing a rate limiter that scales',
  },
];

const FoldersScene = (): ReactElement => {
  const shown = useTimeline([700, 1000, 1300]);
  return (
    <Scene>
      <div className="flex flex-col gap-0.5">
        {folders.slice(0, shown).map((folder) => (
          <div
            key={folder.name}
            className="plus-banner-tint-soft plus-perk-in flex h-12 items-center gap-2.5 rounded-10 px-2.5"
            style={accentStyle('bun')}
          >
            <FolderIcon
              secondary
              size={IconSize.Size16}
              className="plus-banner-tint-text"
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-bold text-text-primary typo-footnote">
                {folder.name}
              </span>
              <span className="truncate text-text-tertiary typo-caption2">
                {folder.latest}
              </span>
            </span>
            <span className="plus-banner-tint-text font-bold tabular-nums typo-caption1">
              {folder.count}
            </span>
          </div>
        ))}
        {[74, 58, 66, 50, 70].map((width) => (
          <div key={width} className="flex h-9 items-center gap-2 px-2.5">
            <BookmarkIcon
              size={IconSize.Size16}
              className="text-text-quaternary"
            />
            <Bar width={`${width}%`} />
          </div>
        ))}
      </div>
    </Scene>
  );
};

export interface PlusBannerFeature {
  // Matches the ids in plusFeatureListApiFirst, so feature clicks read the
  // same in analytics wherever they come from.
  id: string;
  label: string;
  perk: string;
  Icon: ComponentType<IconProps>;
  accent: PlusBannerAccent;
  Scene: ComponentType;
}

export const plusBannerFeatures: PlusBannerFeature[] = [
  {
    id: 'ad-free',
    label: 'Ad-free',
    perk: 'Removes every ad',
    Icon: BlockIcon,
    accent: 'blueCheese',
    Scene: AdFreeScene,
  },
  {
    id: 'presidential-briefing',
    label: 'Presidential Briefing',
    perk: 'Unlimited Presidential Briefings',
    Icon: BriefIcon,
    accent: 'onion',
    Scene: BriefingScene,
  },
  {
    id: 'clean titles',
    label: 'Clickbait-free titles',
    perk: 'Rewrites clickbait titles',
    Icon: ShieldPlusIcon,
    accent: 'avocado',
    Scene: ClickbaitScene,
  },
  {
    id: 'custom feeds',
    label: 'Custom feeds',
    perk: 'Advanced custom feeds, like AI coding',
    Icon: HashtagIcon,
    accent: 'water',
    Scene: CustomFeedsScene,
  },
  {
    id: 'keyword filter',
    label: 'Keyword filters',
    perk: 'Hides posts with words you mute',
    Icon: LabelIcon,
    accent: 'ketchup',
    Scene: KeywordFiltersScene,
  },
  {
    id: 'bookmark folders',
    label: 'Folders',
    perk: 'Organizes bookmarks into folders',
    Icon: FolderIcon,
    accent: 'bun',
    Scene: FoldersScene,
  },
];
