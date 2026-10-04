import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { FeedList, HeadlineRows, ProposedHomeHeader, SegmentedRow } from './mocks';
import { BarMaterial } from './floating';
import { Circle, LeafTop, RootCluster, useScrollProgress } from './chrome';
import { ChannelLine, Chips, Segments, channels } from './tabMocks';
import { posts } from './data';

// Seven ways to expose a second dimension (the Happening now channels)
// without a second row that looks like the first. Each is a whole phone so
// the comparison is fair; the recommendation is on the chapter page.

const material = BarMaterial.Glass;

const Frame = ({
  header,
  children,
  active = 'Home',
  bottom,
  top,
}: {
  header?: ReactNode;
  children: ReactNode;
  active?: string;
  bottom?: ReactNode;
  top?: ReactNode;
}): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      {header && <div className="relative z-2 shrink-0">{header}</div>}
      {top && <div className="pointer-events-none absolute inset-x-0 top-2 z-2">{top}</div>}
      <div className={classNames('map-scroll-none min-h-0 flex-1 overflow-hidden', Boolean(top) && !header && 'pt-16')}>
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
        {bottom ?? <RootCluster material={material} active={active} />}
      </div>
    </div>
  </Phone>
);

const homeSegments = ['For you', 'Happening now', 'Following'];

// 0. The draft Tsahi flagged: two rows, close in weight and shape.
export const StackedDraft = (): ReactElement => (
  <Frame
    header={
      <div className="bg-background-default">
        <ProposedHomeHeader active={1} />
        <Chips items={channels} active={0} />
      </div>
    }
  >
    <HeadlineRows />
    <HeadlineRows />
  </Frame>
);

// A. Trailing picker: the channel is a chip at the end of the segment row
// (Reddit's sort control, the iOS title menu) and opens a sheet.
const ChannelPicker = ({ label = 'All channels' }: { label?: string }): ReactElement => (
  <span className="ml-auto mr-2 flex h-8 shrink-0 items-center gap-1 rounded-10 border border-border-subtlest-tertiary px-2.5 text-text-secondary typo-footnote">
    {label}
    <ArrowIcon size={IconSize.XSmall} className="rotate-180" />
  </span>
);

export const TrailingPicker = (): ReactElement => (
  <Frame
    header={
      <div className="bg-background-default">
        <ProposedHomeHeader active={1} />
      </div>
    }
  >
    <div className="flex items-center justify-between px-4 pb-1 pt-3">
      <span className="text-text-tertiary typo-caption1">Updated 3 minutes ago</span>
      <ChannelPicker />
    </div>
    <HeadlineRows />
    <HeadlineRows />
  </Frame>
);

const PickerSheet = (): ReactElement => (
  <div className="absolute inset-0 z-3 flex flex-col justify-end bg-overlay-quaternary-onion">
    <div className="map-sheet-in flex flex-col gap-1 rounded-t-24 bg-background-default px-4 pb-8 pt-3">
      <span className="mx-auto mb-2 h-1 w-9 rounded-2 bg-border-subtlest-secondary" />
      <span className="px-2 pb-2 font-bold typo-title3">Channel</span>
      {channels.map((channel, index) => (
        <span key={channel} className="flex h-12 items-center justify-between rounded-12 px-2 typo-callout">
          {channel}
          {index === 0 && <span className="size-2 rounded-max bg-text-primary" />}
        </span>
      ))}
    </div>
  </div>
);

export const TrailingPickerOpen = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="relative z-2 shrink-0 bg-background-default">
        <ProposedHomeHeader active={1} />
      </div>
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-4 pb-1 pt-3">
          <span className="text-text-tertiary typo-caption1">Updated 3 minutes ago</span>
          <ChannelPicker />
        </div>
        <HeadlineRows />
        <HeadlineRows />
      </div>
      <PickerSheet />
    </div>
  </Phone>
);

// B. Channel rail: the channels are cards inside the content (Apple News
// channels, YouTube's subscription rail), not a bar. Tapping one opens the
// channel as a leaf.
const tones = [
  'bg-accent-cabbage-default',
  'bg-accent-water-default',
  'bg-accent-cheese-default',
  'bg-accent-avocado-default',
  'bg-accent-bun-default',
  'bg-accent-onion-default',
];

export const ChannelRail = (): ReactElement => (
  <Frame
    header={
      <div className="bg-background-default">
        <ProposedHomeHeader active={1} />
      </div>
    }
  >
    <div className="map-scroll-none flex gap-2 overflow-hidden px-4 pb-3 pt-3">
      {channels.slice(1).map((channel, index) => (
        <span
          key={channel}
          className={classNames(
            'flex h-16 w-28 shrink-0 flex-col justify-end rounded-14 p-2 font-bold text-white typo-footnote',
            tones[index % tones.length],
          )}
        >
          {channel}
        </span>
      ))}
    </div>
    <HeadlineRows />
    <HeadlineRows />
  </Frame>
);

// C. Grouped list: one stream grouped under channel headers, with a small
// jump row that reads as an index, not as tabs (Apple Music Browse).
export const GroupedList = (): ReactElement => (
  <Frame
    header={
      <div className="bg-background-default">
        <ProposedHomeHeader active={1} />
      </div>
    }
  >
    {['Agentic', 'Security'].map((channel) => (
      <div key={channel} className="flex flex-col">
        <div className="flex items-center justify-between px-4 pb-1 pt-4">
          <span className="font-bold typo-title3">{channel}</span>
          <span className="flex items-center gap-1 text-text-tertiary typo-footnote">
            See all
            <ArrowIcon size={IconSize.XSmall} className="rotate-90" />
          </span>
        </div>
        <HeadlineRows />
      </div>
    ))}
  </Frame>
);

