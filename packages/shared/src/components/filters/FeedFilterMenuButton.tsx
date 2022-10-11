import classNames from 'classnames';
import React, { ReactElement, useRef } from 'react';
import FilterIcon from '../icons/Filter';
import PointedAlert, {
  AlertPlacement,
  PointedAlertProps,
} from '../alert/PointedAlert';
import { Button } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

interface FeedFilterMenuButtonProps
  extends Omit<PointedAlertProps, 'children' | 'message'> {
  onFilterSettingsClick: () => void;
}

function FeedFilterMenuButton({
  className,
  onFilterSettingsClick,
  ...props
}: FeedFilterMenuButtonProps): ReactElement {
  const ref = useRef<HTMLButtonElement>();

  return (
    <PointedAlert
      {...props}
      offset={[12, 8]}
      placement={AlertPlacement.Right}
      className={{ label: 'w-44' }}
      message="Edit your personal feed preferences here"
    >
      <SimpleTooltip content="Feed filters">
        <Button
          ref={ref}
          className={classNames('mx-3 btn-tertiary', className)}
          onClick={onFilterSettingsClick}
          icon={<FilterIcon />}
        />
      </SimpleTooltip>
    </PointedAlert>
  );
}

export default FeedFilterMenuButton;
