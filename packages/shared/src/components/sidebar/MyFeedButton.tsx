import React, { ReactElement } from 'react';
import FilterIcon from '../icons/Filter';
import { Button } from '../buttons/Button';
import { ButtonOrLink, ItemInner, NavItem, SidebarMenuItem } from './common';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

interface MyFeedButtonSharedProps {
  sidebarRendered?: boolean;
  sidebarExpanded: boolean;
  action: () => unknown;
  isActive?: boolean;
  useNavButtonsNotLinks?: boolean;
}
type MyFeedButtonProps = MyFeedButtonSharedProps & {
  item: SidebarMenuItem;
};
type FilteredMyFeedButtonProps = MyFeedButtonSharedProps & {
  item: SidebarMenuItem;
};

const FilteredMyFeedButton = ({
  item,
  sidebarExpanded,
  action,
  isActive,
  useNavButtonsNotLinks,
}: FilteredMyFeedButtonProps) => {
  return (
    <NavItem className="mt-6" active={isActive}>
      <ButtonOrLink item={item} useNavButtonsNotLinks={useNavButtonsNotLinks}>
        <ItemInner
          item={item}
          sidebarExpanded={sidebarExpanded}
          active={isActive}
        />
      </ButtonOrLink>
      <SimpleTooltip placement="right" content="Feed filters">
        <Button
          iconOnly
          className="mr-3 btn-tertiary"
          buttonSize="xsmall"
          icon={<FilterIcon />}
          onClick={action}
        />
      </SimpleTooltip>
    </NavItem>
  );
};

export default function MyFeedButton({
  item,
  sidebarRendered,
  sidebarExpanded,
  action,
  isActive,
  useNavButtonsNotLinks,
}: MyFeedButtonProps): ReactElement {
  return (
    <FilteredMyFeedButton
      action={action}
      sidebarExpanded={sidebarExpanded || sidebarRendered === false}
      item={item}
      isActive={isActive}
      useNavButtonsNotLinks={useNavButtonsNotLinks}
    />
  );
}
