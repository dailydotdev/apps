import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { FeedList, Logo, SegmentedRow } from './mocks';
import { BarMaterial, materials } from './floating';
import { Circle, RootCluster, chromeSpec, useScrollProgress } from './chrome';
import { PageStill } from './gallery';
import { posts } from './data';

// The header for visitors (logged out). Production shows a row with the
// logo, "Log in" and "Open app" on roots and "‹ Title · Log in · Open app"
// on leaves. Under the system the same two actions take the place the
// streak and avatar have for members: flat in the brand row on roots,
// floating beside the back button on leaves.

const material = BarMaterial.Glass;

export enum VisitorButtonLook {
  Flat = 'flat',
  Floating = 'floating',
}

const TextButton = ({
  children,
  filled,
  look,
  className,
}: {
  children: ReactNode;
  filled?: boolean;
  look: VisitorButtonLook;
  className?: string;
}): ReactElement => (
  <span
    style={{
      height: chromeSpec.topButton,
      borderRadius: chromeSpec.topRadius,
      ...(look === VisitorButtonLook.Floating && !filled ? materials[material] : {}),
    }}
    className={classNames(
      'flex shrink-0 items-center px-3 font-bold typo-footnote',
      filled ? 'bg-text-primary text-surface-invert' : 'text-text-primary',
      look === VisitorButtonLook.Flat && !filled && 'bg-surface-float',
      className,
    )}
  >
    {children}
  </span>
);

export const VisitorActions = ({
  look = VisitorButtonLook.Flat,
}: {
  look?: VisitorButtonLook;
}): ReactElement => (
  <span className="flex items-center" style={{ gap: chromeSpec.gap }}>
    <TextButton look={look}>Log in</TextButton>
    <TextButton look={look} filled>
      Open app
    </TextButton>
  </span>
);

export const visitorSegments = ['Popular', 'Happening now', 'Discussions'];

// Roots: the brand row carries the two visitor actions where members see
// the streak and the avatar, and slides away on scroll the same way.
export const VisitorHomeHeader = ({
  progress = 0,
  active = 0,
}: {
  progress?: number;
  active?: number;
}): ReactElement => {
  const brandHeight = 48;
  const p = progress;

  return (
    <div className="bg-background-default">
      <div style={{ height: brandHeight * (1 - p) }} className="relative overflow-hidden">
        <div
          style={{
            height: brandHeight,
            transform: `translateY(${-brandHeight * p}px)`,
            opacity: 1 - Math.min(1, p * 1.5),
          }}
          className="flex items-center justify-between px-4"
        >
          <Logo />
          <VisitorActions />
        </div>
      </div>
      <SegmentedRow
        segments={visitorSegments}
        active={active}
      />
    </div>
  );
};

// Leaves: back button left, Log in and Open app right, all fixed and the
// same 38px height and 14px radius as every top button.
export const VisitorLeafTop = (): ReactElement => (
  <div
    className="pointer-events-none flex items-center justify-between"
    style={{ paddingInline: chromeSpec.topInset, gap: chromeSpec.gap }}
  >
    <Circle material={material} fixed className="pointer-events-auto">
      <ArrowIcon size={IconSize.Small} className="-rotate-90" />
    </Circle>
    <span className="pointer-events-auto">
      <VisitorActions look={VisitorButtonLook.Floating} />
    </span>
  </div>
);

export const VisitorHomeDemo = (): ReactElement => {
  const { p, onScroll } = useScrollProgress();

  return (
    <Phone browser={BrowserChrome.None}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="relative z-2 shrink-0">
          <VisitorHomeHeader progress={p} />
        </div>
        <div onScroll={onScroll} className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-28">
          <FeedList items={[...posts, ...posts, ...posts]} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <RootCluster material={material} p={p} active="Home" />
        </div>
      </div>
    </Phone>
  );
};

const TagLeafContent = (): ReactElement => (
  <>
    <div className="flex flex-col gap-2 px-4 pb-3">
      <div className="flex flex-col gap-0.5">
        <h1 className="font-bold typo-title2">React</h1>
        <span className="text-text-tertiary typo-footnote">Tag · 44.4K stories</span>
      </div>
      <p className="text-text-secondary typo-callout">
        React news and updates for the JavaScript library used to build user
        interfaces from composable components.
      </p>
      <span className="flex h-11 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">
        Follow
      </span>
    </div>
    <FeedList items={[posts[0], posts[2], posts[1]]} compact />
  </>
);

// Variant A (recommended): floating pair beside the back button.
export const VisitorLeafStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-2 z-2">
        <VisitorLeafTop />
      </div>
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden pt-16">
        <TagLeafContent />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
        <RootCluster material={material} active="Explore" />
      </div>
    </div>
  </Phone>
);

// Variant B: today's flat row, tidied. Back, Log in and Open app share a
// pinned 48px row; nothing floats, so leaves and roots have different tops.
export const VisitorFlatLeafStill = (): ReactElement => (
  <PageStill
    kind="root"
    active="Explore"
    header={
      <div className="flex h-12 items-center justify-between border-b border-border-subtlest-tertiary bg-background-default px-4">
        <span className="flex size-8 items-center justify-center text-text-primary">
          <ArrowIcon size={IconSize.Small} className="-rotate-90" />
        </span>
        <VisitorActions />
      </div>
    }
  >
    <div className="pt-3">
      <TagLeafContent />
    </div>
  </PageStill>
);

// Variant C: the visitor bar. The top keeps only the back button and the
// bottom cluster becomes Log in · Open app, so the two actions sit under the
// thumb and the tab bar is not offered to someone who cannot use half of it.
const VisitorBar = (): ReactElement => (
  <div className="flex" style={{ paddingInline: chromeSpec.inset, gap: chromeSpec.gap }}>
    <span
      style={{ height: chromeSpec.rest, borderRadius: chromeSpec.restRadius, ...materials[material] }}
      className="flex flex-1 items-center justify-center font-bold typo-callout"
    >
      Log in
    </span>
    <span
      style={{ height: chromeSpec.rest, borderRadius: chromeSpec.restRadius }}
      className="flex flex-1 items-center justify-center bg-text-primary font-bold text-surface-invert typo-callout"
    >
      Open app
    </span>
  </div>
);

export const VisitorBarLeafStill = (): ReactElement => (
  <PageStill
    kind="leaf"
    top={
      <>
        <Circle material={material} fixed>
          <ShareIcon size={IconSize.Small} />
        </Circle>
        <Circle material={material} fixed>
          <MenuIcon size={IconSize.Small} />
        </Circle>
      </>
    }
    bottom={<VisitorBar />}
  >
    <TagLeafContent />
  </PageStill>
);
