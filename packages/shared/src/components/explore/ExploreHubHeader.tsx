import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import Link from '../utilities/Link';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';
import { useChipBarNavigation } from './useChipBarNavigation';

interface ExploreHubTab {
  id: string;
  label: string;
  href: string;
  // Pathname prefixes that mark this tab active.
  match: string[];
}

const HUB_TABS: ExploreHubTab[] = [
  {
    id: 'stories',
    label: 'Stories',
    href: `${webappUrl}posts`,
    match: ['/posts', '/discussed'],
  },
  {
    id: 'topics',
    label: 'Topics',
    href: `${webappUrl}tags`,
    match: ['/tags', '/explore'],
  },
  {
    id: 'sources',
    label: 'Sources',
    href: `${webappUrl}sources`,
    match: ['/sources'],
  },
  {
    id: 'people',
    label: 'People',
    href: `${webappUrl}users`,
    match: ['/users'],
  },
];

interface ExploreHubHeaderProps {
  className?: string;
}

// The primary navigation for the unified Explore hub. It sits above each
// discovery surface (Stories / Topics / Sources / People) so they read as one
// place, while each page keeps its own route and secondary controls.
export function ExploreHubHeader({
  className,
}: ExploreHubHeaderProps): ReactElement {
  const router = useRouter();
  const { ref, onKeyDown } = useChipBarNavigation();

  const activeId = useMemo(() => {
    const path = (router.pathname || '').split('?')[0];
    const match = HUB_TABS.find((tab) =>
      tab.match.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`),
      ),
    );
    return match?.id;
  }, [router.pathname]);

  return (
    <div
      className={classNames(
        'relative w-full border-b border-border-subtlest-tertiary',
        className,
      )}
    >
      <nav aria-label="Explore">
        <div
          ref={ref}
          onKeyDown={onKeyDown}
          role="toolbar"
          aria-orientation="horizontal"
          className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2 pr-12"
        >
          {HUB_TABS.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <Link key={tab.id} href={tab.href} legacyBehavior>
                <Button
                  tag="a"
                  href={tab.href}
                  aria-current={isActive ? 'page' : undefined}
                  pressed={isActive}
                  size={ButtonSize.Medium}
                  variant={
                    isActive ? ButtonVariant.Float : ButtonVariant.Tertiary
                  }
                >
                  {tab.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-r from-transparent to-background-default"
      />
    </div>
  );
}
