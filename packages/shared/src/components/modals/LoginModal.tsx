import React, { ReactElement } from 'react';
import AuthModal from '../auth/AuthModal';
import { ModalProps } from './StyledModal';

export type LoginModalProps = {
  trigger: string;
} & ModalProps;

export default function LoginModal(props: LoginModalProps): ReactElement {
  // revert this before production and have the auth modal be placed somewhere else.
  // commit reference: https://github.com/dailydotdev/apps/pull/1078/commits/d157f44f22044deb0d7ff31c6125f6f84c1bcfb9
  return <AuthModal {...props} />;
}
