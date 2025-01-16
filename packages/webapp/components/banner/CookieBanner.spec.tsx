import React, { act, useEffect } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import { QueryClient } from '@tanstack/react-query';
import type { AuthContextData } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  GdprConsentKey,
  useCookieBanner,
} from '@dailydotdev/shared/src/hooks/useCookieBanner';
import { nextTick } from '@dailydotdev/shared/src/lib/func';
import { expireCookie, getCookies } from '@dailydotdev/shared/src/lib/cookie';
import { MODAL_KEY } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import CookieBanner from './CookieBanner';

let client: QueryClient;

beforeEach(() => {
  jest.clearAllMocks();
  client = new QueryClient();
  document.cookie = '';
  Object.values(GdprConsentKey).forEach((key) => {
    expireCookie(key);
  });
});

const WrapperComponent = () => {
  const { user } = useAuthContext();
  const { showBanner, onAcceptCookies, updateCookieBanner } = useCookieBanner();

  useEffect(() => {
    updateCookieBanner(user);
  }, [user, updateCookieBanner]);

  if (!showBanner) {
    return null;
  }

  return <CookieBanner onAccepted={onAcceptCookies} />;
};

const renderComponent = (auth: Partial<AuthContextData> = {}) => {
  return render(
    <TestBootProvider client={client} auth={auth}>
      <WrapperComponent />
    </TestBootProvider>,
  );
};

describe('CookieBannerGdpr', () => {
  it('should render just a single button to accept all when outside GDPR coverage', async () => {
    renderComponent();
    await nextTick();
    const banner = screen.queryByTestId('gdpr_content');
    expect(banner).toBeInTheDocument();
  });

  it('should not render when cookie is accepted already', async () => {
    document.cookie = `${GdprConsentKey.Necessary}=true`;
    renderComponent({ isGdprCovered: true });

    await nextTick();
    const banner = screen.queryByTestId('gdpr_content');
    expect(banner).not.toBeInTheDocument();
  });

  it('should render when cookie is not found', async () => {
    renderComponent({ isGdprCovered: true });

    await screen.findByTestId('gdpr_content');
  });

  it('should set the cookies for all when closed', async () => {
    renderComponent({ isGdprCovered: true });

    await screen.findByTestId('gdpr_content');
    const button = await screen.findByTitle('Close');
    await act(() => fireEvent.click(button));
    await nextTick();
    const cookies = getCookies([
      GdprConsentKey.Necessary,
      GdprConsentKey.Marketing,
    ]);
    expect(cookies.ilikecookies).toEqual('true');
    expect(cookies.ilikecookies_marketing).toEqual('true');
  });

  it('should set the cookies for all when accept all is clicked', async () => {
    renderComponent({ isGdprCovered: true });

    await screen.findByTestId('gdpr_content');
    const button = await screen.findByText('Accept all');
    await act(() => fireEvent.click(button));
    await nextTick();
    const cookies = getCookies([
      GdprConsentKey.Necessary,
      GdprConsentKey.Marketing,
    ]);
    expect(cookies.ilikecookies).toEqual('true');
    expect(cookies.ilikecookies_marketing).toEqual('true');
  });

  it('should open the modal for detailed consent', async () => {
    renderComponent({ isGdprCovered: true });

    await screen.findByTestId('gdpr_content');
    const button = await screen.findByText('Customize');
    await act(() => fireEvent.click(button));
    await nextTick();
    const modal = client.getQueryData(MODAL_KEY);
    expect((modal as { type: string }).type).toEqual(LazyModal.CookieConsent);
  });
});
