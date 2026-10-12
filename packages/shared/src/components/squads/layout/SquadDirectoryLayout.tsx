import type { ComponentProps, PropsWithChildren, ReactElement } from 'react';
import React, { useEffect, useId } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { BaseFeedPage } from '../../utilities';
import { useSquadNavigation } from '../../../hooks';
import { Origin } from '../../../lib/log';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from './SquadDirectoryNavbar';
import { ShellPage } from '../../shell/ShellPageContext';
import { ShellSquare } from '../../shell/ShellSquare';
import { IconSize } from '../../Icon';
import { useViewSizeClient, ViewSize } from '../../../hooks/useViewSize';
import { Chips, ShellRow } from '../../shell/ShellRow';
import { PlusIcon } from '../../icons/Plus';
import { SearchIcon } from '../../icons/Search';
import { useSquadDirectoryLayout } from './useSquadDirectoryLayout';
import { useLayoutVariant } from '../../../hooks/layout/useLayoutVariant';
import { pageHeaderClassName } from '../../layout/PageHeader';
import { PublicPageSignupBanner } from '../../auth/PublicPageSignupBanner';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useSpotlight } from '../../spotlight/SpotlightContext';
import { SpotlightScope } from '../../spotlight/types';

type SquadDirectoryLayoutProps = PropsWithChildren & ComponentProps<'section'>;

// The directory's navigation: search leads the tab row (Discover, My Squads,
// Featured, every topic) and a quiet New Squad closes it. There is no page
// title, the selected tab already names the page.
export const SquadDirectoryLayout = (
  props: SquadDirectoryLayoutProps,
): ReactElement => {
  const { children, className, ...attrs } = props;
  const id = useId();
  const { pathname, asPath } = useRouter();
  const { tabs } = useSquadDirectoryLayout();
  const { isV2 } = useLayoutVariant();
  const isLaptop = useViewSizeClient(ViewSize.Laptop);
  const { user } = useAuthContext();
  const { openWithScope } = useSpotlight();
  const { openNewSquad } = useSquadNavigation();
  const isActive = (path: string) => path === pathname || path === asPath;
  const activeIndex = tabs.findIndex(({ path }) => isActive(path));
  const tabId = (index: number) => `squad-directory-tab-${index}-${id}`;
  const onSearch = () => openWithScope(SpotlightScope.Squads);
  const onNewSquad = () => openNewSquad({ origin: Origin.SquadDirectory });

  useEffect(() => {
    if (activeIndex < 0) {
      return;
    }

    document
      .getElementById(tabId(activeIndex))
      ?.scrollIntoView?.({ block: 'nearest', inline: 'center' });
    // The ids only change with the tab set, which the index already follows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <>
      <header
        className={classNames(
          'hidden tablet:flex',
          isV2
            ? [pageHeaderClassName, 'gap-4 !py-0']
            : 'items-center gap-1 border-b border-border-subtlest-tertiary px-2 laptop:gap-4 laptop:px-6',
        )}
      >
        <div className="shrink-0 py-2">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            icon={<SearchIcon />}
            aria-label="Search Squads"
            onClick={onSearch}
          />
        </div>
        <SquadDirectoryNavbar className="!mx-0 min-w-0 flex-1 !border-0 !px-0">
          {tabs.map(({ label, path }, index) => (
            <SquadDirectoryNavbarItem
              key={path}
              buttonSize={
                isLaptop === false ? ButtonSize.XSmall : ButtonSize.Small
              }
              elementProps={{ id: tabId(index) }}
              isActive={index === activeIndex}
              label={label}
              path={path}
            />
          ))}
        </SquadDirectoryNavbar>
        <div className="shrink-0 py-2">
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Subtle}
            icon={<PlusIcon />}
            aria-label="New Squad"
            onClick={onNewSquad}
            className="laptop:!hidden"
          />
          <Button
            type="button"
            size={ButtonSize.Small}
            variant={ButtonVariant.Subtle}
            icon={<PlusIcon />}
            onClick={onNewSquad}
            className="!hidden laptop:!flex"
          >
            New Squad
          </Button>
        </div>
      </header>
      <ShellPage
        title="Squads"
        actions={
          <>
            <ShellSquare aria-label="Search Squads" onClick={onSearch}>
              <SearchIcon size={IconSize.Small} />
            </ShellSquare>
            {!!user && (
              <ShellSquare aria-label="New Squad" onClick={onNewSquad}>
                <PlusIcon size={IconSize.Small} />
              </ShellSquare>
            )}
          </>
        }
        row={
          <ShellRow>
            <Chips
              items={tabs.map(({ label, path }, index) => ({
                key: path,
                label,
                href: path,
                active: index === activeIndex,
              }))}
            />
          </ShellRow>
        }
      />
      <BaseFeedPage className="relative mb-4">
        <section
          {...attrs}
          className={classNames('flex w-full flex-col', className)}
        >
          {children}
        </section>
        <PublicPageSignupBanner />
      </BaseFeedPage>
    </>
  );
};
