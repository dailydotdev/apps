import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';
import { size2, size4, size6, size8 } from '../styles/sizes';
import DailyDevLogo from './DailyDevLogo';
import { IconButton, InvertButton, TextButton } from './Buttons';
import XIcon from '../icons/x.svg';
import GitHubIcon from '../icons/github.svg';
import { focusOutline } from '../styles/utilities';
import { typoJr } from '../styles/typography';
import { CodeChallenge, generateChallenge } from '../lib/auth';

interface Props extends Modal.Props {
  children?: ReactNode;
}

function ReactModalAdapter({ className, ...props }: Modal.Props): ReactElement {
  return (
    <Modal
      portalClassName={className.toString()}
      overlayClassName="Overlay"
      className="Modal"
      {...props}
    />
  );
}

const CloseButton = styled(IconButton).attrs({ size: 'small' })`
  position: absolute;
  right: ${size4};
  top: ${size4};
`;

const StyledModal = styled(ReactModalAdapter)`
  .Overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--theme-backdrop);
  }

  .Modal {
    display: flex;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    flex-direction: column;
    align-items: center;
    padding: ${size8};
    background: var(--theme-background-highlight);
    border: 0.125rem solid transparent;
    border-radius: ${size4} ${size4} 0 0;
    ${focusOutline}

    .logo {
      width: 9.25em;
    }
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  align-content: stretch;

  ${TextButton} {
    margin: ${size2} 0;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const Content = styled.div`
  margin: ${size6} 0 ${size8};
  color: var(--theme-secondary);
  text-align: center;
  ${typoJr}
`;

export default function LoginModal(props: Props): ReactElement {
  // eslint-disable-next-line react/prop-types
  const { onRequestClose } = props;
  const [challenge, setChallenge] = useState<CodeChallenge>(null);

  useEffect(() => {
    if (!challenge) {
      generateChallenge().then(setChallenge);
    }
  }, []);

  const authUrl = (provider: string, redirectUri: string) =>
    `/api/v1/auth/authorize?provider=${provider}&redirect_uri=${encodeURI(
      redirectUri,
    )}&code_challenge=${challenge?.challenge}`;

  const login = (provider: string) => {
    const redirectUri = `${
      window.location.origin
    }/callback?redirect=${encodeURI(window.location.pathname)}`;
    document.cookie = `verifier=${challenge.verifier}; path=/`;
    const url = authUrl(provider, redirectUri);
    window.location.replace(url);
  };

  return (
    <StyledModal {...props}>
      <CloseButton onClick={onRequestClose}>
        <XIcon />
      </CloseButton>
      <DailyDevLogo />
      <Content>
        {`Our developer's community care about the content, log in to show yourself.`}
      </Content>
      <Buttons>
        <InvertButton onClick={() => login('github')}>
          <GitHubIcon />
          Sign in with GitHub
        </InvertButton>
        <InvertButton onClick={() => login('google')}>
          <img src="/google.svg" className="icon" alt="Google logo" />
          Sign in with Google
        </InvertButton>
      </Buttons>
    </StyledModal>
  );
}
