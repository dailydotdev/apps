import React from 'react';
import { fireEvent, screen, render } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import ReactModal from 'react-modal';
import { CookieConsentModal } from './CookieConsentModal';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import {
  GdprConsentKey,
  useCookieBanner,
} from '../../../hooks/useCookieBanner';
import { expireCookie, getCookies } from '../../../lib/cookie';

let client: QueryClient;

ReactModal.setAppElement('body');

beforeEach(() => {
  client = new QueryClient();
  localStorage.clear();
  document.cookie = '';
  Object.values(GdprConsentKey).forEach((key) => {
    expireCookie(key);
  });
});

const Wrapper = () => {
  const { onAcceptCookies } = useCookieBanner();

  return (
    <CookieConsentModal
      isOpen
      onRequestClose={jest.fn()}
      onAcceptCookies={onAcceptCookies}
    />
  );
};

const renderComponent = () => {
  return render(
    <TestBootProvider client={client} auth={{ isGdprCovered: true }}>
      <Wrapper />
    </TestBootProvider>,
  );
};

describe('CookieConsentModal', () => {
  it('should render', async () => {
    renderComponent();
    await screen.findByText('Cookie preferences');
  });

  it('should render default value to be true', async () => {
    const cookies = getCookies(Object.values(GdprConsentKey));
    expect(cookies.ilikecookies).toBeUndefined();
    expect(cookies.ilikecookies_marketing).toBeUndefined();

    renderComponent();

    const options = screen.getAllByRole('checkbox', { hidden: true });
    const isEveryChecked = options.every(
      (checkbox) => (checkbox as HTMLInputElement).checked,
    );
    expect(isEveryChecked).toBeTruthy();
    const save = screen.getByText('Save preferences');
    fireEvent.click(save);
    const cookiesAfter = getCookies(Object.values(GdprConsentKey));
    expect(cookiesAfter.ilikecookies).toBeTruthy();
    expect(cookiesAfter.ilikecookies_marketing).toBeTruthy();
  });

  it('should allow toggling the other options', async () => {
    const cookies = getCookies(Object.values(GdprConsentKey));
    expect(cookies.ilikecookies_marketing).toBeUndefined();
    renderComponent();
    const clickable = await screen.findByText('Marketing cookies');
    const [, marketingBefore] = screen.getAllByRole('checkbox', {
      hidden: true,
    });
    expect(marketingBefore).toBeChecked();

    fireEvent.click(clickable);

    const [, marketingAfter] = screen.getAllByRole('checkbox', {
      hidden: true,
    });
    expect(marketingAfter).not.toBeChecked();
    const save = screen.getByText('Save preferences');
    fireEvent.click(save);
    const cookiesAfter = getCookies(Object.values(GdprConsentKey));
    expect(cookiesAfter.ilikecookies_marketing).not.toBeTruthy();
  });

  it('should retain previous option if the item was disabled', async () => {
    localStorage.setItem(GdprConsentKey.Marketing, 'disabled');
    renderComponent();
    const [, marketing] = screen.getAllByRole('checkbox', {
      hidden: true,
    });
    expect(marketing).not.toBeChecked();
  });

  it('should NOT allow toggling the necessary option', async () => {
    renderComponent();
    const clickable = await screen.findByText('Strictly necessary cookies');
    const [necessaryBefore] = screen.getAllByRole('checkbox', { hidden: true });
    expect(necessaryBefore).toBeChecked();

    fireEvent.click(clickable);

    const [necessaryAfter] = screen.getAllByRole('checkbox', { hidden: true });
    expect(necessaryAfter).toBeChecked();
  });

  it('should save everything when "Accept all" is clicked', async () => {
    const cookies = getCookies(Object.values(GdprConsentKey));
    expect(cookies.ilikecookies).toBeUndefined();
    expect(cookies.ilikecookies_marketing).toBeUndefined();

    renderComponent();

    const options = screen.getAllByRole('checkbox', { hidden: true });
    const isEveryChecked = options.every(
      (checkbox) => (checkbox as HTMLInputElement).checked,
    );
    expect(isEveryChecked).toBeTruthy();
    const save = screen.getByText('Accept all');
    fireEvent.click(save);
    const cookiesAfter = getCookies(Object.values(GdprConsentKey));
    expect(cookiesAfter.ilikecookies).toBeTruthy();
    expect(cookiesAfter.ilikecookies_marketing).toBeTruthy();
  });

  it('should save the necessary only', async () => {
    const cookies = getCookies(Object.values(GdprConsentKey));
    expect(cookies.ilikecookies).toBeUndefined();
    expect(cookies.ilikecookies_marketing).toBeUndefined();

    renderComponent();

    const options = screen.getAllByRole('checkbox', { hidden: true });
    const isEveryChecked = options.every(
      (checkbox) => (checkbox as HTMLInputElement).checked,
    );
    expect(isEveryChecked).toBeTruthy(); // while everything is checked, rejecting all should only save necessary
    const save = screen.getByText('Reject all');
    fireEvent.click(save);
    const cookiesAfter = getCookies(Object.values(GdprConsentKey));
    expect(cookiesAfter.ilikecookies).toBeTruthy();
    expect(cookiesAfter.ilikecookies_marketing).toBeUndefined();
  });
});
