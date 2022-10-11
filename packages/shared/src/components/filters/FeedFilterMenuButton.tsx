import classNames from 'classnames';
import React, { ReactElement, useRef } from 'react';
import FilterIcon from '../icons/Filter';
import PointedAlert, { AlertPlacement } from '../alert/PointedAlert';
import { Button, ButtonProps } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

interface FeedFilterMenuButtonProps extends ButtonProps<'button'> {
  filterAlert: boolean;
  onHideAlert: () => void;
}

function FeedFilterMenuButton({
  className,
  filterAlert,
  onHideAlert,
  ...props
}: FeedFilterMenuButtonProps): ReactElement {
  const ref = useRef<HTMLButtonElement>();

  return (
    <PointedAlert
      offset={[12, 8]}
      placement={AlertPlacement.Right}
      className={{ label: 'w-44' }}
      onClose={onHideAlert}
      message="Edit your personal feed preferences here"
    >
      <SimpleTooltip content="Feed filters">
        <Button
          {...props}
          ref={ref}
          className={classNames('mx-3 btn-tertiary', className)}
          icon={<FilterIcon />}
        />
      </SimpleTooltip>
    </PointedAlert>
  );
}

export default FeedFilterMenuButton;
