import React, { useState, ReactElement } from 'react';
import { MenuItem } from '../filters/common';
import MultiLevelMenuDetail from './MultiLevelMenuDetail';
import MultiLevelMenuMaster from './MultiLevelMenuMaster';

interface MultiLevelMenuProps {
  menuItems: MenuItem[];
  directlyOpenedTab?: MenuItem;
}

export default function MultiLevelMenu({
  menuItems,
  directlyOpenedTab = null,
}: MultiLevelMenuProps): ReactElement {
  const [multiLevelMenuDetailItem, setMultiLevelMenuDetailItem] =
    useState(directlyOpenedTab);

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
