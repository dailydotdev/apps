import React, {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useId,
} from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { BaseFeedPage } from '../../utilities';
import { useSquadNavigation } from '../../../hooks';
import { Origin } from '../../../lib/log';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from './SquadDirectoryNavbar';
import { PlusIcon } from '../../icons';
import { useSquadDirectoryLayout } from './useSquadDirectoryLayout';
import { SquadList } from '../../cards/squad/SquadList';

type SquadDirectoryLayoutProps = PropsWithChildren;

const NewSquadButton = (
  props: Pick<ButtonProps<'button'>, 'variant' | 'icon'>,
) => {
  const { openNewSquad } = useSquadNavigation();
  const { variant = ButtonVariant.Secondary, icon } = props;

  const onNewSquadClick = () => {
    openNewSquad({ origin: Origin.SquadDirectory });
  };

  return (
    <Button
      type="button"
      icon={icon}
      onClick={onNewSquadClick}
      size={ButtonSize.Medium}
      tag="button"
      variant={variant}
    >
      New Squad
    </Button>
  );
};

export const SquadDirectoryLayout = (
  props: SquadDirectoryLayoutProps,
): ReactElement => {
  const { children } = props;

  const id = useId();
  const { pathname } = useRouter();
  const { squads, categoryPaths, mySquadsTab, isMobileLayout } =
    useSquadDirectoryLayout();
  const buttonSize = isMobileLayout ? ButtonSize.XSmall : ButtonSize.Small;

  useEffect(() => {
    const element = document?.getElementById?.(`squad-item-discover-${id}`);
    element?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }, [id, pathname]);

  return (
    <BaseFeedPage className="relative mb-4 flex-col pt-2 laptop:pt-8">
      <header className="max-w-full">
        {isMobileLayout && (
          <div className="flex w-full flex-row items-center justify-between px-4 py-2 typo-body">
            <strong>Squads</strong>
            <NewSquadButton icon={<PlusIcon />} variant={ButtonVariant.Float} />
          </div>
        )}
        <div className="flex max-w-full flex-row flex-nowrap items-center justify-between gap-6 px-5 py-4">
          <SquadDirectoryNavbar className="min-w-0 flex-1">
            {mySquadsTab.isVisible && (
              <SquadDirectoryNavbarItem
                buttonSize={buttonSize}
                id={`squad-item-my-squads-${id}`}
                isActive={mySquadsTab.isActive}
                label="My Squads"
                onClick={() => mySquadsTab.toggle(true)}
              />
            )}
            {Object.entries(categoryPaths).map(([category, path]) => (
              <SquadDirectoryNavbarItem
                buttonSize={buttonSize}
                id={`squad-item-${category}-${id}`}
                key={category}
                label={category}
                path={path}
                isActive={pathname === path && !mySquadsTab.isActive}
                onClick={(e) => {
                  if (mySquadsTab.isActive) {
                    e.preventDefault();
                    mySquadsTab.toggle(false);
                  }
                }}
              />
            ))}
          </SquadDirectoryNavbar>
          {!isMobileLayout && <NewSquadButton />}
        </div>
      </header>
      <section className="w-full">
        {mySquadsTab.isActive && mySquadsTab.isVisible ? (
          <div className="flex flex-col gap-4 px-4">
            {squads.map((squad) => (
              <SquadList
                key={squad.handle}
                squad={squad}
                elementProps={{ href: squad.permalink }}
                isUserSquad
              />
            ))}
          </div>
        ) : (
          children
        )}
      </section>
    </BaseFeedPage>
  );
};
