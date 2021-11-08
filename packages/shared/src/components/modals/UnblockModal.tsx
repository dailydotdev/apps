import React, { ReactElement, MouseEvent } from 'react';
import { Button } from '../buttons/Button';
import { ModalProps } from './StyledModal';
import {
  ConfirmationModal,
  ConfirmationHeading,
  ConfirmationDescription,
  ConfirmationButtons,
} from './ConfirmationModal';
import { Source } from '../../graphql/sources';
import { Tag } from '../../graphql/feedSettings';

export interface Props extends ModalProps {
  item: { tag?: Tag | string; source?: Source };
  onConfirm: () => unknown;
}

export type CopyProps = {
  name: string | Tag;
};

const UnblockTagCopy = ({ name }: CopyProps) => {
  return (
    <p>
      Unblocking <strong className="text-white">#{name}</strong> means that you
      might see posts containing this tag in your feed.
    </p>
  );
};

const UnblockSourceCopy = ({ name }: CopyProps) => {
  return (
    <p>
      Unblocking <strong className="text-white">{name}</strong> means that you
      might see posts from this source in your feed.
    </p>
  );
};

export default function UnblockModal({
  item,
  onConfirm,
  ...props
}: Props): ReactElement {
  const onUnblockClick = async (event: MouseEvent): Promise<void> => {
    onConfirm();
    props.onRequestClose(event);
  };

  const unblockCopy = item?.tag ? (
    <UnblockTagCopy name={item?.tag} />
  ) : (
    <UnblockSourceCopy name={item?.source.name} />
  );

  return (
    <ConfirmationModal {...props}>
      <ConfirmationHeading>Are you sure?</ConfirmationHeading>
      <ConfirmationDescription>{unblockCopy}</ConfirmationDescription>
      <ConfirmationButtons>
        <Button className="btn-secondary" onClick={props.onRequestClose}>
          Cancel
        </Button>
        <Button className="btn-primary" onClick={onUnblockClick}>
          Yes, unblock
        </Button>
      </ConfirmationButtons>
    </ConfirmationModal>
  );
}
