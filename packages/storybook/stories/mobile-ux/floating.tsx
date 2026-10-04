import type { CSSProperties, ReactElement, ReactNode, UIEvent } from 'react';
import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';
import { HomeIcon } from '@dailydotdev/shared/src/components/icons/Home';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons/Search';
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { SquadIcon } from '@dailydotdev/shared/src/components/icons/Squad';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import { Avatar, Badge, FeedList, ProposedHomeHeader } from './mocks';
import { posts } from './data';

// The floating bar family: iOS 26 geometry (detached pill above the home
// indicator) with two materials and three sizes. Materials are inline styles
// because the DS has no glass token yet; the numbers here are the spec.

export enum BarMaterial {
  Glass = 'glass',
  Solid = 'solid',
}

export enum BarState {
  Rest = 'rest',
  Compact = 'compact',
  Collapsed = 'collapsed',
}

// Production's floating bar material (footer/common.ts blurClasses):
// the blur-baseline token (surface at 88%) over a 40px backdrop blur, a
// hairline ring, a soft shadow. No glass rim, no inner highlight.
const glass: CSSProperties = {
  background: 'var(--theme-blur-blur-baseline)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  boxShadow: [
    'inset 0 0 0 1px var(--theme-border-subtlest-tertiary)',
    '0 4px 30px rgb(0 0 0 / 0.12)',
  ].join(', '),
};

const solid: CSSProperties = {
  background: 'var(--theme-background-popover)',
  boxShadow: [
    'inset 0 0 0 1px var(--theme-border-subtlest-tertiary)',
    '0 1px 2px rgb(0 0 0 / 0.18)',
    '0 12px 32px -12px rgb(0 0 0 / 0.5)',
  ].join(', '),
};

export const materials: Record<BarMaterial, CSSProperties> = {
  [BarMaterial.Glass]: glass,
  [BarMaterial.Solid]: solid,
};

interface Item {
  label: string;
  icon?: typeof HomeIcon;
  create?: boolean;
  avatar?: boolean;
  badge?: boolean;
}

const items: Item[] = [
  { label: 'Home', icon: HomeIcon },
  { label: 'Explore', icon: SearchIcon },
  { label: 'Create', create: true },
  { label: 'Activity', icon: BellIcon, badge: true },
  { label: 'You', avatar: true },
];

const ItemIcon = ({
  item,
  active,
  compact,
}: {
  item: Item;
  active: boolean;
  compact?: boolean;
}): ReactElement | null => {
  if (item.create) {
    return (
      <span
        className={classNames(
          'flex items-center justify-center rounded-max bg-text-primary text-surface-invert transition-all',
          compact ? 'size-8' : 'size-10',
        )}
      >
        <PlusIcon size={IconSize.Small} />
      </span>
    );
  }

  if (item.avatar) {
    return <Avatar size={compact ? 22 : 26} ring={active} />;
  }

  const Icon = item.icon;

  if (!Icon) {
    return null;
  }

  return (
    <span className="relative">
      <Icon size={IconSize.Medium} secondary={active} />
      {item.badge && <Badge />}
    </span>
  );
};

