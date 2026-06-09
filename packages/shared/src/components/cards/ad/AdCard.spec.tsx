import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import ad from '../../../../__tests__/fixture/ad';
import { AdGrid } from './AdGrid';
import { AdList } from './AdList';
import { SignalAdList } from './SignalAdList';
import type { AdCardProps } from './common/common';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { ActiveFeedContext } from '../../../contexts';
import { businessWebsiteUrl } from '../../../lib/constants';

const defaultProps: AdCardProps = {
  ad,
  index: 0,
  feedIndex: 0,
  onLinkClick: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

const renderListComponent = (
  props: Partial<AdCardProps> = {},
): RenderResult => {
  const client = new QueryClient();
  return render(
    <TestBootProvider client={client}>
      <ActiveFeedContext.Provider value={{ items: [], queryKey: ['test'] }}>
        <AdList {...defaultProps} {...props} />
      </ActiveFeedContext.Provider>
    </TestBootProvider>,
  );
};

const renderSignalListComponent = (
  props: Partial<AdCardProps> = {},
): RenderResult => {
  const client = new QueryClient();
  return render(
    <TestBootProvider client={client}>
      <ActiveFeedContext.Provider value={{ items: [], queryKey: ['test'] }}>
        <SignalAdList {...defaultProps} {...props} />
      </ActiveFeedContext.Provider>
    </TestBootProvider>,
  );
};

const getNormalizedText = (element?: Element | null): string =>
  element?.textContent?.replace(/\u200B/g, '').trim() ?? '';

const renderGridComponent = (
  props: Partial<AdCardProps> = {},
): RenderResult => {
  const client = new QueryClient();

  return render(
    <TestBootProvider client={client}>
      <ActiveFeedContext.Provider value={{ items: [], queryKey: ['test'] }}>
        <AdGrid {...defaultProps} {...props} />
      </ActiveFeedContext.Provider>
    </TestBootProvider>,
  );
};

it('should call on click on component left click', async () => {
  renderGridComponent();
  const el = await screen.findByTestId('adItem');
  const links = await within(el).findAllByRole('link');
  links[0].click();
  await waitFor(() => expect(defaultProps.onLinkClick).toBeCalledWith(ad));
});

it('should call on click on component middle mouse up', async () => {
  renderGridComponent();
  const el = await screen.findByTestId('adItem');
  const links = await within(el).findAllByRole('link');
  links[0].dispatchEvent(
    new MouseEvent('auxclick', { bubbles: true, button: 1 }),
  );
  await waitFor(() => expect(defaultProps.onLinkClick).toBeCalledWith(ad));
});

it('should show a single image by default', async () => {
  renderGridComponent();
  const img = await screen.findByAltText('Ad image');
  const background = screen.queryByAltText('Ad image background');
  expect(img).toBeInTheDocument();
  expect(background).not.toBeInTheDocument();
});

it('should show blurred image for carbon', async () => {
  renderGridComponent({ ad: { ...ad, source: 'Carbon' } });
  const img = await screen.findByAltText('Ad image');
  const background = screen.queryByAltText('Ad image background');
  expect(img).toHaveClass('absolute');
  expect(background).toBeInTheDocument();
});

it('should show pixel images', async () => {
  renderGridComponent({
    ad: { ...ad, pixel: ['https://daily.dev/pixel'] },
  });
  const el = await screen.findByTestId('pixel');
  expect(el).toHaveAttribute('src', 'https://daily.dev/pixel');
});

it('should render advertise link on grid ad', () => {
  renderGridComponent();

  expect(screen.getByRole('link', { name: 'Advertise here' })).toHaveAttribute(
    'href',
    businessWebsiteUrl,
  );
});

const promotedMatcher = (_: string, element?: Element | null): boolean =>
  getNormalizedText(element) === 'Promoted';

it('should render promoted attribution outside of list title clamp', async () => {
  renderListComponent();

  const title = screen.getByRole('heading', { level: 3 });
  expect(getNormalizedText(title)).not.toContain('Promoted');
  expect(await screen.findByText(promotedMatcher)).toBeInTheDocument();
});

it('should render plain Promoted attribution without source link', async () => {
  renderListComponent({
    ad: {
      ...ad,
      referralLink: 'https://example.com/referral',
      source: 'Carbon',
    },
  });

  const attribution = await screen.findByText(promotedMatcher);
  expect(attribution.tagName).not.toBe('A');
  expect(screen.queryByText(/Promoted by/)).not.toBeInTheDocument();
  expect(screen.queryByText(/Carbon/)).not.toBeInTheDocument();
});

it('should render Promoted attribution in grid variant', async () => {
  renderGridComponent();
  expect(await screen.findByText(promotedMatcher)).toBeInTheDocument();
});

it('should render Promoted attribution in signal variant', async () => {
  renderSignalListComponent();
  expect(await screen.findByText(promotedMatcher)).toBeInTheDocument();
});

it('should render advertise link on list ad', () => {
  renderListComponent();

  expect(screen.getByRole('link', { name: 'Advertise here' })).toHaveAttribute(
    'href',
    businessWebsiteUrl,
  );
});

it('should render company logo and company name in signal ad header', async () => {
  const companyLogo = 'https://daily.dev/company-logo.png';
  const companyName = 'daily.dev';

  renderSignalListComponent({
    ad: { ...ad, companyLogo, company: companyName },
  });

  const logo = await screen.findByAltText(`Avatar of ${companyName}`);
  expect(logo).toHaveAttribute('src', companyLogo);
  expect(screen.getByText(companyName)).toBeInTheDocument();
});
