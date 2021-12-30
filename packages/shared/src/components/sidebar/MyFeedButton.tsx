import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import PlusIcon from '@dailydotdev/shared/icons/plus.svg';
import FilterIcon from '@dailydotdev/shared/icons/outline/filter.svg';
import { IFlags } from 'flagsmith';
import { Button } from '../buttons/Button';
import FeaturesContext from '../../contexts/FeaturesContext';
import { Features, getFeatureValue } from '../../lib/featureManagement';
import { ButtonOrLink, ItemInner, NavItem, SidebarMenuItem } from './common';

const statusColor = {
  success: {
    border: 'border-theme-status-success',
    shadow: 'shadow-2-avocado',
    button: 'btn-primary-avocado',
  },
  error: {
    border: 'border-theme-status-error',
    shadow: 'shadow-2-ketchup',
    button: 'btn-primary-ketchup',
  },
  help: {
    border: 'border-theme-status-help',
    shadow: 'shadow-2-cheese',
    button: 'btn-primary-cheese',
  },
  warning: {
    border: 'border-theme-status-warning',
    shadow: 'shadow-2-bun',
    button: 'btn-primary-bun',
  },
  cabbage: {
    border: 'border-theme-status-cabbage',
    shadow: 'shadow-2-cabbage',
    button: 'btn-primary-cabbage',
  },
  fill: {
    border: 'border-theme-status-fill',
    shadow: 'shadow-2-water',
    button: 'btn-primary-water',
  },
};

const UnfilteredMyFeedButton = ({
  sidebarExpanded,
  flags,
  action,
}: {
  sidebarExpanded: boolean;
  flags: IFlags;
  action: () => unknown;
}) => {
  const buttonCopy =
    getFeatureValue(Features.MyFeedButtonCopy, flags) || 'Create my feed';
  const buttonColor =
    getFeatureValue(Features.MyFeedButtonColor, flags) || 'success';
  const explainerCopy =
    getFeatureValue(Features.MyFeedExplainerCopy, flags) ||
    'Devs with a personal feed get 11.5x more relevant articles';
  const explainerColor =
    getFeatureValue(Features.MyFeedExplainerColor, flags) || 'success';

  return (
    <div
      className={classNames(
        'h-[8.125rem] flex flex-col',
        !sidebarExpanded && 'justify-center',
      )}
    >
      <div
        className={classNames(
          `flex flex-col items-center rounded-12`,
          statusColor[explainerColor].border,
          sidebarExpanded
            ? `${statusColor[explainerColor].shadow} border p-3 m-4`
            : 'mx-3 ',
        )}
      >
        <p
          className={classNames(
            'typo-footnote transition-all w-[11.25rem]',
            sidebarExpanded
              ? 'mb-3 transform opacity-100 ease-linear duration-200  delay-200'
              : 'm-0 transform duration-0 delay-0 opacity-0',
          )}
        >
          {explainerCopy}
        </p>

        <Button
          className={classNames('w-full', statusColor[buttonColor].button)}
          buttonSize={sidebarExpanded ? 'small' : 'xsmall'}
          icon={<PlusIcon />}
          iconOnly={!sidebarExpanded}
          onClick={action}
        >
          {sidebarExpanded && buttonCopy}
        </Button>
      </div>
    </div>
  );
};

const FilteredMyFeedButton = ({
  item,
  sidebarExpanded,
  action,
}: {
  item: SidebarMenuItem;
  sidebarExpanded: boolean;
  action: () => unknown;
}) => {
  return (
    <NavItem className="mt-6">
      <ButtonOrLink item={item}>
        <ItemInner item={item} sidebarExpanded={sidebarExpanded} />
      </ButtonOrLink>
      <Button
        iconOnly
        className="mr-3"
        buttonSize="xsmall"
        icon={<FilterIcon />}
        onClick={action}
      />
    </NavItem>
  );
};

export default function MyFeedButton({
  menuItem,
  sidebarExpanded,
  filtered = false,
  action,
}: {
  menuItem: SidebarMenuItem;
  sidebarExpanded: boolean;
  filtered: boolean;
  action: () => unknown;
}): ReactElement {
  const { flags } = useContext(FeaturesContext);

  if (filtered) {
    return (
      <FilteredMyFeedButton
        action={action}
        sidebarExpanded={sidebarExpanded}
        item={menuItem}
      />
    );
  }

  return (
    <UnfilteredMyFeedButton
      action={action}
      sidebarExpanded={sidebarExpanded}
      flags={flags}
    />
  );
}
