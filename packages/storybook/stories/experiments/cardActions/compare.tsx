import type { ReactElement, ReactNode } from 'react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { RealCard, realPosts } from './swap';
import type { Concept } from './concepts';
import { ALL_CONCEPTS } from './concepts';
import type { Device } from './frames';
import { GRID_DEVICES, Toggle } from './frames';
import { FeedShell, GEOMETRY, cardWidthFor, columnsForViewport } from './shell';

/* ------------------------------------------------------------------------ */
/* A feed at a real viewport width, scaled down in place                     */
/* ------------------------------------------------------------------------ */

type Sidebar = 'open' | 'closed';

/** Height of the slice a snapshot shows: header, padding and one card row. */
const SLICE = 560;

/**
 * The shell rendered at the device's real width and shrunk with CSS `zoom`,
 * so layout (columns, card widths, the bar) is computed at full size. No
 * iframe: every snapshot renders on the page, nothing loads separately.
 * Grid cards only (all compared widths are ≥1,020px), so the cards' own media
 * queries see the same laptop+ window they would in production.
 */
const FeedSnapshot = ({
  device,
  gap,
  sidebar,
  concept,
  scale,
  rows = 1,
  height = SLICE,
}: {
  device: Device;
  gap: number;
  sidebar: Sidebar;
  concept: Concept;
  scale: number;
  rows?: number;
  height?: number;
}): ReactElement => {
  const cols = columnsForViewport(device.width, sidebar);
  return (
    <div
      className="overflow-hidden rounded-12 border border-border-subtlest-tertiary"
      style={{ width: device.width * scale, height: height * scale }}
    >
      <div style={{ width: device.width, zoom: scale }}>
        <FeedShell width={device.width} sidebar={sidebar}>
          <div
            className="grid"
            style={{
              gap,
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            }}
          >
            {realPosts.slice(0, cols * rows).map((post) => (
              <RealCard key={post.id} post={post} slots={concept.slots} />
            ))}
          </div>
        </FeedShell>
      </div>
    </div>
  );
};

/** One card at the exact width this breakpoint and gap give it. */
const CardSnapshot = ({
  device,
  gap,
  sidebar,
  concept,
  scale,
  crop,
}: {
  device: Device;
  gap: number;
  sidebar: Sidebar;
  concept: Concept;
  scale: number;
  /** Show only the bottom of the card (cover edge and bar), in px. */
  crop?: number;
}): ReactElement => {
  const width = cardWidthFor(device.width, sidebar, gap);
  return (
    <div
      className={classNames(
        crop && 'flex flex-col justify-end overflow-hidden',
      )}
      style={{ width: width * scale, height: crop ? crop * scale : undefined }}
    >
      <div style={{ width, zoom: scale }}>
        <RealCard post={realPosts[2]} slots={concept.slots} />
      </div>
    </div>
  );
};

type Mode = 'feed' | 'card' | 'bar';

/* ------------------------------------------------------------------------ */
/* The matrix                                                                */
/* ------------------------------------------------------------------------ */

const GAP_COLUMNS = [32, 24, 20, 16];
const LABEL = 150;
const SPACE = 16;

const useWidth = (): [React.RefObject<HTMLDivElement>, number] => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    // Measure now too: the observer can fire late in a hidden or
    // background tab, and the rows only render once the width is known.
    setWidth(node.getBoundingClientRect().width);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
};

interface Focus {
  concept: Concept;
  gap: number;
}

const Enlarged = ({
  focus,
  device,
  sidebar,
  onClose,
}: {
  focus: Focus;
  device: Device;
  sidebar: Sidebar;
  onClose: () => void;
}): ReactElement => {
  const scale = Math.min(1, (window.innerWidth - 96) / device.width);
  return (
    <div
      role="dialog"
      aria-label={`${focus.concept.name}, ${focus.gap}px gap`}
      className="fixed inset-0 flex flex-col items-center overflow-auto bg-background-default p-8"
      style={{ zIndex: 50 }}
    >
      <div
        className="mb-4 flex w-full items-center justify-between"
        style={{ maxWidth: device.width * scale }}
      >
        <p className="font-bold typo-title3">
          {focus.concept.name} · gap {focus.gap}px · {device.name}{' '}
          {device.width}px
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-10 bg-surface-float px-3 py-1.5 font-bold typo-footnote"
        >
          Close
        </button>
      </div>
      <p className="mb-4 text-text-tertiary typo-footnote">
        Hover a card to see its hover state.
      </p>
      <FeedSnapshot
        device={device}
        gap={focus.gap}
        sidebar={sidebar}
        concept={focus.concept}
        scale={scale}
        rows={2}
        height={1000}
      />
    </div>
  );
};