// D. Two rows, made different: the segments keep their underline; the
// channels drop to a quieter tone (caption size, no border, a tinted band)
// so the eye reads a bar and a filter, not two bars.
const QuietChips = ({ items, active = 0 }: { items: string[]; active?: number }): ReactElement => (
  <div className="map-scroll-none flex items-center gap-1 overflow-hidden bg-background-subtle px-3 py-2">
    {items.map((item, index) => (
      <span
        key={item}
        className={classNames(
          'flex h-7 shrink-0 items-center rounded-8 px-2 typo-caption1',
          index === active ? 'bg-text-primary font-bold text-surface-invert' : 'text-text-secondary',
        )}
      >
        {item}
      </span>
    ))}
  </div>
);

export const QuietSecondRow = (): ReactElement => (
  <Frame
    header={
      <div className="bg-background-default">
        <ProposedHomeHeader active={1} />
        <QuietChips items={channels} />
      </div>
    }
  >
    <HeadlineRows />
    <HeadlineRows />
  </Frame>
);

// E. Drill in: tapping Happening now a second time (or its chevron) swaps
// the segment row for the channel chips with an X to come back (Spotify's
// home filters). One row on screen at any time.
export const DrillIn = (): ReactElement => {
  const [open, setOpen] = useState(false);

  return (
    <Frame
      header={
        <div className="bg-background-default">
          {open ? (
            <div className="flex h-11 items-center gap-1.5 border-b border-border-subtlest-tertiary px-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-8 shrink-0 items-center justify-center rounded-10 bg-surface-float text-text-primary"
              >
                <MiniCloseIcon size={IconSize.Small} />
              </button>
              <span className="flex h-8 shrink-0 items-center rounded-10 bg-text-primary px-2.5 font-bold text-surface-invert typo-footnote">
                Happening now
              </span>
              {channels.slice(1).map((channel) => (
                <span key={channel} className="flex h-8 shrink-0 items-center rounded-10 border border-border-subtlest-tertiary px-2.5 font-bold text-text-secondary typo-footnote">
                  {channel}
                </span>
              ))}
            </div>
          ) : (
            <SegmentedRow
              segments={homeSegments}
              active={1}
              trailing={
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="ml-auto mr-2 flex h-8 items-center gap-1 rounded-10 border border-border-subtlest-tertiary px-2.5 text-text-secondary typo-footnote"
                >
                  Channels
                  <ArrowIcon size={IconSize.XSmall} className="rotate-90" />
                </button>
              }
            />
          )}
        </div>
      }
    >
      <HeadlineRows />
      <HeadlineRows />
    </Frame>
  );
};

// F. Its own page: Happening now leaves Home and becomes a leaf under
// Explore (or a Home card), where the channels are the page's segments and
// nothing sits above them but the floating buttons.
export const OwnPage = (): ReactElement => {
  const { p, onScroll } = useScrollProgress();

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-2 z-2">
          <LeafTop
            material={material}
            actions={
              <Circle material={material} fixed>
                <ShareIcon size={IconSize.Small} />
              </Circle>
            }
          />
        </div>
        <div onScroll={onScroll} className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-28 pt-16">
          <div className="flex flex-col px-4 pb-2">
            <h1 className="font-bold typo-title2">Happening now</h1>
            <span className="text-text-tertiary typo-footnote">Updated 3 minutes ago</span>
          </div>
          <div className="sticky top-0 z-1">
            <Segments items={channels} active={0} pinned={p > 0.3} />
          </div>
          <HeadlineRows />
          <HeadlineRows />
          <HeadlineRows />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <RootCluster material={material} p={p} active="Explore" />
        </div>
      </div>
    </Phone>
  );
};

// G. Home card: Happening now is not a segment at all. The For you feed
// opens with a compact module (three headlines, a channel strip inside the
// card) that links to the page in F.
export const HomeCard = (): ReactElement => (
  <Frame
    header={
      <div className="bg-background-default">
        <ProposedHomeHeader active={0} segments={['For you', 'Following']} />
      </div>
    }
  >
    <div className="mx-4 my-3 flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-3">
      <div className="flex items-center justify-between">
        <span className="font-bold typo-callout">Happening now</span>
        <span className="flex items-center gap-1 text-text-tertiary typo-footnote">
          All
          <ArrowIcon size={IconSize.XSmall} className="rotate-90" />
        </span>
      </div>
      {[
        'EU Cyber Resilience Act Article 14 reporting obligations now in effect',
        'Cloudflare launches its own public certificate authority',
        'Apple patches CoreGraphics zero-day exploited in targeted attacks',
      ].map((title) => (
        <span key={title} className="border-t border-border-subtlest-tertiary pt-2 typo-footnote">
          {title}
        </span>
      ))}
      <div className="map-scroll-none flex gap-1 overflow-hidden pt-1">
        {channels.slice(1).map((channel) => (
          <span key={channel} className="shrink-0 rounded-8 bg-surface-float px-2 py-0.5 text-text-secondary typo-caption1">
            {channel}
          </span>
        ))}
      </div>
    </div>
    <FeedList items={[posts[0], posts[1]]} />
  </Frame>
);

// H. The active segment is the picker (recommended): a chevron on the
// selected segment opens the channel sheet; the choice shows on the list
// header line with a clear control. One row, one URL (?channel=security),
// nothing added to the chrome.
export const SegmentMenu = ({ channel, open }: { channel?: string; open?: boolean }): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="relative z-2 shrink-0 bg-background-default">
        <ProposedHomeHeader active={1} menuIndex={1} />
      </div>
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        <ChannelLine channel={channel} />
        <HeadlineRows />
        <HeadlineRows />
      </div>
      {!open && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <RootCluster material={material} active="Home" />
        </div>
      )}
      {open && <PickerSheet />}
    </div>
  </Phone>
);
