import React, { ReactElement } from 'react';
import ArrowIcon from '../../../icons/arrow.svg';
import { MenuItem } from '../filters/common';

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
          <button
            type="button"
            className="flex items-center py-3 px-4 w-full"
            onClick={
              item.action ||
              (() => setMultiLevelMenuDetail(item, item.component))
            }
          >
            {item.icon}
            <a className="flex-1 text-left typo-headline">{item.title}</a>
            <ArrowIcon className="text-xl transform rotate-90" />
          </button>
        </li>
      ))}
    </ul>
  );
}
