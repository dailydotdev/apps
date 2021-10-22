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

export interface Props extends ModalProps {
  item: { tag?: string; source?: Source };
  action: () => unknown;
}

export type CopyProps = {
  name: string;
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
  action,
  ...props
}: Props): ReactElement {
  const onUnblockClick = async (event: MouseEvent): Promise<void> => {
    action();
    props.onRequestClose(event);
  };

  const UnblockCopy = () => {
    if (item?.tag) {
      return <UnblockTagCopy name={item?.tag} />;
    }
    return <UnblockSourceCopy name={item?.source.name} />;
  };

  return (
    <ConfirmationModal {...props}>
      <ConfirmationHeading>Are you sure?</ConfirmationHeading>
      <ConfirmationDescription>
        <UnblockCopy />
      </ConfirmationDescription>
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
