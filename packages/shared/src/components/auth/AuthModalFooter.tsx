import React, { MouseEventHandler, ReactElement } from 'react';
import classNames from 'classnames';
import { ClickableText } from '../buttons/ClickableText';
import { Modal } from '../modals/common/Modal';
import { Justify } from '../utilities';

interface ClassName {
  container?: string;
  body?: string;
  button?: string;
}

interface TextType {
  body?: string;
  button: string;
}

interface AuthModalFooterProps {
  className?: ClassName;
  text: TextType;
  onClick: MouseEventHandler;
}

function AuthModalFooter({
  className,
  text,
  onClick,
}: AuthModalFooterProps): ReactElement {
  return (
    <Modal.Footer
      className={classNames(className?.container, 'gap-unset')}
      justify={Justify.Center}
    >
      {text.body && (
        <Modal.Text className={className?.body}>{text.body}</Modal.Text>
      )}
      <ClickableText
        className={classNames(className?.button, 'ml-1 !text-text-primary')}
        inverseUnderline
        onClick={onClick}
      >
        {text.button}
      </ClickableText>
    </Modal.Footer>
  );
}

export default AuthModalFooter;
