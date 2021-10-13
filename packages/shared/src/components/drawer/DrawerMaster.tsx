import React, { ReactElement } from 'react';
import UserIcon from '../../../icons/user.svg';
import ArrowIcon from '../../../icons/arrow.svg';
import { MenuItem } from '../filters/common';

export default function DrawerMaster({
  menuItems,
  setDrawerDetail,
}: {
  menuItems: MenuItem[];
  setDrawerDetail: (item, component) => unknown;
}): ReactElement {
  return (
    <ul className="mt-6">
      {menuItems.map((item) => (
        <li
          className="py-3 px-4 first:border-t border-b cursor-pointer border-theme-divider-tertiary"
          key={item.title}
        >
          <button
            type="button"
            className="flex items-center w-full"
            onClick={
              item.action
                ? item.action
                : () => setDrawerDetail(item, item.component)
            }
          >
            <UserIcon className="mr-2 text-xl" />
            <a className="flex-1 text-left typo-headline">{item.title}</a>
            <ArrowIcon className="text-xl transform rotate-90" />
          </button>
        </li>
      ))}
    </ul>
  );
}
