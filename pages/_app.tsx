import React, { ReactElement, useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ApolloProvider, NormalizedCacheObject } from '@apollo/client';
import 'focus-visible';
import Modal from 'react-modal';
import ReactGA from 'react-ga';
import { DefaultSeo } from 'next-seo';
import Seo from '../next-seo';
import { useApollo } from '../lib/apolloClient';
import GlobalStyle from '../components/GlobalStyle';
import AuthContext from '../components/AuthContext';
import { LoggedUser, logout as dispatchLogout } from '../lib/user';

const LoginModal = dynamic(() => import('../components/LoginModal'));
const ProfileModal = dynamic(() => import('../components/ProfileModal'));
const CookieBanner = dynamic(() => import('../components/CookieBanner'));

export interface PageProps {
  user?: LoggedUser;
  trackingId: string;
  initialApolloState: NormalizedCacheObject;
}

Modal.setAppElement('#__next');
Modal.defaultStyles = {};

const consentCookieName = 'ilikecookies';

export default function App({
  Component,
  pageProps,
}: AppProps<PageProps>): ReactElement {
  const apolloClient = useApollo(pageProps.initialApolloState);
  const [user, setUser] = useState<LoggedUser>(pageProps.user);
  const [loginIsOpen, setLoginIsOpen] = useState(false);
  const [confirmAccount, setConfirmAccount] = useState(
    pageProps.user?.providers && !pageProps.user.infoConfirmed,
  );
  const [profileIsOpen, setProfileIsOpen] = useState(confirmAccount);
  const [showCookie, setShowCookie] = useState(false);

  const closeLogin = () => setLoginIsOpen(false);
  const closeConfirmAccount = () => setProfileIsOpen(false);
  const profileUpdated = (newProfile: LoggedUser) => {
    setUser({ ...user, ...newProfile });
    setProfileIsOpen(false);
    if (confirmAccount) {
      setConfirmAccount(false);
    }
  };

  const logout = async (): Promise<void> => {
    await dispatchLogout();
    location.reload();
  };

  const acceptCookies = (): void => {
    setShowCookie(false);
    document.cookie = `${consentCookieName}=true;path=/;domain=${
      process.env.NEXT_PUBLIC_DOMAIN
    };samesite=lax;expires=${60 * 60 * 24 * 365 * 10}`;
  };

  useEffect(() => {
    ReactGA.initialize(process.env.NEXT_PUBLIC_GA, {
      gaOptions: {
        clientId: pageProps.trackingId,
      },
    });
    const page = `/web${window.location.pathname}${window.location.search}`;
    ReactGA.set({ page });
    ReactGA.pageview(page);

    if (
      !pageProps.user &&
      !document.cookie
        .split('; ')
        .find((row) => row.startsWith(consentCookieName))
    ) {
      setShowCookie(true);
    }
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: loginIsOpen,
          showLogin: () => setLoginIsOpen(true),
          showProfile: () => setProfileIsOpen(true),
          logout,
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
          <meta name="theme-color" content="#151618" />
          <meta name="msapplication-navbutton-color" content="#151618" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="#151618"
          />
        </Head>
        <DefaultSeo {...Seo} />
        <GlobalStyle />
        <Component {...pageProps} />
        <LoginModal
          isOpen={loginIsOpen}
          onRequestClose={closeLogin}
          contentLabel="Login Modal"
        />
        {user && (
          <ProfileModal
            confirmMode={confirmAccount}
            isOpen={profileIsOpen}
            onRequestClose={closeConfirmAccount}
            contentLabel={
              confirmAccount ? 'Confirm Your Account Details' : 'Your profile'
            }
            shouldCloseOnOverlayClick={false}
            profiledUpdated={profileUpdated}
          />
        )}
        {showCookie && <CookieBanner onAccepted={acceptCookies} />}
      </AuthContext.Provider>
    </ApolloProvider>
  );
}
