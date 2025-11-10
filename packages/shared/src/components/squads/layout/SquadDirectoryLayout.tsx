import type { ComponentProps, PropsWithChildren, ReactElement } from 'react';
import React, { useEffect, useId } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import type { ButtonProps } from '../../buttons/Button';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { BaseFeedPage } from '../../utilities';
import { useSquadNavigation } from '../../../hooks';
import { Origin } from '../../../lib/log';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from './SquadDirectoryNavbar';
import { PlusIcon } from '../../icons';
import { useSquadDirectoryLayout } from './useSquadDirectoryLayout';
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
  const { categoryPaths, isMobileLayout } = useSquadDirectoryLayout();
  const buttonSize = isMobileLayout ? ButtonSize.XSmall : ButtonSize.Small;

  useEffect(() => {
    const element = document?.getElementById?.(`squad-item-discover-${id}`);
    element?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }, [id, pathname]);

  const isDiscover = pathname === squadCategoriesPaths.discover;

  return (
    <BaseFeedPage className="laptop:px-18 laptop:pt-8 relative mb-4 flex-col px-4 pt-4">
      {isDiscover && (
        <div className="-z-1 from-accent-cabbage-default to-background-default tablet:flex absolute inset-0 hidden h-[25rem] w-full bg-gradient-to-t" />
      )}

      <header className="flex w-full flex-col gap-2">
        <section className="typo-body laptop:hidden flex w-full flex-row items-center justify-between">
          <strong>Squads</strong>
          <NewSquadButton icon={<PlusIcon />} variant={ButtonVariant.Primary} />
        </section>
        <div className="laptop:gap-22 flex max-w-full flex-row flex-nowrap items-center justify-between gap-6">
          <SquadDirectoryNavbar className="min-h-14 min-w-0 flex-1">
            {Object.entries(categoryPaths ?? {}).map(([category, path]) => (
              <SquadDirectoryNavbarItem
                buttonSize={buttonSize}
                elementProps={{ id: `squad-item-${category}-${id}` }}
                isActive={path === pathname || path === asPath}
                key={category}
                label={category}
                path={path}
              />
            ))}
          </SquadDirectoryNavbar>
          <div className="laptop:block hidden">
            <NewSquadButton />
          </div>
        </div>
      </header>
      <section
        {...attrs}
        className={classNames('flex w-full flex-col pt-5', className)}
      >
        {children}
      </section>
    </BaseFeedPage>
  );
};
