import React, { ReactElement, ReactNode } from 'react';
import { Button } from '../buttons/Button';
import { ArrowIcon } from '../icons';
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
      <div className="mb-6 border-b border-border-subtlest-tertiary px-4 py-1">
        <Button
          className="btn-quaternary p-0 text-text-tertiary typo-callout"
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
