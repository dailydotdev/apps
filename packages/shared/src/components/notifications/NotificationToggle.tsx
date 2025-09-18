import React from 'react';
import NotificationCheckbox from './NotificationCheckbox';
import NotificationSwitch from './NotificationSwitch';

interface NotificationToggleProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isPlusFeature?: boolean;
  type?: 'switch' | 'checkbox';
}

const NotificationToggle = (props: NotificationToggleProps) => {
  const { type, ...restProps } = props;
  if (type === 'checkbox') {
    return <NotificationCheckbox {...restProps} />;
  }

  return <NotificationSwitch {...restProps} />;
};

export default NotificationToggle;
