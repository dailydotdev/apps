import React, { ReactElement } from 'react';
import { ButtonOrLink, ItemInner, NavItem, SidebarMenuItem } from './common';

interface MyFeedButtonProps {
  item: SidebarMenuItem;
  sidebarRendered?: boolean;
  sidebarExpanded: boolean;
  isActive?: boolean;
  useNavButtonsNotLinks?: boolean;
}

function MyFeedButton({
  item,
  sidebarExpanded,
  sidebarRendered,
  isActive,
  useNavButtonsNotLinks,
}: MyFeedButtonProps): ReactElement {
  return (
    <NavItem className="mt-6" active={isActive}>
      <ButtonOrLink item={item} useNavButtonsNotLinks={useNavButtonsNotLinks}>
        <ItemInner
          item={item}
          sidebarExpanded={sidebarExpanded || sidebarRendered === false}
          active={isActive}
        />
      </ButtonOrLink>
    </NavItem>
  );
}

export default MyFeedButton;
