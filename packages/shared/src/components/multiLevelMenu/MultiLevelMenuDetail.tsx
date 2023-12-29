import React, { ReactElement, ReactNode } from 'react';
import { Button } from '../buttons/ButtonV2';
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
      <div className="mb-6 border-b border-theme-divider-tertiary px-4 py-1">
        <Button
          className="btn-quaternary p-0 text-theme-label-tertiary typo-callout"
          onClick={() => setMultiLevelMenuDetail(null, null)}
          icon={<ArrowIcon className="mr-2 -rotate-90 text-2xl" />}
        >
          {item?.title}
        </Button>
      </div>
      {children}
    </>
  );
}
