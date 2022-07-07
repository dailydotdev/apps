import React, { ReactElement } from 'react';
import AuthModal from '../auth/AuthModal';
import { ModalProps } from './StyledModal';

export type LoginModalProps = {
  trigger: string;
} & ModalProps;

export default function LoginModal(props: LoginModalProps): ReactElement {
  return <AuthModal {...props} />;
}
