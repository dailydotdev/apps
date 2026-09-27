import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ButtonSize } from '../../../components/buttons/Button';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../../../components/squads/layout/SquadDirectoryNavbar';
import { SquadPreviewNotice } from './widgets/SquadPreview';
import { SquadWidgets } from './widgets/SquadWidgets';

enum SquadPageTab {
  Posts = 'Posts',
  About = 'About',
}

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
}

// One right column for every width: from laptop it sits beside the card,
// below laptop the card's wrapper dissolves (`contents`) so the column can
// be ordered between the tabs and the posts.
export const SquadPageLayout = ({
  header,
  belowHeader,
  children,
  hasAboutTab = false,
}: SquadPageLayoutProps): ReactElement => {
  const [tab, setTab] = useState(SquadPageTab.Posts);
  const isAbout = hasAboutTab && tab === SquadPageTab.About;

  return (
    <div className="mx-auto flex w-full flex-col laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
      <div className="contents laptop:flex laptop:min-w-0 laptop:flex-1 laptop:flex-col">
        <div className="order-1 flex flex-col">
          <SquadPreviewNotice />
          <div className="border-border-subtlest-tertiary laptop:rounded-t-16 laptop:border laptop:border-b-0">
            {header}
            {belowHeader}
          </div>
        </div>
        {hasAboutTab && (
          <div className="order-2 border-t border-border-subtlest-tertiary px-4 tablet:px-6 laptop:hidden">
            <SquadDirectoryNavbar
              aria-label="Posts and About"
              className="!mx-0 !border-0 !px-0"
            >
              {Object.values(SquadPageTab).map((item) => (
                <SquadDirectoryNavbarItem
                  key={item}
                  buttonSize={ButtonSize.Small}
                  isActive={tab === item}
                  label={item}
                  ariaLabel={item}
                  onClick={() => setTab(item)}
                />
              ))}
            </SquadDirectoryNavbar>
          </div>
        )}
        <div
          className={classNames(
            'order-4 min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:flex laptop:rounded-b-16 laptop:border laptop:border-t-0',
            isAbout ? 'hidden' : 'flex',
          )}
        >
          {children}
        </div>
      </div>
      <aside
        className={classNames(
          'order-3 w-full flex-col gap-4 px-4 pb-6 tablet:px-6 laptop:order-none laptop:flex laptop:w-80 laptop:shrink-0 laptop:p-0',
          isAbout ? 'flex' : 'hidden',
        )}
      >
        <SquadWidgets />
      </aside>
    </div>
  );
};
