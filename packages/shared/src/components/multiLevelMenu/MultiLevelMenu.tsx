import React, { useState, ReactElement } from 'react';
import { MenuItem } from '../filters/common';
import MultiLevelMenuDetail from './MultiLevelMenuDetail';
import MultiLevelMenuMaster from './MultiLevelMenuMaster';

export default function MultiLevelMenu({
  menuItems,
}: {
  menuItems: MenuItem[];
}): ReactElement {
  const [multiLevelMenuDetailItem, setMultiLevelMenuDetailItem] =
    useState(null);
  const [MultiLevelMenuDetailComponent, setMultiLevelMenuDetailComponent] =
    useState(null);

  const setMultiLevelMenuDetail = (
    multiLevelMenuDetail,
    multiLevelMenuDetailComponent,
  ) => {
    setMultiLevelMenuDetailItem(multiLevelMenuDetail);
    setMultiLevelMenuDetailComponent(multiLevelMenuDetailComponent);
  };

  return (
    <div>
      {!MultiLevelMenuDetailComponent && (
        <MultiLevelMenuMaster
          menuItems={menuItems}
          setMultiLevelMenuDetail={setMultiLevelMenuDetail}
        />
      )}

      {MultiLevelMenuDetailComponent && (
        <MultiLevelMenuDetail
          item={multiLevelMenuDetailItem}
          setMultiLevelMenuDetail={setMultiLevelMenuDetail}
        >
          <MultiLevelMenuDetailComponent />
        </MultiLevelMenuDetail>
      )}
    </div>
  );
}
