import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { CookieConsent } from './CookieConsent';
import { LazyModal } from '../../../components/modals/common/types';
import { GdprConsentKey } from '../../../hooks/useCookieBanner';
import { useFunnelCookies } from '../hooks/useFunnelCookies';
import { expireCookie, getCookies } from '../../../lib/cookie';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { nextTick } from '../../../lib/func';
import { MODAL_KEY } from '../../../hooks/useLazyModal';
import type { AuthContextData } from '../../../contexts/AuthContext';

let client: QueryClient;
const trackFunnelEvent = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  client = new QueryClient();
  localStorage.clear();
  document.cookie = '';
  Object.values(GdprConsentKey).forEach((key) => {
    expireCookie(key);
  });
});

// mirrors the FunnelStepper wiring, the component's only production driver
const WrapperComponent = () => {
  const { showBanner, onAccepted } = useFunnelCookies({
    defaultOpen: true,
    trackFunnelEvent,
  });

  if (!showBanner) {
    return null;
  }

  return (
    <CookieConsent
      onAccepted={onAccepted}
      onHideBanner={jest.fn()}
      onModalClose={jest.fn()}
    />
  );
};

const renderComponent = (auth: Partial<AuthContextData> = {}) => {
  return render(
    <TestBootProvider client={client} auth={auth}>
      <WrapperComponent />
    </TestBootProvider>,
  );
};

describe('Onboarding CookieConsent outside GDPR', () => {
  it('should render just a single button to accept all when outside GDPR coverage', async () => {
    renderComponent();
    await nextTick();
    const el = await screen.findByText('I understand');
    expect(el.tagName).toBe('BUTTON');
  });

  it('should not render when the consent was given already', async () => {
    document.cookie = `${GdprConsentKey.Marketing}=true`;
    renderComponent();

    await nextTick();
    const banner = screen.queryByTestId('cookie_content');
    expect(banner).not.toBeInTheDocument();
  });

  it('should set the consent cookie when "I understand" is clicked', async () => {
    renderComponent();

    await screen.findByTestId('cookie_content');
    const button = await screen.findByText('I understand');
    await act(() => fireEvent.click(button));
    await nextTick();
    const cookies = getCookies([GdprConsentKey.Marketing]);
    expect(cookies!.ilikecookies_marketing).toEqual('true');
  });
});

describe('Onboarding CookieConsent under GDPR', () => {
  const renderWrapper = async (auth: Partial<AuthContextData> = {}) => {
    renderComponent({ ...auth, isGdprCovered: true });
    await nextTick();
  };

  it('should render two buttons to either accept or customize', async () => {
    await renderWrapper();

    await screen.findByText('Accept all');
    await screen.findByText('Customize');
  });

  it('should not render when the consent was given already', async () => {
    document.cookie = `${GdprConsentKey.Marketing}=true`;
    await renderWrapper();

    const banner = screen.queryByTestId('cookie_content');
    expect(banner).not.toBeInTheDocument();
  });

  it('should render while the marketing consent is missing', async () => {
    document.cookie = `${GdprConsentKey.Necessary}=true`;
    await renderWrapper();

    await screen.findByTestId('cookie_content');
  });

  it('should not render close button', async () => {
    await renderWrapper();

    const button = screen.queryByTitle('Close');
    expect(button).not.toBeInTheDocument();
  });

  it('should set the marketing cookie when accept all is clicked', async () => {
    await renderWrapper();

    await screen.findByTestId('cookie_content');
    const button = await screen.findByText('Accept all');
    await act(() => fireEvent.click(button));
    await nextTick();
    const cookies = getCookies([GdprConsentKey.Marketing]);
    expect(cookies!.ilikecookies_marketing).toEqual('true');
  });

  it('should open the modal for detailed consent', async () => {
    await renderWrapper();

    await screen.findByTestId('cookie_content');
    const button = await screen.findByText('Customize');
    await act(() => fireEvent.click(button));
    await nextTick();
    const modal = client.getQueryData(MODAL_KEY);
    expect((modal as { type: string }).type).toEqual(LazyModal.CookieConsent);
  });
});
