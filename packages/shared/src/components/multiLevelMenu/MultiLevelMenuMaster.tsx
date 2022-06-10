import React, { ReactElement } from 'react';
import ArrowIcon from '../icons/Arrow';
import classed from '../../lib/classed';
import { MenuItem } from '../filters/common';

export const menuItemClassNames = 'flex items-center py-3 px-4 w-full';

export const MenuButton = classed('button', menuItemClassNames);

export default function MultiLevelMenuMaster({
  menuItems,
  setMultiLevelMenuDetail,
}: {
  menuItems: MenuItem[];
  setMultiLevelMenuDetail: (item, component) => unknown;
}): ReactElement {
  return (
    <ul className="mt-6">
      {menuItems.map((item) => (
        <li
          className="first:border-t border-b cursor-pointer border-theme-divider-tertiary"
          key={item.title}
        >
          <MenuButton
            className="flex items-center py-3 px-4 w-full"
            onClick={
              item.action ||
              (() => setMultiLevelMenuDetail(item, item.component))
            }
          >
            {item.icon}
            <a className="flex-1 text-left typo-headline">{item.title}</a>
            <ArrowIcon className="text-xl rotate-90" />
          </MenuButton>
        </li>
      ))}
    </ul>
  );
}