export const FloatingBar = ({
  material = BarMaterial.Glass,
  state = BarState.Rest,
  active = 'Home',
  className,
}: {
  material?: BarMaterial;
  state?: BarState;
  active?: string;
  className?: string;
}): ReactElement => {
  if (state === BarState.Collapsed) {
    const item = items.find((entry) => entry.label === active) ?? items[0];

    return (
      <div className={classNames('flex justify-start px-3', className)}>
        <nav
          style={materials[material]}
          className="flex h-11 items-center gap-2 rounded-max px-4 text-text-primary transition-all"
        >
          <ItemIcon item={item} active compact />
          <span className="font-bold typo-footnote">{item.label}</span>
        </nav>
      </div>
    );
  }

  const compact = state === BarState.Compact;

  return (
    <div className={classNames('px-3', className)}>
      <nav
        style={materials[material]}
        className={classNames(
          'grid auto-cols-fr grid-flow-col items-center rounded-max px-1 transition-all',
          compact ? 'h-12' : 'h-[3.75rem]',
        )}
      >
        {items.map((item) => {
          const isActive = item.label === active;

          return (
            <span
              key={item.label}
              className={classNames(
                'flex flex-col items-center justify-center gap-0.5',
                isActive ? 'text-text-primary' : 'text-text-tertiary',
              )}
            >
              <ItemIcon item={item} active={isActive} compact={compact} />
              {!compact && !item.create && (
                <span className="typo-caption2">{item.label}</span>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
};

// A phone whose feed really scrolls: the bar goes compact after 24px of
// downward travel and returns on any upward travel, the header brand row
// hides and shows on the same signal.
export const FloatingDemo = ({
  material = BarMaterial.Glass,
  minimizeTo = BarState.Compact,
  height = 780,
}: {
  material?: BarMaterial;
  minimizeTo?: BarState;
  height?: number;
}): ReactElement => {
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const anchorY = useRef(0);

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    const goingDown = scrollTop > lastY.current;

    if (goingDown !== scrollTop > anchorY.current) {
      anchorY.current = lastY.current;
    }

    if (scrollTop <= 8) {
      setScrolled(false);
    } else if (goingDown && scrollTop - anchorY.current > 24) {
      setScrolled(true);
    } else if (!goingDown && anchorY.current - scrollTop > 8) {
      setScrolled(false);
    }

    lastY.current = scrollTop;
  }, []);

  return (
    <Phone browser={BrowserChrome.None} height={height}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="relative z-2 shrink-0">
          <ProposedHomeHeader progress={scrolled ? 1 : 0} />
        </div>
        <div
          onScroll={onScroll}
          className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-24"
        >
          <FeedList items={[...posts, ...posts, ...posts]} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-2">
          <FloatingBar
            material={material}
            state={scrolled ? minimizeTo : BarState.Rest}
          />
        </div>
      </div>
    </Phone>
  );
};

export const FloatingScreen = ({
  material = BarMaterial.Glass,
  state = BarState.Rest,
  active = 'Home',
  header,
  children,
}: {
  material?: BarMaterial;
  state?: BarState;
  active?: string;
  header?: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      {header && <div className="relative z-2 shrink-0">{header}</div>}
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        {children ?? <FeedList />}
      </div>
      <div className="absolute inset-x-0 bottom-3 z-2">
        <FloatingBar material={material} state={state} active={active} />
      </div>
    </div>
  </Phone>
);

// Apple layout: places in the capsule, the one action detached on the right
// like the iOS 26 Search role (Photos, Music, App Store). Profile is not a
// tab; it is the avatar in the brand row. Numbers live in `appleSpec` so the
// whole family can be tuned from one place.
export const appleSpec = {
  height: 56,
  compactHeight: 44,
  sideInset: 12,
  gap: 8,
  iconLabelGap: 2,
  selectedInset: 4,
};

const appleItems: Item[] = [
  { label: 'Home', icon: HomeIcon },
  { label: 'Explore', icon: SearchIcon },
  { label: 'Squads', icon: SquadIcon },
  { label: 'Activity', icon: BellIcon, badge: true },
];

export const selectedCapsule: CSSProperties = {
  background: 'color-mix(in srgb, var(--theme-text-primary) 8%, transparent)',
  boxShadow: 'inset 0 1px 0 0 rgb(255 255 255 / 0.08)',
};

export const AppleBar = ({
  material = BarMaterial.Glass,
  state = BarState.Rest,
  active = 'Home',
  className,
}: {
  material?: BarMaterial;
  state?: BarState;
  active?: string;
  className?: string;
}): ReactElement => {
  const compact = state !== BarState.Rest;
  const height = compact ? appleSpec.compactHeight : appleSpec.height;
  const visible =
    state === BarState.Collapsed
      ? appleItems.filter((item) => item.label === active)
      : appleItems;

  return (
    <div
      className={classNames('flex items-end', className)}
      style={{ paddingInline: appleSpec.sideInset, gap: appleSpec.gap }}
    >
      <nav
        style={{ ...materials[material], height }}
        className={classNames(
          'flex items-stretch rounded-max p-1 transition-all',
          state === BarState.Collapsed ? 'shrink-0' : 'flex-1',
        )}
      >
        {visible.map((item) => {
          const isActive = item.label === active;

          return (
            <span
              key={item.label}
              style={isActive ? selectedCapsule : undefined}
              className={classNames(
                'flex flex-1 flex-col items-center justify-center rounded-max transition-all',
                state === BarState.Collapsed ? 'px-5' : 'px-2',
                isActive ? 'text-text-primary' : 'text-text-tertiary',
              )}
            >
              <ItemIcon item={item} active={isActive} compact />
              {!compact && (
                <span
                  className="font-bold typo-caption2"
                  style={{ marginTop: appleSpec.iconLabelGap }}
                >
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
      <span
        style={{ ...materials[material], width: height, height }}
        className="flex shrink-0 items-center justify-center rounded-max text-text-primary transition-all"
      >
        <PlusIcon size={compact ? IconSize.Medium : IconSize.Large} />
      </span>
    </div>
  );
};

export const AppleDemo = ({
  material = BarMaterial.Glass,
  minimizeTo = BarState.Compact,
  height = 780,
}: {
  material?: BarMaterial;
  minimizeTo?: BarState;
  height?: number;
}): ReactElement => {
  const [scrolled, setScrolled] = useState(false);
  const lastY = useRef(0);
  const anchorY = useRef(0);

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    const goingDown = scrollTop > lastY.current;

    if (goingDown !== scrollTop > anchorY.current) {
      anchorY.current = lastY.current;
    }

    if (scrollTop <= 8) {
      setScrolled(false);
    } else if (goingDown && scrollTop - anchorY.current > 24) {
      setScrolled(true);
    } else if (!goingDown && anchorY.current - scrollTop > 8) {
      setScrolled(false);
    }

    lastY.current = scrollTop;
  }, []);

  return (
    <Phone browser={BrowserChrome.None} height={height}>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="relative z-2 shrink-0">
          <ProposedHomeHeader progress={scrolled ? 1 : 0} />
        </div>
        <div
          onScroll={onScroll}
          className="map-scroll-none min-h-0 flex-1 overflow-y-auto pb-24"
        >
          <FeedList items={[...posts, ...posts, ...posts]} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-2">
          <AppleBar
            material={material}
            state={scrolled ? minimizeTo : BarState.Rest}
          />
        </div>
      </div>
    </Phone>
  );
};

export const AppleScreen = ({
  material = BarMaterial.Glass,
  state = BarState.Rest,
  active = 'Home',
  header,
  children,
}: {
  material?: BarMaterial;
  state?: BarState;
  active?: string;
  header?: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      {header && <div className="relative z-2 shrink-0">{header}</div>}
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        {children ?? <FeedList />}
      </div>
      <div className="absolute inset-x-0 bottom-2 z-2">
        <AppleBar material={material} state={state} active={active} />
      </div>
    </div>
  </Phone>
);
