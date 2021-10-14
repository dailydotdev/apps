import React, { ReactElement, ReactNode } from 'react';
import { Button } from '../buttons/Button';
import ArrowIcon from '../../../icons/arrow.svg';
import { MenuItem } from '../filters/common';

export default function DrawerDetail({
  children,
  item,
  setDrawerDetail,
}: {
  children?: ReactNode;
  item: MenuItem;
  setDrawerDetail: (item, component) => unknown;
}): ReactElement {
  return (
    <>
      <div className="py-1 px-4 mt-6 mb-6 border-t border-b border-theme-divider-tertiary">
        <Button
          className="p-0"
          onClick={() => setDrawerDetail(null, null)}
          icon={<ArrowIcon className="mr-2 text-2xl transform -rotate-90" />}
        >
          {item?.title}
        </Button>
      </div>
      {children}
    </>
  );
}
