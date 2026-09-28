import { createContextProvider } from '@kickass-coderz/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { featureMobileAppFooter } from '../../../lib/featureManagement';
import { isIOSNative, safeContextHookExport } from '../../../lib/func';
import { withoutLayoutVariantPrefix } from '../../../lib/layoutVariant';
import type { MobileAppFooterMoment } from '../mobileAppFooter';
import {
  getMobileAppFooterMoment,
  isSearchEngineLanding,
  MobileAppFooterTrigger,
} from '../mobileAppFooter';

interface MobileAppFooterContextValue {
  // Set only for readers who should see the footer on this page.
  moment?: MobileAppFooterMoment;
  isRevealed: boolean;
  reveal: () => void;
}

const scrollUpDistance = 80;
const searchQueriesKey = 'mobile_app_footer_queries';
const queriesBeforeFooter = 3;

const countSearchQuery = (query: string): number => {
  try {
    const queries = new Set<string>(
      JSON.parse(sessionStorage.getItem(searchQueriesKey) ?? '[]'),
    );
    queries.add(query.trim().toLowerCase());
    sessionStorage.setItem(searchQueriesKey, JSON.stringify([...queries]));
    return queries.size;
  } catch {
    return 0;
  }
};

const [MobileAppFooterProvider, useMobileAppFooterContextHook] =
  createContextProvider(
    (): MobileAppFooterContextValue => {
      const router = useRouter();
      const { isAuthReady, isLoggedIn, isAndroidApp } = useAuthContext();
      const isTablet = useViewSize(ViewSize.Tablet);
      const routeMoment = getMobileAppFooterMoment(
        withoutLayoutVariantPrefix(router?.pathname),
      );
      const isSearchLanding = isSearchEngineLanding();
      const shouldEvaluate =
        !isSearchLanding &&
        !!routeMoment &&
        isAuthReady &&
        !isLoggedIn &&
        !isTablet &&
        !isAndroidApp &&
        !isIOSNative();
      const { value: isEnabled } = useConditionalFeature({
        feature: featureMobileAppFooter,
        shouldEvaluate,
      });
      const moment = shouldEvaluate && isEnabled ? routeMoment : undefined;

      const page = router?.asPath?.split('#')[0];
      const [revealedOn, setRevealedOn] = useState<string>();
      const isRevealed = !!moment && revealedOn === page;
      const reveal = useCallback(() => setRevealedOn(page), [page]);

      useEffect(() => {
        if (moment?.trigger !== MobileAppFooterTrigger.ScrollUp || isRevealed) {
          return undefined;
        }

        let deepest = window.scrollY;
        const onScroll = () => {
          deepest = Math.max(deepest, window.scrollY);
          if (
            deepest > window.innerHeight &&
            deepest - window.scrollY > scrollUpDistance
          ) {
            reveal();
          }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
      }, [moment, isRevealed, reveal]);

      const query = router?.query?.q;
      useEffect(() => {
        if (
          moment?.trigger !== MobileAppFooterTrigger.ThirdQuery ||
          typeof query !== 'string' ||
          !query.trim()
        ) {
          return;
        }

        if (countSearchQuery(query) >= queriesBeforeFooter) {
          reveal();
        }
      }, [moment, query, reveal]);

      return useMemo(
        () => ({ moment, isRevealed, reveal }),
        [moment, isRevealed, reveal],
      );
    },
    { errorMessage: 'MobileAppFooterContextNotFound' },
  );

const useMobileAppFooterContext = safeContextHookExport(
  useMobileAppFooterContextHook,
  'MobileAppFooterContextNotFound',
  { isRevealed: false, reveal: () => undefined },
);

export { MobileAppFooterProvider, useMobileAppFooterContext };
