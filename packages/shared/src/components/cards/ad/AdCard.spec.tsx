/* eslint-disable no-template-curly-in-string -- literal macro token in measurement fixture */
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import ad from '../../../../__tests__/fixture/ad';
import { AdGrid } from './AdGrid';
import { AdList } from './AdList';
import { SignalAdList } from './SignalAdList';
import type { AdCardProps } from './common/common';
import {
  defaultLogContextData,
  TestBootProvider,
} from '../../../../__tests__/helpers/boot';
import { ActiveFeedContext } from '../../../contexts';
import { businessWebsiteUrl } from '../../../lib/constants';
import { useFeature } from '../../GrowthBookProvider';
import { AdLabelVariant, featureAdLabel } from '../../../lib/featureManagement';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';

jest.mock('../../../hooks/useFeedCardGlassActions');

jest.mock('../../GrowthBookProvider', () => ({
  ...(jest.requireActual('../../GrowthBookProvider') as Record<
    string,
    unknown
  >),
  useFeature: jest.fn(),
}));

const mockUseFeature = jest.mocked(useFeature);
const mockUseGlassActions = jest.mocked(useFeedCardGlassActions);

const mockAdLabelVariant = (variant: AdLabelVariant): void => {
  mockUseFeature.mockImplementation(((feature: { id: string }) =>
    feature?.id === featureAdLabel.id ? variant : undefined) as never);
};

const plusUser = { id: 'u1', isPlus: true } as never;

