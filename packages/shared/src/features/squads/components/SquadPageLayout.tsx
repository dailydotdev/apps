import type { ReactElement, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import { ButtonSize } from '../../../components/buttons/Button';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../../../components/squads/layout/SquadDirectoryNavbar';
import { SquadPreviewNotice } from './widgets/SquadPreview';
import { SquadWidgets } from './widgets/SquadWidgets';
import { SquadPageTabsProvider } from '../SquadPageTabsContext';
import { useIsPhone } from '../../../hooks/useViewSize';
import { ShellDockedRow } from '../../../components/shell/ShellPageContext';
import { Segments, ShellRow } from '../../../components/shell/ShellRow';
import { usePassedBlock } from '../../../components/shell/usePassedBlock';

enum SquadPageTab {
  Posts = 'Posts',
  Jobs = 'Jobs',
  About = 'About',
}

// Jobs and About have their own address, the same page with that tab open
const tabSegments: Partial<Record<SquadPageTab, string>> = {
  [SquadPageTab.Jobs]: 'jobs',
  [SquadPageTab.About]: 'about',
};

const getPathTab = (
  path: string,
): { squadPath: string; requestedTab: SquadPageTab } => {
  const [, squadPath, segment] =
    path.match(/^(.*\/squads\/[^/]+)(?:\/([^/]+))?$/) ?? [];
  const requestedTab = (Object.keys(tabSegments) as SquadPageTab[]).find(
    (tab) => tabSegments[tab] === segment,
  );

  return requestedTab
    ? { squadPath, requestedTab }
    : { squadPath: path, requestedTab: SquadPageTab.Posts };
};

interface SquadPageLayoutProps {
  /** The card's top: the profile header on the page, a title bar elsewhere. */
  header: ReactNode;
  /** Sits under the header on every width, above the tabs below laptop. */
  belowHeader?: ReactNode;
  children: ReactNode;
  /**
   * Below laptop the right column moves behind an About tab beside Posts.
   * It stays in the DOM either way, since crawlers read the phone render.
   */
  hasAboutTab?: boolean;
  /**
   * A verified squad's jobs board, a Jobs tab beside Posts. From laptop the
   * tabs sit over the feed; below laptop they join the About tab.
   */
  jobs?: ReactNode;
}

// One right column for every width: from laptop it sits beside the card,
// below laptop the card's wrapper dissolves (`contents`) so the column can
// be ordered between the tabs and the posts.
export const SquadPageLayout = ({
  header,
  belowHeader,
  children,
  hasAboutTab = false,
  jobs,
}: SquadPageLayoutProps): ReactElement => {
  const router = useRouter();
  const path = (router?.asPath ?? '').split(/[?#]/)[0];
  const tabs = [
    SquadPageTab.Posts,
    ...(jobs ? [SquadPageTab.Jobs] : []),
    ...(hasAboutTab ? [SquadPageTab.About] : []),
  ];
  const { squadPath, requestedTab } = getPathTab(path);
  const pathTab = tabs.includes(requestedTab)
    ? requestedTab
    : SquadPageTab.Posts;
  const [tabletTab, setTabletTab] = useState(pathTab);
  // A segment is a view of the page: it replaces the entry, keeps the
  // reader's place and does not ask the server for the squad again.
  const setTab = (next: SquadPageTab) =>
    router.replace(
      tabSegments[next] ? `${squadPath}/${tabSegments[next]}` : squadPath,
      undefined,
      { shallow: true, scroll: false },
    );
  // From tablet About is a view, not an address, as laptop shows it as the
  // right column. Jobs keeps its address, so Back from a role returns to it.
  const onTabletSelect = (next: SquadPageTab) => {
    setTabletTab(next);
    if (next !== SquadPageTab.About) {
      setTab(next);
    }
  };
  const isPhone = useIsPhone();
  const tab = isPhone ? pathTab : tabletTab;
  const isAbout = hasAboutTab && tab === SquadPageTab.About;
  const isJobs = !!jobs && tab === SquadPageTab.Jobs;
  const hasTabs = tabs.length > 1;
  const tabsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasJobs = !!jobs;
  const openJobs = () => {
    setTabletTab(SquadPageTab.Jobs);
    setTab(SquadPageTab.Jobs);
    // Bring the roles into view when the tabs have scrolled away: the tab row
    // below laptop, the card's own tabs from laptop.
    const target = [tabsRef.current, contentRef.current].find(
      (element) => !!element?.getClientRects().length,
    );
    if (target && target.getBoundingClientRect().top < 0) {
      target.scrollIntoView({ block: 'start' });
    }
  };
  const haveTabsPassed = usePassedBlock(tabsRef, isPhone && hasTabs);
  const segments = tabs.map((item) => ({
    key: item,
    label: item,
    active: pathTab === item,
    onClick: () => setTab(item),
  }));
  const renderTabletTabs = (items: SquadPageTab[], active: SquadPageTab) => (
    <SquadDirectoryNavbar
      aria-label={items.join(', ')}
      className="!mx-0 !border-0 !px-0"
    >
      {items.map((item) => (
        <SquadDirectoryNavbarItem
          key={item}
          buttonSize={ButtonSize.Small}
          isActive={active === item}
          label={item}
          ariaLabel={item}
          onClick={() => onTabletSelect(item)}
        />
      ))}
    </SquadDirectoryNavbar>
  );

  return (
    <SquadPageTabsProvider
      openJobs={hasJobs ? openJobs : undefined}
      isJobsOpen={isJobs}
    >
      <div className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
        <div className="contents laptop:flex laptop:min-w-0 laptop:flex-1 laptop:flex-col">
          <div className="order-1 flex flex-col">
            <SquadPreviewNotice />
            <div className="border-border-subtlest-tertiary laptop:rounded-t-16 laptop:border laptop:border-b-0">
              {header}
              {belowHeader}
            </div>
          </div>
          {haveTabsPassed && (
            <ShellDockedRow>
              <ShellRow>
                <Segments items={segments} />
              </ShellRow>
            </ShellDockedRow>
          )}
          {hasTabs && (
            <div
              ref={tabsRef}
              className="order-2 border-t border-border-subtlest-tertiary laptop:hidden"
            >
              <div className="tablet:hidden">
                <ShellRow>
                  <Segments items={segments} />
                </ShellRow>
              </div>
              <div className="hidden px-6 tablet:block">
                {renderTabletTabs(tabs, tabletTab)}
              </div>
            </div>
          )}
          <div
            ref={contentRef}
            className={classNames(
              'order-4 min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:flex laptop:rounded-b-16 laptop:border laptop:border-t-0',
              isAbout ? 'hidden' : 'flex',
            )}
          >
            {!!jobs && (
              <div className="hidden border-t border-border-subtlest-tertiary px-6 laptop:block">
                {renderTabletTabs(
                  [SquadPageTab.Posts, SquadPageTab.Jobs],
                  isJobs ? SquadPageTab.Jobs : SquadPageTab.Posts,
                )}
              </div>
            )}
            {isJobs ? jobs : children}
          </div>
        </div>
        <aside
          className={classNames(
            // Below laptop it is the About tab: it starts a gutter under the tabs.
            'order-3 w-full flex-col gap-4 px-4 pb-6 pt-4 tablet:px-6 laptop:order-none laptop:flex laptop:w-80 laptop:shrink-0 laptop:p-0',
            isAbout ? 'flex' : 'hidden',
          )}
        >
          <SquadWidgets />
        </aside>
      </div>
    </SquadPageTabsProvider>
  );
};
