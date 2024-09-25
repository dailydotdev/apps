import React, {
  FormEvent,
  MouseEvent,
  KeyboardEvent,
  ReactElement,
  ComponentProps,
} from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { Modal } from '../modals/common/Modal';
import { ModalHeaderKind } from '../modals/common/types';

export interface AuthHeaderProps extends ComponentProps<'h2'> {
  simplified?: boolean;
  title: string;
  onBack?: (e: MouseEvent | KeyboardEvent | FormEvent) => void;
}

function AuthHeader({
  simplified = false,
  title,
  className,
  onBack,
  ...attrs
}: AuthHeaderProps): ReactElement {
  if (simplified) {
    return (
      <h2 {...attrs} className="text-center font-bold typo-title2">
        {title}
      </h2>
    );
  }

  return (
    <Modal.Header
      className={className}
      kind={ModalHeaderKind.Secondary}
      title={title}
    >
      {onBack && (
        <Button
          icon={<ArrowIcon className="-rotate-90" />}
          variant={ButtonVariant.Tertiary}
          className="mr-2"
          onClick={onBack}
        />
      )}
    </Modal.Header>
  );
}

export default AuthHeader;