const defaultProps: AdCardProps = {
  ad,
  index: 0,
  feedIndex: 0,
  onLinkClick: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  // clearAllMocks keeps implementations, so reset the arm for every test.
  mockAdLabelVariant(AdLabelVariant.Control);
  mockUseGlassActions.mockReturnValue(false);
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
  boot: Partial<React.ComponentProps<typeof TestBootProvider>> = {},
): RenderResult => {
  const client = new QueryClient();

  return render(
    <TestBootProvider client={client} {...boot}>
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

it('should keep the pixel cachebuster stable across re-renders', async () => {
  const adWithMacroPixel = {
    ...ad,
    pixel: ['https://daily.dev/pixel?ord=[timestamp]'],
  };
  const { rerender } = renderGridComponent({ ad: adWithMacroPixel });

  const el = await screen.findByTestId('pixel');
  const firstSrc = el.getAttribute('src');
  expect(firstSrc).not.toContain('[timestamp]');

  rerender(
    <TestBootProvider client={new QueryClient()}>
      <ActiveFeedContext.Provider value={{ items: [], queryKey: ['test'] }}>
        <AdGrid {...defaultProps} ad={adWithMacroPixel} />
      </ActiveFeedContext.Provider>
    </TestBootProvider>,
  );

  // A changed src would refetch the pixel and double-count the impression.
  expect(screen.getByTestId('pixel')).toHaveAttribute('src', firstSrc);
});

it('should inject measurement tags with macros filled (web inline path)', async () => {
  renderGridComponent({
    ad: {
      ...ad,
      tags: [
        {
          markup:
            '<img alt="tracker" src="https://t.tracker.example/i?ord=[timestamp]&gdpr=${GDPR}" />',
        },
      ],
    },
  });

  const injected = await screen.findByAltText('tracker');
  expect(injected.getAttribute('src')).not.toContain('[timestamp]');
});

it('should substitute macros in the click url', async () => {
  renderGridComponent({
    ad: {
      ...ad,
      link: 'https://t.tracker.example/click/x;ord=[timestamp];gdpr=${GDPR}?',
    },
  });
  const el = await screen.findByTestId('adItem');
  const links = await within(el).findAllByRole('link');
  const clickHref = links
    .map((l) => l.getAttribute('href'))
    .find((h) => h?.includes('t.tracker.example/click'));
  expect(clickHref).toBeDefined();
  expect(clickHref).not.toContain('[timestamp]');
});

it('should render nothing for measurement when the ad has no tags', async () => {
  renderGridComponent();
  await screen.findByTestId('adItem');
  expect(screen.queryByAltText('tracker')).not.toBeInTheDocument();
});

it('should render advertise link on grid ad', () => {
  renderGridComponent();

  expect(screen.getByRole('link', { name: 'Advertise here' })).toHaveAttribute(
    'href',
    businessWebsiteUrl,
  );
});

const promotedMatcher = (_: string, element?: Element | null): boolean =>
  getNormalizedText(element) === 'Promoted' ||
  getNormalizedText(element).startsWith('Promoted by ');

const promotedByMatcher =
  (source: string) =>
  (_: string, element?: Element | null): boolean =>
    getNormalizedText(element) === `Promoted by ${source}`;

it('should render promoted attribution outside of list title clamp', async () => {
  renderListComponent();

  const title = screen.getByRole('heading', { level: 3 });
  expect(getNormalizedText(title)).not.toContain('Promoted');
  expect(await screen.findByText(promotedMatcher)).toBeInTheDocument();
});

it('should render promoted attribution with source link', async () => {
  renderListComponent({
    ad: {
      ...ad,
      referralLink: 'https://example.com/referral',
      source: 'Carbon',
    },
  });

  const attribution = await screen.findByText(promotedByMatcher('Carbon'));
  const link = attribution.closest('a');

  expect(link).toHaveAttribute('href', 'https://example.com/referral');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('rel', 'noopener');
});

it('should render plain Promoted attribution without source link', async () => {
  renderListComponent();

  const attribution = await screen.findByText(
    (_, element) => getNormalizedText(element) === 'Promoted',
  );
  expect(attribution.tagName).not.toBe('A');
});

it('should render Promoted attribution in grid variant', async () => {
  renderGridComponent();
  expect(await screen.findByText(promotedMatcher)).toBeInTheDocument();
});

it('should render Promoted attribution in signal variant', async () => {
  renderSignalListComponent();
  expect(await screen.findByText(promotedMatcher)).toBeInTheDocument();
});

const adLabelMatcher = (_: string, element?: Element | null): boolean =>
  getNormalizedText(element) === 'Ad';

describe('ad_label experiment', () => {
  const referralAd = { ...ad, referralLink: 'https://example.com/referral' };

  it('should replace the advertiser attribution with "Ad" on the grid card', async () => {
    mockAdLabelVariant(AdLabelVariant.Ad);
    renderGridComponent({ ad: referralAd });

    expect(await screen.findByText(adLabelMatcher)).toBeInTheDocument();
    expect(screen.queryByText(promotedMatcher)).not.toBeInTheDocument();
  });

  it('should drop the advertiser referral link with the "Ad" label', async () => {
    mockAdLabelVariant(AdLabelVariant.Ad);
    renderListComponent({ ad: referralAd });

    const attribution = await screen.findByText(adLabelMatcher);
    expect(attribution.closest('a')).toBeNull();
  });

  it('should keep the advertise link on the ad arm', async () => {
    mockAdLabelVariant(AdLabelVariant.Ad);
    renderGridComponent({ ad: referralAd });

    expect(
      await screen.findByRole('link', { name: 'Advertise here' }),
    ).toBeInTheDocument();
  });

  it('should remove the advertise link on the ad_only arm', async () => {
    mockAdLabelVariant(AdLabelVariant.AdOnly);
    renderListComponent({ ad: referralAd });

    await screen.findByText(adLabelMatcher);
    expect(
      screen.queryByRole('link', { name: 'Advertise here' }),
    ).not.toBeInTheDocument();
  });

  it('should keep the control wording when the flag is off', async () => {
    mockAdLabelVariant(AdLabelVariant.Control);
    renderGridComponent({ ad: referralAd });

    expect(await screen.findByText(promotedMatcher)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Advertise here' }),
    ).toBeInTheDocument();
  });
});

describe('ad_only options menu on the glass card', () => {
  const optionsLabel = 'Ad options';

  it('should move both links into the menu', async () => {
    mockUseGlassActions.mockReturnValue(true);
    mockAdLabelVariant(AdLabelVariant.AdOnly);
    renderGridComponent();

    expect(
      await screen.findByRole('button', { name: optionsLabel }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Advertise here' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Remove' }),
    ).not.toBeInTheDocument();
  });

  it('should offer both actions once the menu is open', async () => {
    mockUseGlassActions.mockReturnValue(true);
    mockAdLabelVariant(AdLabelVariant.AdOnly);
    renderGridComponent();

    const trigger = await screen.findByRole('button', { name: optionsLabel });
    // Radix opens on pointerdown, which jsdom has no event for; the keyboard
    // path opens the same menu.
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(await screen.findByText('Advertise with us')).toBeInTheDocument();
    expect(await screen.findByText('Remove ads')).toBeInTheDocument();
  });

  it('should log the advertise impression on mount, like the inline link', async () => {
    mockUseGlassActions.mockReturnValue(true);
    mockAdLabelVariant(AdLabelVariant.AdOnly);
    renderGridComponent();

    await screen.findByRole('button', { name: optionsLabel });

    const logEvent = jest.mocked(defaultLogContextData.logEvent);
    const impressions = logEvent.mock.calls.filter(
      ([event]) =>
        event.event_name === LogEvent.Impression &&
        event.target_type === TargetType.AdvertiseHereCta,
    );
    expect(impressions).toHaveLength(1);
  });

  it('should log the upgrade against the same funnel RemoveAd feeds', async () => {
    mockUseGlassActions.mockReturnValue(true);
    mockAdLabelVariant(AdLabelVariant.AdOnly);
    renderGridComponent();

    const trigger = await screen.findByRole('button', { name: optionsLabel });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.click(await screen.findByText('Remove ads'));

    const logEvent = jest.mocked(defaultLogContextData.logEvent);
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.UpgradeSubscription,
        target_id: TargetId.Ads,
      }),
    );
  });

  it('should offer a Plus subscriber the advertise link only', async () => {
    mockUseGlassActions.mockReturnValue(true);
    mockAdLabelVariant(AdLabelVariant.AdOnly);
    renderGridComponent({}, { auth: { user: plusUser } });

    const trigger = await screen.findByRole('button', { name: optionsLabel });
    fireEvent.keyDown(trigger, { key: 'Enter' });

    expect(await screen.findByText('Advertise with us')).toBeInTheDocument();
    expect(screen.queryByText('Remove ads')).not.toBeInTheDocument();
  });

  it('should keep the links inline on the classic card', async () => {
    mockUseGlassActions.mockReturnValue(false);
    mockAdLabelVariant(AdLabelVariant.AdOnly);
    renderGridComponent();

    await screen.findByTestId('adItem');
    expect(
      screen.queryByRole('button', { name: optionsLabel }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Remove' })).toBeInTheDocument();
  });

  it('should keep the links inline on the other arms', async () => {
    mockUseGlassActions.mockReturnValue(true);
    mockAdLabelVariant(AdLabelVariant.Ad);
    renderGridComponent();

    await screen.findByTestId('adItem');
    expect(
      screen.queryByRole('button', { name: optionsLabel }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Advertise here' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Remove' })).toBeInTheDocument();
  });
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

it.each([
  ['grid', renderGridComponent],
  ['list', renderListComponent],
  ['signal list', renderSignalListComponent],
])('should track viewability on the %s card', async (_, renderComponent) => {
  renderComponent();

  const tracker = await screen.findByTestId('adViewability');
  // It only measures the creative's box while it stretches over the card root.
  const card = tracker.closest('article');
  expect(card).toBe(tracker.parentElement);
  expect(card).toHaveClass('relative');
});
