import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Dropdown } from '../fields/Dropdown';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import type { LiveRoomDeviceInfo } from '../../contexts/LiveRoomContext';

interface LiveRoomDevicePickerProps {
  icon: ReactNode;
  devices: LiveRoomDeviceInfo[];
  selectedId: string | null;
  onChange: (deviceId: string) => void;
  emptyLabel: string;
  className?: string;
}

export const LiveRoomDevicePicker = ({
  icon,
  devices,
  selectedId,
  onChange,
  emptyLabel,
  className,
}: LiveRoomDevicePickerProps): ReactElement => {
  const options = devices.length
    ? devices.map((device) => device.label)
    : [emptyLabel];
  const selectedIndex = devices.findIndex(
    (device) => device.deviceId === selectedId,
  );

  return (
    <Dropdown
      icon={icon}
      className={{ container: className }}
      buttonVariant={ButtonVariant.Secondary}
      buttonSize={ButtonSize.Medium}
      options={options}
      selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
      disabled={!devices.length}
      shouldIndicateSelected
      onChange={(_value, index) => {
        const device = devices[index];
        if (device) {
          onChange(device.deviceId);
        }
      }}
    />
  );
};
