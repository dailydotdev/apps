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
import { useLayoutVariant } from '../../../hooks/layout/useLayoutVariant';
import { pageHeaderClassName } from '../../layout/PageHeader';

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
  const { isV2 } = useLayoutVariant();
  const isV2Laptop = isV2;

  useEffect(() => {
    const element = document?.getElementById?.(`squad-item-discover-${id}`);
    element?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  }, [id, pathname]);

  const isDiscover = pathname === squadCategoriesPaths.discover;

  const tabItems = Object.entries(categoryPaths ?? {}).map(
    ([category, path]) => (
      <SquadDirectoryNavbarItem
        buttonSize={buttonSize}
        elementProps={{ id: `squad-item-${category}-${id}` }}
        isActive={path === pathname || path === asPath}
        key={category}
        label={category}
        path={path}
      />
    ),
  );

  return (
    <>
      {isV2Laptop && (
        // v2: unified page-header strip at the top of the floating card
        // hosts the category tabs + New Squad action. The navbar's own
        // mobile bleed/border classes are zeroed out so it sits flush
        // inside the slim header row.
        <header className={classNames(pageHeaderClassName, 'gap-4 !py-0')}>
          <SquadDirectoryNavbar className="!mx-0 min-w-0 flex-1 !border-0 !px-0">
            {tabItems}
          </SquadDirectoryNavbar>
          <div className="shrink-0 py-2">
            <NewSquadButton />
          </div>
        </header>
      )}
      <BaseFeedPage
        className={classNames(
          'relative mb-4 flex-col px-4 pt-4',
          // v2 matches the home feed gutters (24px) instead of the wide 72px
          // directory padding, so the content spans the same width.
          isV2Laptop ? 'laptop:px-6 laptop:pt-6' : 'laptop:px-18 laptop:pt-8',
        )}
      >
        {isDiscover && (
          <div className="absolute inset-0 -z-1 hidden h-[25rem] w-full bg-gradient-to-t from-accent-cabbage-default to-background-default tablet:flex" />
        )}

        <header
          className={classNames(
            'flex w-full flex-col gap-2',
            // v2 hoists tabs + New Squad into the page-header strip above,
            // so hide this inline header on laptop to avoid duplicating
            // the controls. Mobile/tablet still get the inline header.
            isV2Laptop && 'laptop:hidden',
          )}
        >
          <section className="flex w-full flex-row items-center justify-between typo-body laptop:hidden">
            <strong>Squads</strong>
            <NewSquadButton
              icon={<PlusIcon />}
              variant={ButtonVariant.Primary}
            />
          </section>
          <div className="flex max-w-full flex-row flex-nowrap items-center justify-between gap-6 laptop:gap-22">
            <SquadDirectoryNavbar className="min-h-14 min-w-0 flex-1">
              {tabItems}
            </SquadDirectoryNavbar>
            <div className="hidden laptop:block">
              <NewSquadButton />
            </div>
          </div>
        </header>
        <section
          {...attrs}
          className={classNames(
            'flex w-full flex-col pt-5',
            isV2Laptop && 'laptop:!pt-0',
            className,
          )}
        >
          {children}
        </section>
      </BaseFeedPage>
    </>
  );
};
