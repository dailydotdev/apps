import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Drawer } from '../drawers/Drawer';
import { RootPortal } from '../tooltips/Portal';
import { Dropdown } from '../fields/Dropdown';
import { CalendarIcon } from '../icons';
import { IconSize } from '../Icon';
import { periodTexts } from '../layout/common';
import { useQueryState, QueryStateKeys } from '../../hooks/utils/useQueryState';
import { withoutLayoutVariantPrefix } from '../../lib/layoutVariant';
import type { RowItem } from './ShellRow';
import { MenuLabel, SheetChoice } from './ShellRow';

const sorts: { key: string; label: string; href: string; paths: string[] }[] = [
  {
    key: 'popular',
    label: 'Popular',
    href: '/posts',
    paths: ['/posts', '/popular'],
  },
  {
    key: 'upvoted',
    label: 'By upvotes',
    href: '/posts/upvoted',
    paths: ['/posts/upvoted', '/upvoted'],
  },
  {
    key: 'discussed',
    label: 'By comments',
    href: '/posts/discussed',
    paths: ['/posts/discussed', '/discussed'],
  },
  {
    key: 'latest',
    label: 'By date',
    href: '/posts/latest',
    paths: ['/posts/latest'],
  },
  {
    key: 'best-of',
    label: 'Best of',
    href: '/posts/best-of',
    paths: ['/posts/best-of'],
  },
];

const withPeriod = ['upvoted', 'discussed'];

// The Explore feed's order on a phone: a text menu on the feed's own line
// (reorder one list), with the period inside for the two sorts that have
// one. Replaces the sort tabs under the search row.
export function ExploreSortMenu(): ReactElement {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [period, setPeriod] = useQueryState({
    key: [QueryStateKeys.FeedPeriod],
    defaultValue: 0,
  });
  const pathname = withoutLayoutVariantPrefix(router.pathname);
  const current =
    sorts.find((sort) => sort.paths.includes(pathname)) ?? sorts[0];

  const items: RowItem[] = sorts.map((sort) => ({
    key: sort.key,
    label: sort.label,
    href: sort.href,
    active: sort.key === current.key,
    replace: true,
    onClick: () => setIsOpen(false),
  }));

  return (
    <div className="flex items-center justify-between px-3 pb-1 pt-2">
      <MenuLabel label={current.label} onClick={() => setIsOpen(true)} />
      {withPeriod.includes(current.key) && (
        <Dropdown
          iconOnly
          shouldIndicateSelected
          icon={<CalendarIcon size={IconSize.Medium} />}
          selectedIndex={period}
          options={periodTexts}
          drawerProps={{ displayCloseButton: true }}
          onChange={(_, index) => setPeriod(index)}
        />
      )}
      <RootPortal>
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Sort">
          <SheetChoice items={items} />
        </Drawer>
      </RootPortal>
    </div>
  );
}

export default ExploreSortMenu;
