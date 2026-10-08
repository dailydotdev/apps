import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { restoreScrollPosition } from '../../lib/scrollRestoration';
import { Drawer } from '../drawers/Drawer';
import { RootPortal } from '../tooltips/Portal';
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

// Each sort is its own page, so the feed under the places is rebuilt and
// the document is short for a moment. The reader's place is put back once
// the new page has grown to it, instead of leaving them above the rows.
const holdScroll = (
  router: NextRouter,
  position: number,
  href: string,
): void => {
  let letGo = () => undefined;
  const restore = (url: string) => {
    letGo();
    if (url.split(/[?#]/)[0] === href) {
      restoreScrollPosition(position);
    }
  };
  letGo = () => {
    router.events.off('routeChangeComplete', restore);
    router.events.off('routeChangeError', letGo);
  };
  router.events.on('routeChangeComplete', restore);
  router.events.on('routeChangeError', letGo);
};

export function ExploreSortMenu(): ReactElement {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const scrollBefore = useRef(0);
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
    keepScroll: true,
    onClick: () => {
      setIsOpen(false);
      if (sort.key !== current.key) {
        holdScroll(router, scrollBefore.current, sort.href);
      }
    },
  }));

  const hasPeriod = withPeriod.includes(current.key);

  return (
    <div className="flex items-center px-3 py-1">
      <div className="flex items-center gap-1">
        <MenuLabel
          label={
            hasPeriod
              ? `${current.label} · ${periodTexts[period]}`
              : current.label
          }
          onClick={() => {
            scrollBefore.current = window.scrollY;
            setIsOpen(true);
          }}
        />
      </div>
      <RootPortal>
        <Drawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Sort"
          className={{ drawer: 'py-1' }}
        >
          <SheetChoice items={items} />
          {hasPeriod && (
            <>
              <h3 className="border-t border-border-subtlest-tertiary px-4 pb-1 pt-4 text-text-tertiary typo-footnote">
                Period
              </h3>
              <SheetChoice
                items={periodTexts.map((text, index) => ({
                  key: text,
                  label: text,
                  active: index === period,
                  onClick: () => {
                    setPeriod(index);
                    setIsOpen(false);
                  },
                }))}
              />
            </>
          )}
        </Drawer>
      </RootPortal>
    </div>
  );
}
