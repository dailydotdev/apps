import React, { ReactElement, useContext } from 'react';
import dynamic from 'next/dynamic';
import { Item } from 'react-contexify';
import DndContext from './DndContext';

const PortalMenu = dynamic(
  () => import('@dailydotdev/shared/src/components/fields/PortalMenu'),
  {
    ssr: false,
  },
);

export type DndMenuProps = {
  onHidden?: () => unknown;
};

export default function DndMenu({ onHidden }: DndMenuProps): ReactElement {
  const { setDndSettings } = useContext(DndContext);

  const set1Hour = async () => {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1);
    await setDndSettings({ expiration });
  };

  const setUntilTomorrow = async () => {
    const now = new Date();
    await setDndSettings({
      expiration: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      ),
    });
  };

  const setForever = async () => {
    const now = new Date();
    await setDndSettings({
      expiration: new Date(
        now.getFullYear() + 100,
        now.getMonth(),
        now.getDate(),
      ),
    });
  };

  return (
    <PortalMenu
      id="dnd-context"
      className="menu-primary"
      animation="fade"
      onHidden={onHidden}
    >
      <Item onClick={set1Hour}>For 1 hour</Item>
      <Item onClick={setUntilTomorrow}>Until tomorrow</Item>
      <Item onClick={setForever}>Forever</Item>
    </PortalMenu>
  );
}