const Cell = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) =>
  onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="block rounded-12 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default"
      title="Open larger"
    >
      {children}
    </button>
  ) : (
    <div>{children}</div>
  );

export const ComparePage = (): ReactElement => {
  const [deviceName, setDeviceName] = useState(GRID_DEVICES[0].name);
  const [sidebar, setSidebar] = useState<Sidebar>('open');
  const [mode, setMode] = useState<Mode>('feed');
  const [focus, setFocus] = useState<Focus>();
  const [ref, width] = useWidth();
  const device =
    GRID_DEVICES.find((d) => d.name === deviceName) ?? GRID_DEVICES[0];

  const cellWidth = Math.max(
    0,
    (width - LABEL - SPACE * GAP_COLUMNS.length) / GAP_COLUMNS.length,
  );
  const feedScale = cellWidth / device.width;
  const widest = cardWidthFor(device.width, sidebar, 16);
  const cardScale = Math.min(1, cellWidth / widest);

  return (
    <div className="min-h-screen bg-background-default px-8 py-10 text-text-primary">
      <h1 className="mb-2 font-bold typo-title1">Compare</h1>
      <p className="mb-6 max-w-3xl text-pretty text-text-tertiary typo-callout">
        Every shortlisted bar at every gap, side by side. Rows are the variants,
        columns are the space between cards. Each snapshot is the real feed
        shell at the chosen window width, with real posts and the production
        cards. Click a feed snapshot to open it large; “One card” shows the
        cards at real size and “Bar close-up” only the bars, all sixteen in one
        view.
      </p>

      <div
        className="sticky top-0 mb-6 flex flex-wrap items-center gap-4 border-b border-border-subtlest-tertiary bg-background-default py-3"
        style={{ zIndex: 2 }}
      >
        <Toggle
          options={GRID_DEVICES.map((d) => ({
            value: d.name,
            label: `${d.name} · ${d.width}`,
          }))}
          value={deviceName}
          onChange={setDeviceName}
        />
        <Toggle
          options={[
            { value: 'open', label: 'Sidebar open' },
            { value: 'closed', label: 'Sidebar closed' },
          ]}
          value={sidebar}
          onChange={(v) => setSidebar(v as Sidebar)}
        />
        <Toggle
          options={[
            { value: 'feed', label: 'Feed' },
            { value: 'card', label: 'One card' },
            { value: 'bar', label: 'Bar close-up' },
          ]}
          value={mode}
          onChange={(v) => setMode(v as Mode)}
        />
      </div>

      <div ref={ref}>
        <div
          className="grid items-start"
          style={{
            gridTemplateColumns: `${LABEL}px repeat(${GAP_COLUMNS.length}, minmax(0, 1fr))`,
            columnGap: SPACE,
            rowGap: 28,
          }}
        >
          <span />
          {GAP_COLUMNS.map((gap) => (
            <div key={gap}>
              <p
                className={classNames(
                  'font-bold typo-callout',
                  gap === GEOMETRY.gap && 'text-accent-ketchup-default',
                )}
              >
                Gap {gap}px{gap === GEOMETRY.gap ? ' · today' : ''}
              </p>
              <p className="text-text-tertiary tabular-nums typo-caption1">
                {columnsForViewport(device.width, sidebar)} columns · cards{' '}
                {Math.round(cardWidthFor(device.width, sidebar, gap))}px
              </p>
            </div>
          ))}

          {width > 0 &&
            ALL_CONCEPTS.map((concept) => (
              <React.Fragment key={concept.id}>
                <div className="pt-1">
                  <p className="font-bold typo-callout">{concept.name}</p>
                  <p className="text-text-tertiary typo-caption1">
                    {concept.seenAt}
                  </p>
                </div>
                {GAP_COLUMNS.map((gap) =>
                  mode === 'feed' ? (
                    <Cell key={gap} onClick={() => setFocus({ concept, gap })}>
                      <FeedSnapshot
                        device={device}
                        gap={gap}
                        sidebar={sidebar}
                        concept={concept}
                        scale={feedScale}
                      />
                    </Cell>
                  ) : (
                    <Cell key={gap}>
                      <CardSnapshot
                        device={device}
                        gap={gap}
                        sidebar={sidebar}
                        concept={concept}
                        scale={mode === 'bar' ? 1 : cardScale}
                        crop={mode === 'bar' ? 110 : undefined}
                      />
                    </Cell>
                  ),
                )}
              </React.Fragment>
            ))}
        </div>
      </div>

      {focus && (
        <Enlarged
          focus={focus}
          device={device}
          sidebar={sidebar}
          onClose={() => setFocus(undefined)}
        />
      )}
    </div>
  );
};
