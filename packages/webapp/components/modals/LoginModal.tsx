import React, { ReactElement } from 'react';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import DailyDevLogo from '../svg/DailyDevLogo';
import { typoCallout } from '../../styles/typography';
import { StyledModal, ModalCloseButton, ModalProps } from './StyledModal';
import LoginButtons from '../LoginButtons';

const MyModal = styled(StyledModal)`
  .Modal {
    padding: ${sizeN(8)};

    .logo {
      width: 9.25rem;
    }
  }
`;

const Content = styled.div`
  margin: ${sizeN(6)} 0 ${sizeN(8)};
  color: var(--theme-label-secondary);
  text-align: center;
  ${typoCallout}
`;

export enum LoginModalMode {
  Default,
  ContentQuality,
}

export type LoginModalProps = { mode: LoginModalMode } & ModalProps;

export default function LoginModal({
  mode = LoginModalMode.Default,
  ...props
}: LoginModalProps): ReactElement {
  // eslint-disable-next-line react/prop-types
  const { onRequestClose } = props;

  return (
    <MyModal {...props}>
      <ModalCloseButton onClick={onRequestClose} />
      <DailyDevLogo />
      <Content>
        {mode === LoginModalMode.ContentQuality
          ? `Our community cares about content quality. We require social authentication to prevent abuse.`
          : `Unlock useful features by signing in. A bunch of cool stuff like content filters and bookmarks are waiting just for you.`}
      </Content>
      <LoginButtons />
    </MyModal>
  );
}
