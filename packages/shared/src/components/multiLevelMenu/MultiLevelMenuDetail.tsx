import React, { ReactElement, ReactNode } from 'react';
import { Button } from '../buttons/Button';
import ArrowIcon from '../icons/Arrow';
import { MenuItem } from '../filters/common';

export default function MultiLevelMenuDetail({
  children,
  item,
  setMultiLevelMenuDetail,
}: {
  children?: ReactNode;
  item: MenuItem;
  setMultiLevelMenuDetail: (item, component) => unknown;
}): ReactElement {
  return (
    <>
      <div className="py-1 px-4 mb-6 border-b border-theme-divider-tertiary">
        <Button
          className="p-0 typo-callout text-theme-label-tertiary btn-quaternary"
          onClick={() => setMultiLevelMenuDetail(null, null)}
          icon={<ArrowIcon className="mr-2 text-2xl -rotate-90" />}
        >
          {item?.title}
        </Button>
      </div>
      {children}
    </>
  );
}
