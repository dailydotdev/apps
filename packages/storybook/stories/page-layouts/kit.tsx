import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';

// Wireframes of the webapp's page layouts. Each page is drawn at its real
// pixel widths for one breakpoint at a time, inside the chrome production
// gives it there, so the structure and the numbers can be read side by side.
// Nothing here renders production components: the boxes are the point.

export type Bp = 'laptop' | 'tablet' | 'phone';

export const viewports: Record<
  Bp,
  { width: number; height: number; label: string }
> = {
  laptop: { width: 1440, height: 900, label: 'Laptop L · 1440' },
  tablet: { width: 768, height: 1024, label: 'Tablet · 768' },
  phone: { width: 375, height: 812, label: 'Phone · 375' },
};

const bps: Bp[] = ['laptop', 'tablet', 'phone'];

/**
 * - app: MainLayout with the sidebar. A rail and a floating card on laptop,
 *   an icon rail on tablet, the shell block on phone.
 * - no-sidebar: MainLayout with showSidebar false. A global header on
 *   laptop, a back bar on tablet, the shell block on phone.
 * - product: a product's own header (recruiter, Plus, Cores) and no app nav.
 * - none: no chrome at all.
 */
export type Chrome = 'app' | 'no-sidebar' | 'product' | 'none';

export interface Variant {
  name: string;
  routes: string[];
  chrome: Chrome;
  /** The product header's name, for the product chrome. */
  product?: string;
  /** The phone's bottom nav bar (FooterNavBarLayout). */
  bottomBar?: boolean;
  /** The expanded laptop sidebar's context panel, when it holds the page's
   * menu (settings). */
  sidebarPanel?: string;
  /** Bars the page draws: the laptop PageHeader strip, a tablet top bar,
   * and the phone shell block's title. */
  header?: Partial<Record<Bp, string>>;
  /** The widths that define the layout, with where they come from. */
  widths: string[];
  notes?: ReactNode;
  /** Inconsistencies worth fixing, shown as a warning. */
  flags?: string[];
  /** One of its routes as production renders it: a Production frames
   * story id (after page-layouts-production-frames--) and its URL. */
  production?: { story: string; url: string };
  render: (bp: Bp) => ReactNode;
}

export interface Category {
  title: string;
  summary: string;
  intro: ReactNode;
  variants: Variant[];
}

export interface Family {
  title: string;
  summary: string;
  /** Untitled groups list their categories straight under the family. */
  groups: { title?: string; summary?: string; categories: Category[] }[];
}

/* ----------------------------------------------------------- primitives */

export type Tone = 'main' | 'aside' | 'nav' | 'media' | 'muted' | 'overlay';

const tones: Record<Tone, string> = {
  main: 'border-accent-cabbage-default bg-overlay-float-cabbage',
  aside: 'border-accent-bun-default bg-overlay-float-bun',
  nav: 'border-accent-water-default bg-overlay-float-water',
  media: 'border-accent-avocado-default bg-overlay-float-avocado',
  muted: 'border-border-subtlest-secondary bg-surface-float',
  overlay: 'border-accent-ketchup-default bg-overlay-float-ketchup',
};

/** A labelled region. `spec` is the class and width that sizes it. */
export const Box = ({
  label,
  spec,
  tone = 'main',
  style,
  className,
  children,
}: {
  label?: string;
  spec?: string;
  tone?: Tone;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}): ReactElement => (
  <div
    style={style}
    className={classNames(
      'flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden rounded-12 border-2 border-dashed p-4',
      tones[tone],
      className,
    )}
  >
    {(label || spec) && (
      <div className="flex shrink-0 flex-col gap-1">
        {label && (
          <span
            style={{ fontSize: 22, lineHeight: 1.2 }}
            className="font-bold text-text-primary"
          >
            {label}
          </span>
        )}
        {spec && (
          <span
            style={{ fontSize: 18, lineHeight: 1.2 }}
            className="font-mono text-text-secondary"
          >
            {spec}
          </span>
        )}
      </div>
    )}
    {children}
  </div>
);

