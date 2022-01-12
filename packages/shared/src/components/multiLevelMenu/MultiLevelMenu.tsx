import React, { useState, ReactElement, useEffect } from 'react';
import { MenuItem } from '../filters/common';
import MultiLevelMenuDetail from './MultiLevelMenuDetail';
import MultiLevelMenuMaster from './MultiLevelMenuMaster';

interface MultiLevelMenuProps {
  menuItems: MenuItem[];
  directlyOpenedTab?: string;
}

export default function MultiLevelMenu({
  menuItems,
  directlyOpenedTab,
}: MultiLevelMenuProps): ReactElement {
  const [multiLevelMenuDetailItem, setMultiLevelMenuDetailItem] =
    useState(null);

  const setMultiLevelMenuDetail = (multiLevelMenuDetail) => {
    setMultiLevelMenuDetailItem(multiLevelMenuDetail);
  };

  useEffect(() => {
    if (!directlyOpenedTab) {
      return;
    }

    const menuItem = menuItems.find((item) => item.title === directlyOpenedTab);

    if (!menuItem) {
      return;
    }

    setMultiLevelMenuDetailItem(menuItem);
  }, [directlyOpenedTab]);

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
