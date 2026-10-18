import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Post } from './product';
import { ClassicShell, MobileTop, V2Shell } from './layouts';

/**
 * The same feed at every width the product actually serves, in both layouts,
 * so an object can be judged for the room it has rather than for how it looks
 * at one lucky size. Breakpoints follow the app: phone under 768, tablet to
 * 1024, laptop to 1440, desktop to 1920, and wide above that. The rail and the
 * sidebar are laptop and up; below that both layouts share the mobile top.
 */
export const WIDTHS = [
  { label: 'Phone', width: 390 },
  { label: 'Tablet', width: 820 },
  { label: 'Laptop', width: 1280 },
  { label: 'Desktop', width: 1536 },
  { label: 'Wide', width: 1920 },
] as const;

export const columnsFor = (width: number): number => {
  if (width < 768) return 1;
  if (width < 1024) return 2;
  if (width < 1440) return 3;
  if (width < 1920) return 4;
  return 5;
};

export type Slot = 'topRight' | 'topLeft' | 'topCenter' | 'floating' | 'stickyTop' | 'band' | 'gridFirst' | 'header' | 'topColumn';

/** Renders a design at its true width, scaled down to fit a thumbnail column. */
export const Scaled = ({ width, height, into = 380, children }: { width: number; height: number; into?: number; children: ReactNode }): ReactElement => {
  const scale = Math.min(1, into / width);
  return (
    <div className="relative overflow-hidden rounded-12 border border-border-subtlest-tertiary" style={{ width: width * scale, height: height * scale }}>
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', inset: 0 }}>{children}</div>
    </div>
  );
};

const justify: Record<'topRight' | 'topLeft' | 'topCenter', string> = { topRight: 'flex-end', topLeft: 'flex-start', topCenter: 'center' };

const Grid = ({ cols, top, mobile = false, first }: { cols: number; top?: ReactNode; mobile?: boolean; first?: ReactNode }): ReactElement => (
  <div className={mobile ? 'flex flex-col gap-3 p-3' : 'flex flex-col gap-4 p-5'}>
    {top}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {first}
      {Array.from({ length: first ? cols * 2 - 1 : cols * 2 }).map((_, index) => (
        <Post key={index} index={index} />
      ))}
    </div>
  </div>
);

export const FeedFrame = ({ layout, width, slot, node, height }: { layout: 'v2' | 'classic'; width: number; slot: Slot; node: ReactNode; height?: number }): ReactElement => {
  const cols = columnsFor(width);
  const phone = width < 768;
  const frameHeight = height ?? (phone ? 760 : 800);
  const aligned = slot === 'topRight' || slot === 'topLeft' || slot === 'topCenter' ? <div className="flex" style={{ justifyContent: justify[slot as 'topRight' | 'topLeft' | 'topCenter'] }}>{node}</div> : null;
  const band = slot === 'band' ? <div className="flex w-full">{node}</div> : null;
  const column = slot === 'topColumn' ? <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}><div className="flex w-full">{node}</div></div> : null;
  const topRow = aligned ?? band ?? column;
  const first = slot === 'gridFirst' ? node : undefined;
  const header = slot === 'header' ? node : undefined;
  const floating = slot === 'floating' ? <div className="absolute" style={{ right: 20, bottom: phone ? 76 : 20 }}>{node}</div> : null;
  const sticky = slot === 'stickyTop' ? <div className="flex items-center justify-end border-b border-border-subtlest-tertiary px-4 py-2">{node}</div> : null;

  if (width < 1024) {
    return (
      <div className="relative flex flex-col overflow-hidden bg-background-default" style={{ width, height: frameHeight }}>
        {sticky}
        <MobileTop actions={header} />
        <Grid cols={cols} top={topRow} mobile first={first} />
        {floating}
        {phone && (
          <div className="absolute inset-x-0 bottom-0 flex h-14 items-center justify-around border-t border-border-subtlest-tertiary bg-background-default text-text-quaternary typo-caption2">
            {['Home', 'Explore', 'Post', 'Squads', 'You'].map((item) => (
              <span key={item} className="flex flex-col items-center gap-1">
                <span className="h-5 w-5 rounded-6 bg-surface-hover" />
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (layout === 'v2') {
    return <V2Shell width={width} height={frameHeight} compact={width < 1280} overlay={floating} stickyTop={sticky} headerRight={header} content={<Grid cols={cols} top={topRow} first={first} />} />;
  }
  return <ClassicShell width={width} height={frameHeight} overlay={floating} stickyTop={sticky} navRight={header} content={<Grid cols={cols} top={topRow} first={first} />} />;
};

/** A layout at every width, in a scrollable row of scaled frames. */
export const WidthRow = ({ layout, slot, node, into = 400 }: { layout: 'v2' | 'classic'; slot: Slot; node: ReactNode; into?: number }): ReactElement => (
  <div className="flex gap-4 overflow-x-auto pb-2">
    {WIDTHS.map(({ label, width }) => {
      const phone = width < 768;
      return (
        <div key={label} className="flex shrink-0 flex-col gap-1.5">
          <Scaled width={width} height={phone ? 760 : 800} into={phone ? 200 : into}>
            <FeedFrame layout={layout} width={width} slot={slot} node={node} />
          </Scaled>
          <span className="font-mono text-text-quaternary typo-caption2">
            {label} · {width}px · {columnsFor(width)} col
          </span>
        </div>
      );
    })}
  </div>
);
