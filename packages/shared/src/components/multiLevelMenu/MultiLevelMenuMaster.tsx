import React, { ReactElement } from 'react';
import { ArrowIcon } from '../icons';
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
          className="cursor-pointer border-b border-border-subtlest-tertiary first:border-t"
          key={item.title}
        >
          <MenuButton
            className="flex w-full items-center px-4 py-3"
            onClick={
              item.action ||
              (() => setMultiLevelMenuDetail(item, item.component))
            }
          >
            {item.icon}
            <a className="flex-1 text-left font-bold typo-body">{item.title}</a>
            <ArrowIcon className="rotate-90 text-xl" />
          </MenuButton>
        </li>
      ))}
    </ul>
  );
}
