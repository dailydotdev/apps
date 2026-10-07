import { createContextProvider } from '@kickass-coderz/react';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureMobileAppFooter } from '../../../lib/featureManagement';
import { safeContextHookExport } from '../../../lib/func';
import { withoutLayoutVariantPrefix } from '../../../lib/layoutVariant';
import {
  getMobileAppFooterTitle,
  isSearchEngineLanding,
} from '../mobileAppFooter';
import { usePhoneBrowser } from '../hooks/usePhoneBrowser';

interface MobileAppFooterContextValue {
  // Set only for readers who should see the footer on this page.
  title?: string;
}

const [MobileAppFooterProvider, useMobileAppFooterContextHook] =
  createContextProvider(
    (): MobileAppFooterContextValue => {
      const router = useRouter();
      const { isLoggedIn } = useAuthContext();
      const isPhoneBrowser = usePhoneBrowser();
      const routeTitle = getMobileAppFooterTitle(
        withoutLayoutVariantPrefix(router?.pathname),
      );
      const isSearchLanding = isSearchEngineLanding();
      const shouldEvaluate =
        !isSearchLanding && !!routeTitle && isPhoneBrowser && !isLoggedIn;
      const { value: isEnabled } = useConditionalFeature({
        feature: featureMobileAppFooter,
        shouldEvaluate,
      });
      const title = shouldEvaluate && isEnabled ? routeTitle : undefined;

      return useMemo(() => ({ title }), [title]);
    },
    { errorMessage: 'MobileAppFooterContextNotFound' },
  );

const useMobileAppFooterContext = safeContextHookExport(
  useMobileAppFooterContextHook,
  'MobileAppFooterContextNotFound',
  {},
);

export { MobileAppFooterProvider, useMobileAppFooterContext };
