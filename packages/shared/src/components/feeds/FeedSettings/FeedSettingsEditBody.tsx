import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Modal } from '../../modals/common/Modal';
import type { ModalBodyProps } from '../../modals/common/ModalBody';
import { Typography, TypographyType } from '../../typography/Typography';

export type FeedSettingsEditBodyProps = ModalBodyProps;

export const FeedSettingsEditBody = ({
  children,
  className,
  view,
  ...props
}: ModalBodyProps): ReactElement => {
  return (
    <Modal.Body
      {...props}
      view={view}
      className={classNames(className, 'gap-4')}
    >
      <Typography className="tablet:hidden" type={TypographyType.Body} bold>
        {view}
      </Typography>
      {children}
    </Modal.Body>
  );
};
