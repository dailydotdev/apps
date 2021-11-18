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

  const setMultiLevelMenuDetail = (multiLevelMenuDetail) => {
    setMultiLevelMenuDetailItem(multiLevelMenuDetail);
  };

  return (
    <>
      {!multiLevelMenuDetailItem && (
        <MultiLevelMenuMaster
          menuItems={menuItems}
          setMultiLevelMenuDetail={setMultiLevelMenuDetail}
        />
      )}

      {multiLevelMenuDetailItem && (
        <MultiLevelMenuDetail
          item={multiLevelMenuDetailItem}
          setMultiLevelMenuDetail={setMultiLevelMenuDetail}
        >
          {multiLevelMenuDetailItem.component}
        </MultiLevelMenuDetail>
      )}
    </>
  );
}
