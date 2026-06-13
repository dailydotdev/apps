import classNames from 'classnames';
import type { ReactElement } from 'react';
import React, { useRef } from 'react';
import type { ItemInnerProps, SidebarMenuItem } from './common';
import { NavHeader, NavSection } from './common';
import { SidebarItem } from './SidebarItem';
import { ArrowIcon, PlusIcon } from '../icons';
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
}: SectionProps): ReactElement {
  const { flags, updateFlag } = useSettingsContext();
  const { sidebarRendered } = useSidebarRendered();
  const shouldAlwaysBeVisible = isAlwaysOpenOnMobile && !sidebarRendered;
  const currentFlagValue = flag ? flags?.[flag] : undefined;
  const initialIsVisible = isNullOrUndefined(currentFlagValue)
    ? true
    : currentFlagValue;
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
          {/* Divider shown when sidebar is collapsed */}
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
                className={classNames(
                  // Smaller glyph, revealed only while hovering/focusing the
                  // section (header or its items) — see group/section above.
                  'h-2 w-2 text-text-quaternary opacity-0 transition-[transform,opacity] duration-200 group-focus-within/section:opacity-100 group-hover/section:opacity-100',
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
        <div className="flex min-h-0 flex-col gap-px overflow-hidden">
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
