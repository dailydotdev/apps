import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { SendAirplaneIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

export const AgentSendButton = ({
  label,
  className,
  disabled,
  loading,
  onClick,
}: {
  label: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}): ReactElement => (
  <Button
    icon={
      // The airplane's mass sits left of its bounding box, so centring the box
      // leaves it reading low and left.
      <SendAirplaneIcon size={IconSize.XSmall} className="translate-x-px" />
    }
    size={ButtonSize.Small}
    variant={ButtonVariant.Tertiary}
    className={className}
    aria-label={label}
    loading={loading}
    disabled={disabled}
    onClick={onClick}
  />
);
