import type { ReactElement, ReactNode, UIEvent } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import { SortIcon } from '@dailydotdev/shared/src/components/icons/Sort';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { FeedList, HeadlineRows, Logo, SegmentedRow, StreakPill, Avatar } from './mocks';
import { BarMaterial } from './floating';
import { Circle, EdgeStyle, LeafTop, RootCluster, TopEdge, chromeSpec } from './chrome';
import { Chips, RootTitleRow, Segments, activityTypes } from './tabMocks';
import { posts } from './data';

// Hide on scroll, X's model: reading down hides the top chrome; any short
// scroll up brings it back, wherever you are in the page. The progress
// value is direction-driven (down adds, up subtracts), scrubs 1:1 with the
// finger over `distance`, and is clamped to 0 inside the dead zone at the
// top so the chrome never hides while the page start is on screen.

const material = BarMaterial.Glass;

export const hideSpec = {
  distance: 64,
  deadZone: 96,
  revealTolerance: 8,
  hideTolerance: 24,
};

export const useHideProgress = (): {
  p: number;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
} => {
  const [p, setP] = useState(0);
  const lastY = useRef(0);
  const target = useRef(0);
  const armed = useRef(0);

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    const delta = scrollTop - lastY.current;
    lastY.current = scrollTop;

    if (scrollTop <= hideSpec.deadZone) {
      target.current = 0;
      armed.current = 0;
    } else {
      // A small tolerance in each direction so scroll jitter does not flip
      // the chrome; past it the chrome scrubs 1:1 with the finger.
      armed.current += delta;
      const tolerance = delta > 0 ? hideSpec.hideTolerance : hideSpec.revealTolerance;
      if (Math.abs(armed.current) > tolerance) {
        target.current = Math.min(1, Math.max(0, target.current + delta / hideSpec.distance));
      }
      if (Math.sign(armed.current) !== Math.sign(delta)) {
        armed.current = delta;
      }
    }

    setP(target.current);
  }, []);

  return { p, onScroll };
};

export enum ButtonsMode {
  Stay = 'stay',
  Hide = 'hide',
}

export enum ClusterMode {
  Shrink = 'shrink',
  Hide = 'hide',
}

const Bottom = ({
  p,
  mode,
  active,
}: {
  p: number;
  mode: ClusterMode;
  active: string;
}): ReactElement => (
  <div
    className="pointer-events-none absolute inset-x-0 bottom-2 z-2"
    style={
      mode === ClusterMode.Hide
        ? { transform: `translateY(${(chromeSpec.rest + 24) * p}px)`, opacity: 1 - Math.min(1, p * 1.3) }
        : undefined
    }
  >
    <RootCluster material={material} p={mode === ClusterMode.Shrink ? p : 0} active={active} />
  </div>
);

// A root: the top block (brand row + the page's row) is one unit that
// slides up out of the screen as one and comes back as one.
export const RootHideDemo = ({
  header,
  headerHeight,
  cluster = ClusterMode.Shrink,
  active = 'Home',
  children,
}: {
  header: ReactNode;
  headerHeight: number;
  cluster?: ClusterMode;
  active?: string;
  children: ReactNode;
}): ReactElement => {
  const { p, onScroll } = useHideProgress();

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className="absolute inset-x-0 top-0 z-2 bg-background-default"
          style={{ transform: `translateY(${-headerHeight * p}px)` }}
        >
          {header}
        </div>
        <div
          onScroll={onScroll}
          style={{ paddingTop: headerHeight }}
          className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-28"
        >
          {children}
        </div>
        <Bottom p={p} mode={cluster} active={active} />
      </div>
    </Phone>
  );
};

export const HomeHideDemo = ({ cluster }: { cluster?: ClusterMode }): ReactElement => (
  <RootHideDemo
    headerHeight={48 + 44}
    cluster={cluster}
    header={
      <>
        <div className="flex h-12 items-center justify-between px-4">
          <Logo />
          <span className="flex items-center gap-2">
            <StreakPill />
            <Avatar size={30} />
          </span>
        </div>
        <SegmentedRow active={0} menuIndex={undefined} />
      </>
    }
  >
    <FeedList items={[...posts, ...posts, ...posts, ...posts]} />
  </RootHideDemo>
);

export const ActivityHideDemo = ({ cluster }: { cluster?: ClusterMode }): ReactElement => (
  <RootHideDemo
    headerHeight={48 + 44}
    cluster={cluster}
    active="Activity"
    header={
      <>
        <RootTitleRow title="Activity" trailing={<BellIcon size={IconSize.Medium} className="text-text-secondary" />} />
        <Chips items={activityTypes} active={0} />
      </>
    }
  >
    <FeedList items={[...posts, ...posts, ...posts, ...posts]} compact />
  </RootHideDemo>
);

// A leaf: the pinned segments hide with the scroll; the floating buttons
// and the title either stay (Safari's model) or go with them (X's model).
export const LeafHideDemo = ({
  buttons = ButtonsMode.Stay,
  cluster = ClusterMode.Shrink,
}: {
  buttons?: ButtonsMode;
  cluster?: ClusterMode;
}): ReactElement => {
  const { p, onScroll } = useHideProgress();
  const band = chromeSpec.topButton + 14;
  const blockShift = buttons === ButtonsMode.Hide ? band + 44 : 0;

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className="absolute inset-x-0 top-0 z-2"
          style={{ transform: `translateY(${-blockShift * p}px)` }}
        >
          <TopEdge height={band + 44 * (1 - p)} opacity={1} style={EdgeStyle.Soft} />
          <div className="pointer-events-none relative z-2 pt-2">
            <LeafTop
              material={material}
              title="Bookmarks"
              actions={
                <>
                  <Circle material={material} fixed>
                    <SortIcon size={IconSize.Small} />
                  </Circle>
                  <Circle material={material} fixed>
                    <MenuIcon size={IconSize.Small} />
                  </Circle>
                </>
              }
            />
          </div>
          <div
            className="relative z-1"
            style={{ marginTop: 6, opacity: 1 - Math.min(1, p * 1.5), transform: `translateY(${-16 * p}px)` }}
          >
            <Segments items={['Quick saves', 'Read it later', 'Frontend picks']} transparent />
          </div>
        </div>
        <div
          onScroll={onScroll}
          style={{ paddingTop: band + 44 }}
          className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-28"
        >
          <FeedList items={[...posts, ...posts, ...posts, ...posts]} compact />
        </div>
        <Bottom p={p} mode={cluster} active="Home" />
      </div>
    </Phone>
  );
};

// Static frames of the Home root at rest, half hidden and hidden, for the
// spec and the decision.
export const HideStill = ({ p, label }: { p: number; label?: string }): ReactElement => {
  const headerHeight = 92;

  return (
    <div className="flex flex-col gap-2">
      <Phone browser={BrowserChrome.None} height={420}>
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            className="absolute inset-x-0 top-0 z-2 bg-background-default"
            style={{ transform: `translateY(${-headerHeight * p}px)` }}
          >
            <div className="flex h-12 items-center justify-between px-4">
              <Logo />
              <span className="flex items-center gap-2">
                <StreakPill />
                <Avatar size={30} />
              </span>
            </div>
            <SegmentedRow active={1} />
          </div>
          <div style={{ paddingTop: headerHeight * (1 - p) }} className="map-scroll-none min-h-0 flex-1 overflow-hidden">
            <HeadlineRows />
            <HeadlineRows />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
            <RootCluster material={material} p={p} active="Home" />
          </div>
        </div>
      </Phone>
      {label && <span className={classNames('text-text-tertiary typo-footnote')}>{label}</span>}
    </div>
  );
};
