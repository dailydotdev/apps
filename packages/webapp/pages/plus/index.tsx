import type { ReactElement } from 'react';
import React, { useCallback } from 'react';

import dynamic from 'next/dynamic';
import {
  useEventListener,
  usePlusPositioning,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import type { GiftUserContextData } from '@dailydotdev/shared/src/components/plus/GiftUserContext';
import { GiftUserContext } from '@dailydotdev/shared/src/components/plus/GiftUserContext';
import type { CommonPlusPageProps } from '@dailydotdev/shared/src/components/plus/common';
import { isIOSNative } from '@dailydotdev/shared/src/lib/func';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, TargetId } from '@dailydotdev/shared/src/lib/log';
import useDebounceFn from '@dailydotdev/shared/src/hooks/useDebounceFn';
import { getPlusLayout } from '../../components/layouts/PlusLayout/PlusLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { defaultOpenGraph } from '../../next-seo';

const PlusMobile = dynamic(() =>
  import(
    /* webpackChunkName: "plusMobile" */ '@dailydotdev/shared/src/components/plus/PlusMobile'
  ).then((mod) => mod.PlusMobile),
);

const PlusDesktop = dynamic(() =>
  import(
    /* webpackChunkName: "plusDesktop" */ '@dailydotdev/shared/src/components/plus/PlusDesktop'
  ).then((mod) => mod.PlusDesktop),
);

const PlusIOS = dynamic(() =>
  import(
    /* webpackChunkName: "plusIOS" */ '@dailydotdev/shared/src/components/plus/PlusIOS'
  ).then((mod) => mod.PlusIOS),
);

const seoTitlesControl = getPageSeoTitles(
  'Unlock Premium Developer Features with Plus',
);
const seoControl: NextSeoProps = {
  title: seoTitlesControl.title,
  openGraph: { ...seoTitlesControl.openGraph, ...defaultOpenGraph },
  description:
    'Upgrade to daily.dev Plus for an ad-free experience, custom feeds, bookmark folders, clickbait shield, and more.',
};

const seoTitlesTreatment = getPageSeoTitles(
  'Power Your Agents with daily.dev Plus',
);
const seoTreatment: NextSeoProps = {
  title: seoTitlesTreatment.title,
  openGraph: { ...seoTitlesTreatment.openGraph, ...defaultOpenGraph },
  description:
    'Upgrade to daily.dev Plus for public API access, agent-ready developer intelligence, and AI tools that keep your workflows up to date.',
};

export type PlusPageProps = Pick<GiftUserContextData, 'giftToUser'> &
  CommonPlusPageProps;

const PlusPage = ({
  giftToUser,
  shouldShowPlusHeader,
}: PlusPageProps): ReactElement => {
  const { logEvent } = useLogContext();
  const { isReady } = useRouter();
  const { isAgentPositioning } = usePlusPositioning();
  const isLaptop = useViewSize(ViewSize.Laptop);

  const onScroll = useCallback(() => {
    logEvent({
      event_name: LogEvent.PageScroll,
      target_type: TargetId.PlusPage,
      extra: JSON.stringify({
        scrollTop: window.scrollY,
      }),
    });
  }, [logEvent]);
  const [debouncedOnScroll] = useDebounceFn(onScroll, 100);
  useEventListener(globalThis?.window, 'scroll', debouncedOnScroll);

  if (!isReady) {
    return null;
  }

  if (isIOSNative()) {
    return <PlusIOS shouldShowPlusHeader={shouldShowPlusHeader} />;
  }

  return (
    <GiftUserContext.Provider value={{ giftToUser }}>
      {isAgentPositioning && <NextSeo {...seoTreatment} />}
      {/* <HotJarTracking hotjarId="5215055" /> */}
      {isLaptop ? (
        <PlusDesktop shouldShowPlusHeader={shouldShowPlusHeader} />
      ) : (
        <PlusMobile shouldShowPlusHeader={shouldShowPlusHeader} />
      )}
    </GiftUserContext.Provider>
  );
};

PlusPage.getLayout = getPlusLayout;
PlusPage.layoutProps = { seo: seoControl };

export default PlusPage;
