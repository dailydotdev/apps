import React, { ReactElement, useState } from 'react';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ApolloProvider, NormalizedCacheObject } from '@apollo/client';
import 'focus-visible';
import Modal from 'react-modal';
import { useApollo } from '../lib/apolloClient';
import GlobalStyle from '../components/GlobalStyle';
import AuthContext from '../components/AuthContext';
import { LoggedUser } from '../lib/user';

const LoginModal = dynamic(() => import('../components/LoginModal'), {
  ssr: false,
});
const ConfirmAccountModal = dynamic(
  () => import('../components/ConfirmAccountModal'),
  { ssr: false },
);

interface PageProps {
  user?: LoggedUser;
  initialApolloState: NormalizedCacheObject;
}

Modal.setAppElement('#__next');
Modal.defaultStyles = {};

export default function App({
  Component,
  pageProps,
}: AppProps<PageProps>): ReactElement {
  const apolloClient = useApollo(pageProps.initialApolloState);
  const [user, setUser] = useState<LoggedUser>(pageProps.user);
  const [loginIsOpen, setLoginIsOpen] = useState(false);
  const [confirmAccountIsOpen, setConfirmAccountIsOpen] = useState(
    pageProps.user?.providers && !pageProps.user.infoConfirmed,
  );

  const closeLogin = () => setLoginIsOpen(false);
  const closeConfirmAccount = () => setConfirmAccountIsOpen(false);
  const profileUpdated = (newProfile: LoggedUser) => {
    setUser({ ...user, ...newProfile });
    setConfirmAccountIsOpen(false);
  };

  return (
    <ApolloProvider client={apolloClient}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: loginIsOpen,
          showLogin: () => setLoginIsOpen(true),
        }}
      >
        <Head>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
        WebFontConfig = {
          custom: {
          families: ['DejaVuSansMono'],
          urls: ['https://storage.googleapis.com/devkit-assets/static/dejavue.css'],
        },
        };

        (function(d) {
          var wf = d.createElement('script'), s = d.scripts[0];
          wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
          wf.async = true;
          s.parentNode.insertBefore(wf, s);
        })(document);
        `,
            }}
          />
        </Head>
        <GlobalStyle />
        <Component {...pageProps} />
        <LoginModal
          isOpen={loginIsOpen}
          onRequestClose={closeLogin}
          contentLabel="Login Modal"
        />
        {user && (
          <ConfirmAccountModal
            isOpen={confirmAccountIsOpen}
            onRequestClose={closeConfirmAccount}
            contentLabel="Confirm Your Account Details"
            shouldCloseOnOverlayClick={false}
            profiledUpdated={profileUpdated}
          />
        )}
      </AuthContext.Provider>
    </ApolloProvider>
  );
}
