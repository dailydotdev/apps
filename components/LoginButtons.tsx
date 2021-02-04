/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import PrimaryButton from './buttons/PrimaryButton';
import GitHubIcon from '../icons/github.svg';
import { LegalNotice } from './utilities';
import { privacyPolicy, termsOfService } from '../lib/constants';
import styled from '@emotion/styled';
import sizeN from '../macros/sizeN.macro';

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  align-content: stretch;
  align-self: center;

  button {
    margin: ${sizeN(2)} 0;

    &:first-child {
      margin-top: 0;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export default function LoginButtons(): ReactElement {
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
    <>
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
      <LegalNotice
        css={css`
          max-width: 17.25rem;
          margin-top: ${sizeN(8)};
          align-self: center;
        `}
      >
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
    </>
  );
}
