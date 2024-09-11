import React, {
  ComponentProps,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useId,
} from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
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
import { squadCategoriesPaths } from '../../../lib/constants';

type SquadDirectoryLayoutProps = PropsWithChildren & ComponentProps<'section'>;

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
  const { children, className, ...attrs } = props;

  const id = useId();
  const { pathname, asPath } = useRouter();
  const { squads, categoryPaths, mySquadsTab, isMobileLayout } =
    useSquadDirectoryLayout();
  const buttonSize = isMobileLayout ? ButtonSize.XSmall : ButtonSize.Small;

  useEffect(() => {
    const element = document?.getElementById?.(`squad-item-discover-${id}`);
    element?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }, [id, pathname]);

  const isDiscover = pathname === squadCategoriesPaths.discover;

  return (
    <BaseFeedPage className="relative mb-4 flex-col pt-4 laptop:px-18 laptop:pt-8">
      {isDiscover && (
        <div className="absolute inset-0 -z-1 hidden h-[25rem] w-full bg-gradient-to-t from-accent-cabbage-default to-background-default tablet:flex" />
      )}
      <header className="flex w-full flex-col gap-2 px-4">
        <section className="flex w-full flex-row items-center justify-between typo-body laptop:hidden">
          <strong>Squads</strong>
          <NewSquadButton icon={<PlusIcon />} variant={ButtonVariant.Float} />
        </section>
        <div className="flex max-w-full flex-row flex-nowrap items-center justify-between gap-6 laptop:gap-22">
          <SquadDirectoryNavbar className="min-w-0 flex-1">
            {mySquadsTab.isVisible && (
              <SquadDirectoryNavbarItem
                label="My Squads"
                buttonSize={buttonSize}
                isActive={mySquadsTab.isActive}
                onClick={() => mySquadsTab.toggle(true)}
                elementProps={{
                  className: 'block laptop:hidden',
                  id: `squad-item-my-squads-${id}`,
                }}
              />
            )}
            {Object.entries(categoryPaths ?? {}).map(([category, path]) => (
              <SquadDirectoryNavbarItem
                buttonSize={buttonSize}
                isActive={
                  (path === pathname || path === asPath) &&
                  !mySquadsTab.isActive
                }
                key={category}
                label={category}
                path={path}
                elementProps={{ id: `squad-item-${category}-${id}` }}
                onClick={(e) => {
                  if (mySquadsTab.isActive && pathname === path) {
                    e.preventDefault();
                    mySquadsTab.toggle(false);
                  }
                }}
              />
            ))}
          </SquadDirectoryNavbar>
          <div className="hidden laptop:block">
            <NewSquadButton />
          </div>
        </div>
      </header>
      <section
        {...attrs}
        className={classNames(
          'flex w-full flex-col pt-5 tablet:px-4',
          className,
        )}
      >
        {mySquadsTab.isActive && mySquadsTab.isVisible ? (
          <div className="flex flex-col gap-3">
            {squads.map((squad) => (
              <SquadList key={squad.handle} squad={squad} />
            ))}
          </div>
        ) : (
          children
        )}
      </section>
    </BaseFeedPage>
  );
};