export const Row = ({
  gap = 16,
  style,
  children,
}: {
  gap?: number;
  style?: CSSProperties;
  children: ReactNode;
}): ReactElement => (
  <div className="flex min-h-0 min-w-0" style={{ gap, ...style }}>
    {children}
  </div>
);

export const Col = ({
  gap = 16,
  style,
  children,
}: {
  gap?: number;
  style?: CSSProperties;
  children: ReactNode;
}): ReactElement => (
  <div className="flex min-h-0 min-w-0 flex-col" style={{ gap, ...style }}>
    {children}
  </div>
);

/** A column centred by mx-auto with a max width, as most pages do. */
export const Center = ({
  max,
  style,
  children,
}: {
  max: number;
  style?: CSSProperties;
  children: ReactNode;
}): ReactElement => (
  <div
    className="flex min-h-0 w-full flex-col"
    style={{ maxWidth: max, margin: '0 auto', gap: 16, ...style }}
  >
    {children}
  </div>
);

/** Text, as grey bars. */
export const Lines = ({
  count = 3,
  height = 14,
}: {
  count?: number;
  height?: number;
}): ReactElement => (
  <div className="flex flex-col" style={{ gap: height * 0.8 }}>
    {Array.from({ length: count }, (_, index) => (
      <span
        key={index}
        className="rounded-6 bg-border-subtlest-secondary"
        style={{ height, width: index === count - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
);

/** A grid of cards, as feeds and directories draw them. */
export const Cards = ({
  cols,
  rows = 2,
  height = 300,
  gap = 16,
}: {
  cols: number;
  rows?: number;
  height?: number;
  gap?: number;
}): ReactElement => (
  <div
    className="grid min-w-0"
    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}
  >
    {Array.from({ length: cols * rows }, (_, index) => (
      <div
        key={index}
        className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-3"
        style={{ height }}
      >
        <span
          className="rounded-8 bg-surface-float"
          style={{ height: height * 0.45 }}
        />
        <Lines count={2} height={12} />
      </div>
    ))}
  </div>
);

/** List rows with a thumbnail. */
export const ListRows = ({
  count = 6,
  thumb = true,
}: {
  count?: number;
  thumb?: boolean;
}): ReactElement => (
  <div className="flex flex-col">
    {Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        className="flex items-center gap-3 border-b border-border-subtlest-tertiary py-3"
      >
        <div className="flex-1">
          <Lines count={2} height={12} />
        </div>
        {thumb && (
          <span className="size-12 shrink-0 rounded-10 bg-surface-float" />
        )}
      </div>
    ))}
  </div>
);

/** Form fields: a label bar over an input. */
export const Fields = ({ count = 4 }: { count?: number }): ReactElement => (
  <div className="flex flex-col gap-5">
    {Array.from({ length: count }, (_, index) => (
      <div key={index} className="flex flex-col gap-2">
        <span
          className="rounded-6 bg-border-subtlest-secondary"
          style={{ height: 12, width: 140 }}
        />
        <span
          className="rounded-12 border border-border-subtlest-secondary"
          style={{ height: 44, maxWidth: 384 }}
        />
      </div>
    ))}
  </div>
);

/** A tab or pill row. */
export const Tabs = ({ count = 4 }: { count?: number }): ReactElement => (
  <div className="flex shrink-0 gap-2">
    {Array.from({ length: count }, (_, index) => (
      <span
        key={index}
        className={classNames(
          'rounded-10',
          index === 0 ? 'bg-surface-float' : 'bg-background-subtle',
        )}
        style={{ height: 32, width: 88 }}
      />
    ))}
  </div>
);

/** A modal over the page, with the scrim production draws. */
export const Overlay = ({
  label,
  spec,
  width,
  height,
}: {
  label: string;
  spec: string;
  width: number | string;
  height: number | string;
}): ReactElement => (
  <div className="absolute inset-0 z-1 flex items-start justify-center bg-overlay-quaternary-onion pt-16">
    <Box
      tone="overlay"
      label={label}
      spec={spec}
      className="bg-background-default"
      style={{ width, height, maxWidth: '100%' }}
    >
      <Fields count={4} />
    </Box>
  </div>
);

/* --------------------------------------------------------------- chrome */

const Bar = ({
  height,
  children,
  className,
}: {
  height: number;
  children?: ReactNode;
  className?: string;
}): ReactElement => (
  <div
    style={{ height, fontSize: 20 }}
    className={classNames(
      'flex shrink-0 items-center gap-3 border-border-subtlest-tertiary bg-background-subtle px-6 font-bold text-text-secondary',
      className,
    )}
  >
    {children}
  </div>
);

const Rail = ({ width }: { width: number }): ReactElement => (
  <div
    style={{ width }}
    className="flex shrink-0 flex-col items-center gap-4 border-r border-border-subtlest-tertiary bg-background-subtle py-5"
  >
    <span className="size-8 rounded-10 bg-text-primary" />
    {Array.from({ length: 7 }, (_, index) => (
      <span key={index} className="size-7 rounded-8 bg-surface-float" />
    ))}
  </div>
);

const BottomBar = (): ReactElement => (
  <div
    style={{ height: 64 }}
    className="flex shrink-0 items-center justify-around border-t border-border-subtlest-tertiary bg-background-subtle"
  >
    {Array.from({ length: 5 }, (_, index) => (
      <span key={index} className="size-7 rounded-8 bg-surface-float" />
    ))}
  </div>
);

const Content = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
    {children}
  </div>
);

/** One page at one breakpoint, inside the chrome production gives it. */
const Page = ({ variant, bp }: { variant: Variant; bp: Bp }): ReactElement => {
  const { chrome, header = {} } = variant;
  const page = <Content>{variant.render(bp)}</Content>;
  const phoneTop = (
    <Bar height={56} className="border-b">
      <span className="size-6 rounded-8 bg-surface-float" />
      {header.phone ?? 'Shell block'}
    </Bar>
  );
  const bottom = bp === 'phone' && variant.bottomBar && <BottomBar />;

  if (chrome === 'none') {
    return (
      <div className="flex h-full flex-col">
        {page}
        {bottom}
      </div>
    );
  }

  if (chrome === 'product') {
    return (
      <div className="flex h-full flex-col">
        <Bar height={bp === 'laptop' ? 64 : 56} className="border-b">
          <span className="size-8 rounded-10 bg-text-primary" />
          {variant.product ?? 'Product header'}
        </Bar>
        {page}
      </div>
    );
  }

  if (chrome === 'no-sidebar') {
    return (
      <div className="flex h-full flex-col">
        {bp === 'laptop' && (
          <Bar height={64} className="border-b">
            <span className="size-8 rounded-10 bg-text-primary" />
            Global header · h-16
          </Bar>
        )}
        {bp === 'tablet' && (
          <Bar height={48} className="border-b">
            ← Back · h-12
          </Bar>
        )}
        {bp === 'phone' && phoneTop}
        {page}
        {bottom}
      </div>
    );
  }

  if (bp === 'laptop') {
    return (
      <div className="flex h-full">
        {variant.sidebarPanel ? (
          <div
            style={{ width: 316 }}
            className="flex shrink-0 border-r border-border-subtlest-tertiary bg-background-subtle"
          >
            <Rail width={64} />
            <Box
              tone="nav"
              label={variant.sidebarPanel}
              spec="laptop:!pl-[20rem]"
              className="m-3 flex-1"
            >
              <ListRows count={9} thumb={false} />
            </Box>
          </div>
        ) : (
          <Rail width={80} />
        )}
        <div
          style={{ margin: '12px 12px 12px 4px' }}
          className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-24 border border-border-subtlest-tertiary"
        >
          {header.laptop && (
            <Bar height={56} className="border-b">
              {header.laptop}
            </Bar>
          )}
          {page}
        </div>
      </div>
    );
  }

  if (bp === 'tablet') {
    return (
      <div className="flex h-full">
        <Rail width={64} />
        <div className="flex min-w-0 flex-1 flex-col">
          {header.tablet && (
            <Bar height={56} className="border-b">
              {header.tablet}
            </Bar>
          )}
          {page}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {phoneTop}
      {page}
      {bottom}
    </div>
  );
};

/** A viewport drawn at its real size and scaled down to `scale`. */
const Screen = ({
  bp,
  scale,
  children,
}: {
  bp: Bp;
  scale: number;
  children: ReactNode;
}): ReactElement => {
  const { width, height, label } = viewports[bp];
  return (
    <div className="flex shrink-0 flex-col gap-2">
      <span className="font-bold text-text-tertiary typo-caption1">
        {label}
      </span>
      <div
        style={{ width: width * scale, height: height * scale }}
        className="overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default"
      >
        <div
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const useWidth = (): [React.RefObject<HTMLDivElement>, number] => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }
    const observer = new ResizeObserver(() => setWidth(element.clientWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
};

const gap = 24;

/** Laptop, tablet and phone in one row, all at the same scale. */
export const Breakpoints = ({
  variant,
}: {
  variant: Variant;
}): ReactElement => {
  const [ref, width] = useWidth();
  const total = bps.reduce((sum, bp) => sum + viewports[bp].width, 0);
  const scale = (width - gap * (bps.length - 1)) / total;
  return (
    <div ref={ref} className="flex w-full items-start" style={{ gap }}>
      {scale > 0 &&
        bps.map((bp) => (
          <Screen key={bp} bp={bp} scale={scale}>
            <Page variant={variant} bp={bp} />
          </Screen>
        ))}
    </div>
  );
};

// Each frame boots a whole app, so only a few load at once: a frame takes a
// slot when it scrolls into view and gives it back once it has painted.
const slots = { free: 3, waiting: [] as (() => void)[] };
const takeSlot = (start: () => void): void => {
  if (slots.free > 0) {
    slots.free -= 1;
    start();
  } else {
    slots.waiting.push(start);
  }
};
const giveSlot = (): void => {
  const next = slots.waiting.shift();
  if (next) {
    next();
  } else {
    slots.free += 1;
  }
};

/**
 * A production frames story in a frame of the breakpoint's real size. On a
 * cold dev server, Vite optimizes the webapp's dependencies while the first
 * frames load and their imports fail; such a frame reloads itself, up to
 * five times, waiting longer each time.
 */
const ProductionFrame = ({
  src,
  title,
  bp,
  scale,
}: {
  src: string;
  title: string;
  bp: Bp;
  scale: number;
}): ReactElement => {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = box.current;
    if (!element) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          takeSlot(() => setActive(true));
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) {
      return undefined;
    }
    let retries = 0;
    let retryAt = 0;
    let released = false;
    const release = () => {
      if (!released) {
        released = true;
        giveSlot();
      }
    };
    const check = window.setInterval(() => {
      const body = frame.current?.contentDocument?.body;
      if (!body) {
        return;
      }
      // Storybook's error screen, or the app's when a lazy chunk failed.
      const failed =
        body.classList.contains('sb-show-errordisplay') ||
        body.innerText.includes('Application error');
      if (failed && retries < 5 && Date.now() >= retryAt) {
        retries += 1;
        // Back off: the optimizer may still be running.
        retryAt = Date.now() + retries * 4000;
        frame.current?.contentWindow?.location.reload();
        return;
      }
      if (failed && retries < 5) {
        return;
      }
      const painted =
        (body.querySelector('#storybook-root')?.childElementCount ?? 0) > 0;
      if (failed || painted) {
        release();
      }
    }, 250);
    const giveUp = window.setTimeout(release, 90000);
    return () => {
      window.clearInterval(check);
      window.clearTimeout(giveUp);
      release();
    };
  }, [active]);

  return (
    <div ref={box} className="flex flex-col gap-2">
      <span className="text-text-tertiary typo-caption1">
        {viewports[bp].label}
      </span>
      <div
        style={{
          width: viewports[bp].width * scale,
          height: viewports[bp].height * scale,
        }}
        className="overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default"
      >
        {active && (
          <iframe
            ref={frame}
            title={title}
            src={src}
            style={{
              width: viewports[bp].width,
              height: viewports[bp].height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              border: 0,
              display: 'block',
            }}
          />
        )}
      </div>
    </div>
  );
};

/** The production page at each breakpoint, at the wireframes' scale. */
const ProductionBreakpoints = ({
  production,
}: {
  production: NonNullable<Variant['production']>;
}): ReactElement => {
  const [ref, width] = useWidth();
  const total = bps.reduce((sum, bp) => sum + viewports[bp].width, 0);
  const scale = (width - gap * (bps.length - 1)) / total;
  const src = `iframe.html?id=page-layouts-production-frames--${production.story}&viewMode=story&globals=theme:dark`;
  return (
    <div ref={ref} className="flex w-full items-start" style={{ gap }}>
      {scale > 0 &&
        bps.map((bp) => (
          <ProductionFrame
            key={bp}
            src={src}
            title={`${production.url} · ${viewports[bp].label}`}
            bp={bp}
            scale={scale}
          />
        ))}
    </div>
  );
};

/** One breakpoint, scaled to the column's width. */
export const Thumbnail = ({
  variant,
  bp = 'laptop',
}: {
  variant: Variant;
  bp?: Bp;
}): ReactElement => {
  const [ref, width] = useWidth();
  const scale = width / viewports[bp].width;
  return (
    <div ref={ref} className="w-full">
      {scale > 0 && (
        <div
          style={{
            width: viewports[bp].width * scale,
            height: viewports[bp].height * scale,
          }}
          className="overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default"
        >
          <div
            style={{
              width: viewports[bp].width,
              height: viewports[bp].height,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <Page variant={variant} bp={bp} />
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- pages */

const Chip = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="rounded-8 border border-border-subtlest-tertiary bg-background-subtle px-2 py-0.5 font-mono text-text-secondary typo-caption1">
    {children}
  </span>
);

const legend: [Tone, string][] = [
  ['main', 'Main content'],
  ['aside', 'Aside or second column'],
  ['nav', 'Menu, list or tabs'],
  ['media', 'Hero, banner or media'],
  ['overlay', 'Modal or overlay'],
];

const Legend = (): ReactElement => (
  <div className="flex flex-wrap gap-4">
    {legend.map(([tone, label]) => (
      <span
        key={tone}
        className="flex items-center gap-2 text-text-tertiary typo-footnote"
      >
        <span
          className={classNames(
            'size-4 rounded-4 border-2 border-dashed',
            tones[tone],
          )}
        />
        {label}
      </span>
    ))}
  </div>
);

const PageFrame = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary laptop:px-10">
    <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-14">
      {children}
    </div>
  </div>
);

const Header = ({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}): ReactElement => (
  <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
    <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
      Page layouts
    </span>
    <h1 className="font-bold typo-mega3">{title}</h1>
    <div className="flex max-w-[80ch] flex-col gap-3 text-text-secondary typo-body">
      {children}
    </div>
    <Legend />
  </header>
);

const plural = (count: number, word: string): string =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

export const routeCount = (category: Category): number =>
  category.variants.reduce((sum, variant) => sum + variant.routes.length, 0);

/** A category: every layout in it, with the routes that use each one. */
export const CategoryPage = ({
  category,
}: {
  category: Category;
}): ReactElement => (
  <PageFrame>
    <Header title={category.title}>
      <p className="font-bold text-text-primary">{category.summary}</p>
      {category.intro}
      <p className="text-text-tertiary typo-callout">
        {plural(routeCount(category), 'route')} in{' '}
        {plural(category.variants.length, 'layout')}. Routes that share a
        structure share one wireframe.
      </p>
    </Header>
    {category.variants.map((variant) => (
      <section key={variant.name} className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <h2 className="font-bold typo-title1">{variant.name}</h2>
          <div className="flex flex-wrap gap-2">
            {variant.routes.map((route) => (
              <Chip key={route}>{route}</Chip>
            ))}
          </div>
          <ul className="flex max-w-[100ch] flex-col gap-1 text-text-secondary typo-callout">
            {variant.widths.map((width) => (
              <li key={width}>· {width}</li>
            ))}
          </ul>
          {variant.notes && (
            <div className="max-w-[100ch] text-text-tertiary typo-callout">
              {variant.notes}
            </div>
          )}
          {variant.flags?.map((flag) => (
            <div
              key={flag}
              className="max-w-[100ch] rounded-12 border border-accent-bun-default bg-overlay-float-bun px-4 py-2 text-text-primary typo-callout"
            >
              ⚠ {flag}
            </div>
          ))}
        </div>
        <Breakpoints variant={variant} />
        {variant.production && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="font-bold typo-title3">Production</h3>
              <Chip>{variant.production.url}</Chip>
              <span className="text-text-tertiary typo-callout">
                The real page on live data, as a logged-in member.
              </span>
            </div>
            <ProductionBreakpoints production={variant.production} />
          </div>
        )}
      </section>
    ))}
  </PageFrame>
);

/** Every category at a glance, one laptop wireframe each. */
const CategoryCard = ({ category }: { category: Category }): ReactElement => (
  <section className="flex flex-col gap-3">
    <div className="flex items-baseline justify-between gap-4">
      <h3 className="font-bold typo-title2">{category.title}</h3>
      <span className="shrink-0 text-text-tertiary typo-footnote">
        {plural(routeCount(category), 'route')} ·{' '}
        {plural(category.variants.length, 'layout')}
      </span>
    </div>
    <p className="text-text-secondary typo-callout">{category.summary}</p>
    <Thumbnail variant={category.variants[0]} />
  </section>
);

export const OverviewPage = ({
  families,
}: {
  families: Family[];
}): ReactElement => (
  <PageFrame>
    <Header title="The webapp's page layouts">
      <p>
        Every route in packages/webapp/pages, grouped by how the page is laid
        out on a laptop. The categories sit in four families, and each one has a
        page that draws all its layouts at laptop, tablet and phone widths.
      </p>
      <p className="text-text-tertiary typo-callout">
        Not mapped: internal render targets (embed, image-generator, popup,
        error), internal tools (team, backoffice) and redirect-only routes.
      </p>
    </Header>
    {families.map((family) => (
      <section key={family.title} className="flex flex-col gap-8">
        <div className="flex flex-col gap-1 border-b border-border-subtlest-tertiary pb-3">
          <h2 className="font-bold typo-title1">{family.title}</h2>
          <p className="text-text-secondary typo-body">{family.summary}</p>
        </div>
        {family.groups.map((group) => (
          <div
            key={group.title ?? family.title}
            className="flex flex-col gap-6"
          >
            {group.title && (
              <div className="flex flex-col gap-1">
                <h3 className="font-bold typo-title3">{group.title}</h3>
                <p className="text-text-tertiary typo-callout">
                  {group.summary}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-10 laptop:grid-cols-2">
              {group.categories.map((category) => (
                <CategoryCard key={category.title} category={category} />
              ))}
            </div>
          </div>
        ))}
      </section>
    ))}
  </PageFrame>
);
