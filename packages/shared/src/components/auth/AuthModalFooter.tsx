import React, { MouseEventHandler, ReactElement } from 'react';
import classNames from 'classnames';
import { ClickableText } from '../buttons/ClickableText';
import { Modal } from '../modals/common/Modal';
import { Justify } from '../utilities';

interface TextType {
  body?: string;
  button: string;
}
interface AuthModalFooterProps {
  className?: string;
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
      className={classNames(className, 'gap-unset')}
      justify={Justify.Center}
    >
      {text.body && <Modal.Text>{text.body}</Modal.Text>}
      <ClickableText
        className="ml-1 underline text-theme-label-primary"
        onClick={onClick}
      >
        {text.button}
      </ClickableText>
    </Modal.Footer>
  );
}

export default AuthModalFooter;
