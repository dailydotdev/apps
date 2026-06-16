import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import type { ItemInnerProps, SidebarMenuItem } from './common';
import { NavHeader, NavSection } from './common';
import { SidebarItem } from './SidebarItem';
import { ArrowIcon, PlusIcon } from '../icons';
import { IconSize } from '../Icon';
import type { SettingsFlags } from '../../graphql/settings';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { isNullOrUndefined } from '../../lib/func';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import Link from '../utilities/Link';

export interface SectionCommonProps
  extends Pick<ItemInnerProps, 'shouldShowLabel'> {
  sidebarExpanded: boolean;
  activePage: string;
  className?: string;
  flag?: keyof SettingsFlags;
  // v2 sidebar polish: hover-only collapse arrow + 1px item gap. Defaults to
  // the v1 always-visible arrow and no gap so the v1 sidebar is unchanged.
  compact?: boolean;
}

interface SectionProps extends SectionCommonProps {
  title?: string;
  items: SidebarMenuItem[];
  isItemsButton: boolean;
  isAlwaysOpenOnMobile?: boolean;
  onAdd?: () => void;
  addHref?: string;
}

export function Section({
  title,
  items,
  sidebarExpanded,
  shouldShowLabel,
  activePage,
  isItemsButton,
  className,
  flag,
  isAlwaysOpenOnMobile,
  onAdd,
  addHref,
  compact = false,
}: SectionProps): ReactElement {
  const { flags, updateFlag } = useSettingsContext();
  const { sidebarRendered } = useSidebarRendered();
  const shouldAlwaysBeVisible = isAlwaysOpenOnMobile && !sidebarRendered;
  const currentFlagValue = flag ? flags?.[flag] : undefined;
  // The collapse toggle only renders alongside a section `title`. Without a
  // title (e.g. the V2 sidebar's category panels) there is no way to
  // re-expand, so a persisted `false` flag set from a layout that did show the
  // toggle would strand the section permanently closed. Titleless sections are
  // always expanded.
  const initialIsVisible =
    !title || isNullOrUndefined(currentFlagValue) ? true : currentFlagValue;
  const isVisible = useRef(initialIsVisible);

  const toggleFlag = () => {
    const nextIsVisible = !isVisible.current;

    if (flag) {
      updateFlag(flag, nextIsVisible);
    }

    isVisible.current = nextIsVisible;
  };

  return (
    <NavSection className={classNames('group/section mt-1', className)}>
      {title && (
        <NavHeader className="relative hidden laptop:flex">
          {/* Divider shown when a collapsible (titled) section is collapsed */}
          <div
            className={classNames(
              'absolute inset-x-0 flex items-center justify-center px-2 transition-opacity duration-300',
              sidebarExpanded ? 'opacity-0' : 'opacity-100',
            )}
          >
            <hr className="w-full border-t border-border-subtlest-tertiary" />
          </div>
          {/* Header content shown when sidebar is expanded */}
          <div
            className={classNames(
              // `ml-3 mr-2 ... pl-1` aligns the section title's left edge
              // with the items below it (items have `mx-3`), so "Feeds v"
              // and the feed entries share the same x. Without this the
              // header was indented less than the items.
              'ml-3 mr-2 flex min-h-9 flex-1 items-center justify-between py-1.5 pl-1 transition-opacity duration-300',
              sidebarExpanded ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <button
              type="button"
              onClick={toggleFlag}
              aria-label={`Toggle ${title}`}
              aria-expanded={!!isVisible.current}
              aria-controls={flag ? `section-${flag}` : undefined}
              className="flex items-center gap-1 rounded-6 px-1 py-0.5 transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <span
                className={classNames(
                  'text-text-quaternary typo-callout',
                  !sidebarExpanded && 'opacity-0',
                )}
              >
                {title}
              </span>
              <ArrowIcon
                // `size` controls the real glyph dimensions — a w/h className
                // here loses to the Icon's size class (Tailwind resolves the
                // conflict by stylesheet order, not JSX order).
                size={compact ? IconSize.XXSmall : undefined}
                className={classNames(
                  'text-text-quaternary duration-200',
                  // v2: revealed only while hovering/focusing the section
                  // (header or its items) — see group/section above. v1 keeps
                  // the arrow always visible at its original size.
                  compact
                    ? 'opacity-0 transition-[transform,opacity] group-focus-within/section:opacity-100 group-hover/section:opacity-100'
                    : 'h-2.5 w-2.5 transition-transform',
                  isVisible.current ? 'rotate-180' : 'rotate-90',
                )}
              />
            </button>
            {addHref && (
              <Link href={addHref}>
                <a
                  aria-label={`Add to ${title}`}
                  className="flex h-6 w-6 items-center justify-center rounded-6 text-text-tertiary transition-all hover:bg-surface-hover hover:text-text-primary"
                >
                  <PlusIcon className="h-4 w-4" />
                </a>
              </Link>
            )}
            {!addHref && onAdd && (
              <button
                type="button"
                onClick={onAdd}
                aria-label={`Add to ${title}`}
                className="flex h-6 w-6 items-center justify-center rounded-6 text-text-tertiary transition-all hover:bg-surface-hover hover:text-text-primary"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </NavHeader>
      )}
      <div
        id={flag ? `section-${flag}` : undefined}
        className={classNames(
          'grid transition-[grid-template-rows,opacity] duration-300',
          // Collapsing only applies when there's a title (the header is the
          // only toggle). A flagged-but-title-less section — e.g. the Squads
          // and Saved panels — would otherwise get stuck hidden when its flag
          // is false, with no arrow to re-expand it.
          !title || isVisible.current || shouldAlwaysBeVisible
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div
          className={classNames(
            'flex min-h-0 flex-col overflow-hidden',
            compact && 'gap-px',
          )}
        >
          {items.map((item) => (
            <SidebarItem
              key={`${item.title}-${item.path}`}
              item={item}
              activePage={activePage}
              isItemsButton={isItemsButton}
              shouldShowLabel={shouldShowLabel}
            />
          ))}
        </div>
      </div>
    </NavSection>
  );
}
