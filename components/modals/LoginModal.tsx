import React, { ReactElement } from 'react';
import styled from 'styled-components/macro';
import { size2, size6, size8 } from '../../styles/sizes';
import DailyDevLogo from '../svg/DailyDevLogo';
import GitHubIcon from '../../icons/github.svg';
import { typoCallout } from '../../styles/typography';
import { StyledModal, ModalCloseButton, Props } from './StyledModal';
import { privacyPolicy, termsOfService } from '../../lib/constants';
import { LegalNotice } from '../utilities';
import { useRouter } from 'next/router';
import PrimaryButton from '../buttons/PrimaryButton';

const MyModal = styled(StyledModal)`
  .Modal {
    padding: ${size8};

    .logo {
      width: 9.25rem;
    }
  }

  ${LegalNotice} {
    max-width: 17.25rem;
    margin-top: ${size8};
  }
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  align-content: stretch;

  button {
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
  color: var(--theme-label-secondary);
  text-align: center;
  ${typoCallout}
`;

export enum LoginModalMode {
  Default,
  ContentQuality,
}

export type LoginModalProps = { mode: LoginModalMode } & Props;

export default function LoginModal({
  mode = LoginModalMode.Default,
  ...props
}: LoginModalProps): ReactElement {
  // eslint-disable-next-line react/prop-types
  const { onRequestClose } = props;
  const router = useRouter();

  const authUrl = (provider: string, redirectUri: string) =>
    `/api/v1/auth/authorize?provider=${provider}&redirect_uri=${encodeURI(
      redirectUri,
    )}&skip_authenticate=true&register_mode=${
      router.query.author ? 'author' : 'default'
    }`;

  const login = async (provider: string) => {
    const redirectUri = `${window.location.origin}${window.location.pathname}`;
    window.location.href = authUrl(provider, redirectUri);
  };

  return (
    <MyModal {...props}>
      <ModalCloseButton onClick={onRequestClose} />
      <DailyDevLogo />
      <Content>
        {mode === LoginModalMode.ContentQuality
          ? `Our community cares about content quality. We require social authentication to prevent abuse.`
          : `Unlock useful features by signing in. A bunch of cool stuff like content filters and bookmarks are waiting just for you.`}
      </Content>
      <Buttons>
        <PrimaryButton onClick={() => login('github')} icon={<GitHubIcon />}>
          Sign in with GitHub
        </PrimaryButton>
        <PrimaryButton
          onClick={() => login('google')}
          icon={<img src="/google.svg" className="icon" alt="Google logo" />}
        >
          Sign in with Google
        </PrimaryButton>
      </Buttons>
      <LegalNotice>
        By signing up I accept the{' '}
        <a href={termsOfService} target="_blank" rel="noopener">
          Terms of Service
        </a>{' '}
        and the{' '}
        <a href={privacyPolicy} target="_blank" rel="noopener">
          Privacy Policy
        </a>
        .
      </LegalNotice>
    </MyModal>
  );
}
