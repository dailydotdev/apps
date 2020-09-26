import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { SWRConfig } from 'swr';
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
const CookieBanner = dynamic(() => import('../components/CookieBanner'));

export interface PageProps {
  user?: LoggedUser;
  trackingId: string;
  initialApolloState: NormalizedCacheObject;
}

Modal.setAppElement('#__next');
Modal.defaultStyles = {};

const consentCookieName = 'ilikecookies';

interface CompnentGetLayout {
  getLayout?: (page: ReactNode, props: Record<string, unknown>) => ReactNode;
}

export default function App({
  Component,
  pageProps,
}: AppProps<PageProps>): ReactElement {
  const apolloClient = useApollo(pageProps.initialApolloState);
  const [user, setUser] = useState<LoggedUser>(pageProps.user);
  const [loginIsOpen, setLoginIsOpen] = useState(false);
  const [showCookie, setShowCookie] = useState(false);

  const closeLogin = () => setLoginIsOpen(false);

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
    import('quicklink/dist/quicklink.umd').then((quicklink) =>
      quicklink.listen(),
    );

    if (
      pageProps.user?.providers &&
      !pageProps.user.infoConfirmed &&
      window.location.pathname.indexOf('/register') !== 0
    ) {
      window.location.replace(
        `/register?redirect_uri=${encodeURI(window.location.pathname)}`,
      );
    }

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

  const fetcher = async (
    input: RequestInfo,
    init?: RequestInit,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    const res = await fetch(input, {
      credentials: 'include',
      ...init,
    });
    return res.json();
  };

  const getLayout =
    (Component as CompnentGetLayout).getLayout || ((page) => page);

  return (
    <ApolloProvider client={apolloClient}>
      <SWRConfig value={{ fetcher }}>
        <AuthContext.Provider
          value={{
            user,
            shouldShowLogin: loginIsOpen,
            showLogin: () => setLoginIsOpen(true),
            updateUser: setUser,
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
          {getLayout(<Component {...pageProps} />, pageProps)}
          <LoginModal
            isOpen={loginIsOpen}
            onRequestClose={closeLogin}
            contentLabel="Login Modal"
          />
          {showCookie && <CookieBanner onAccepted={acceptCookies} />}
        </AuthContext.Provider>
      </SWRConfig>
    </ApolloProvider>
  );
}
