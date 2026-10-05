import { createContextProvider } from '@kickass-coderz/react';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureMobileAppFooter } from '../../../lib/featureManagement';
import { safeContextHookExport } from '../../../lib/func';
import { withoutLayoutVariantPrefix } from '../../../lib/layoutVariant';
import type { MobileAppFooterMoment } from '../mobileAppFooter';
import {
  getMobileAppFooterMoment,
  isSearchEngineLanding,
} from '../mobileAppFooter';
import { usePhoneBrowser } from '../hooks/usePhoneBrowser';

interface MobileAppFooterContextValue {
  // Set only for readers who should see the footer on this page.
  moment?: MobileAppFooterMoment;
  // The footer shows as soon as the page loads for enrolled readers.
  isRevealed: boolean;
}

const [MobileAppFooterProvider, useMobileAppFooterContextHook] =
  createContextProvider(
    (): MobileAppFooterContextValue => {
      const router = useRouter();
      const { isLoggedIn } = useAuthContext();
      const isPhoneBrowser = usePhoneBrowser();
      const routeMoment = getMobileAppFooterMoment(
        withoutLayoutVariantPrefix(router?.pathname),
      );
      const isSearchLanding = isSearchEngineLanding();
      const shouldEvaluate =
        !isSearchLanding && !!routeMoment && isPhoneBrowser && !isLoggedIn;
      const { value: isEnabled } = useConditionalFeature({
        feature: featureMobileAppFooter,
        shouldEvaluate,
      });
      const moment = shouldEvaluate && isEnabled ? routeMoment : undefined;

      return useMemo(() => ({ moment, isRevealed: !!moment }), [moment]);
    },
    { errorMessage: 'MobileAppFooterContextNotFound' },
  );

const useMobileAppFooterContext = safeContextHookExport(
  useMobileAppFooterContextHook,
  'MobileAppFooterContextNotFound',
  { isRevealed: false },
);

export { MobileAppFooterProvider, useMobileAppFooterContext };
