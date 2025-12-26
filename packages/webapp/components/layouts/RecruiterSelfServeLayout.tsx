import type { ReactNode } from 'react';
import React, { useEffect } from 'react';
import type { RecruiterSelfServeLayoutProps } from '@dailydotdev/shared/src/components/recruiter/layout/RecruiterLayout';
import { RecruiterLayout } from '@dailydotdev/shared/src/components/recruiter/layout/RecruiterLayout';
import { useSettingsContext } from '@dailydotdev/shared/src/contexts/SettingsContext';

const GetLayout = (
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps?: RecruiterSelfServeLayoutProps,
): ReactNode => {
  const { applyThemeMode, recruiterTheme, loadedSettings } =
    useSettingsContext();

  useEffect(() => {
    if (loadedSettings) {
      applyThemeMode(recruiterTheme);
    }
  }, [applyThemeMode, recruiterTheme, loadedSettings]);

  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      applyThemeMode();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <RecruiterLayout {...layoutProps}>{page}</RecruiterLayout>;
};

export { GetLayout as getLayout };
