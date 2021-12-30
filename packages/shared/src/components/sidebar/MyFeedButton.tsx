import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import PlusIcon from '@dailydotdev/shared/icons/plus.svg';
import FilterIcon from '@dailydotdev/shared/icons/outline/filter.svg';
import { IFlags } from 'flagsmith';
import { Button } from '../buttons/Button';
import FeaturesContext from '../../contexts/FeaturesContext';
import { Features, getFeatureValue } from '../../lib/featureManagement';
import { ButtonOrLink, ItemInner, NavItem, SidebarMenuItem } from './common';

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
  const explainerCopy =
    getFeatureValue(Features.MyFeedExplainerCopy, flags) ||
    'Devs with a personal feed get 11.5x more relevant articles';

  return (
    <div
      className={classNames(
        'flex flex-col items-center rounded-12 border-theme-status-success',
        sidebarExpanded
          ? 'shadow-2-avocado border p-3 m-4'
          : 'mx-3 mb-2.5 mt-16',
      )}
    >
      <p
        className={classNames(
          'typo-footnote  transition-all ',
          sidebarExpanded
            ? 'mb-3 h-auto transform opacity-100 ease-linear duration-200 translate-y-0 delay-200'
            : 'm-0 transform duration-0 delay-0 opacity-0 translate-y-full h-0',
        )}
      >
        {explainerCopy}
      </p>

      <Button
        className="btn-primary-avocado"
        buttonSize={sidebarExpanded ? 'medium' : 'xsmall'}
        icon={<PlusIcon />}
        iconOnly={!sidebarExpanded}
        onClick={action}
      >
        {sidebarExpanded && buttonCopy}
      </Button>
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
