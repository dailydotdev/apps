import React, { useState, ReactElement } from 'react';
import { MenuItem } from '../filters/common';
import DrawerDetail from './DrawerDetail';
import DrawerMaster from './DrawerMaster';

export default function Drawer({
  menuItems,
}: {
  menuItems: MenuItem[];
}): ReactElement {
  const [drawerDetailItem, setDrawerDetailItem] = useState(null);
  const [DrawerDetailComponent, setDrawerDetailComponent] = useState(null);

  const setDrawerDetail = (drawerDetail, drawerDetailComponent) => {
    setDrawerDetailItem(drawerDetail);
    setDrawerDetailComponent(drawerDetailComponent);
  };

  return (
    <div>
      {!DrawerDetailComponent && (
        <DrawerMaster menuItems={menuItems} setDrawerDetail={setDrawerDetail} />
      )}

      {DrawerDetailComponent && (
        <DrawerDetail item={drawerDetailItem} setDrawerDetail={setDrawerDetail}>
          <DrawerDetailComponent />
        </DrawerDetail>
      )}
    </div>
  );
}
