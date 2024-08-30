import React, {
  ComponentProps,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useId,
} from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { BaseFeedPage } from '../../utilities';
import { squadCategories } from '../../../lib/constants';

type SquadNavbarLayoutProps = PropsWithChildren;

interface SquadNavbarItemProps extends ComponentProps<'li'> {
  label: string;
  path: string;
  isActive: boolean;
}

const SquadNavbarItem = ({
  label,
  path,
  isActive,
  className,
  ...attrs
}: SquadNavbarItemProps) => {
  return (
    <li
      {...attrs}
      className={classNames(
        'relative py-3 after:absolute after:bottom-0 after:left-0 after:right-0 after:mx-auto after:w-14 after:border-b-2',
        {
          'after:hidden': !isActive,
        },
        className,
      )}
    >
      <Button
        className="capitalize"
        tag="a"
        href={path}
        aria-label={`Navigate to ${label}'s squad directory`}
        size={ButtonSize.Small}
        variant={isActive ? ButtonVariant.Float : ButtonVariant.Tertiary}
      >
        {label}
      </Button>
    </li>
  );
};

const SquadNavbar = (props: ComponentProps<'nav'>) => {
  const { pathname } = useRouter();
  const id = useId();

  useEffect(() => {
    const element = document.getElementById(`squad-item-discover-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [id, pathname]);

  return (
    <nav {...props}>
      <ul className="flex flex-row flex-nowrap gap-3 ">
        <SquadNavbarItem
          label="Discover"
          path="/squads"
          isActive={pathname === '/squads'}
          id={`squad-item-discover-${id}`}
        />
        {squadCategories.map((category) => (
          <SquadNavbarItem
            key={category}
            label={category}
            path={`/squads/${category}`}
            isActive={pathname === `/squads/${category}`}
            id={`squad-item-${category}-${id}`}
          />
        ))}
      </ul>
    </nav>
  );
};

export const SquadNavbarLayout = (
  props: SquadNavbarLayoutProps,
): ReactElement => {
  const { children } = props;

  return (
    <BaseFeedPage className="relative mb-4 flex-col pt-2 laptop:pt-8">
      <header className="flex max-w-full flex-row flex-nowrap items-center justify-between gap-6 px-5 py-4">
        <SquadNavbar className="no-scrollbar min-w-0 flex-1 overflow-x-auto" />
        <Button variant={ButtonVariant.Secondary} size={ButtonSize.Medium}>
          New Squad
        </Button>
      </header>
      <section>{children}</section>
    </BaseFeedPage>
  );
};
