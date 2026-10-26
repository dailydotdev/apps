/* eslint-disable no-template-curly-in-string -- literal macro token in measurement fixture */
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import ad from '../../../../__tests__/fixture/ad';
import { AdGrid } from './AdGrid';
import { AdList } from './AdList';
import type { AdCardProps } from './common/common';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { ActiveFeedContext } from '../../../contexts';
import { businessWebsiteUrl } from '../../../lib/constants';
import { anchorSponsoredRel } from '../../../lib/strings';
import { useFeature } from '../../GrowthBookProvider';
import {
  AdLabelVariant,
  featureAdLabel,
  featureGridCardTldr,
} from '../../../lib/featureManagement';
import { gridCardTldrCoverClassName } from '../common/GridCardTldr';

jest.mock('../../GrowthBookProvider', () => ({
  ...(jest.requireActual('../../GrowthBookProvider') as Record<
    string,
    unknown
  >),
  useFeature: jest.fn(),
}));

const mockUseFeature = jest.mocked(useFeature);

const mockAdLabelVariant = (variant: AdLabelVariant): void => {
  mockUseFeature.mockImplementation(((feature: { id: string }) =>
    feature?.id === featureAdLabel.id ? variant : undefined) as never);
};

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

const getNormalizedText = (element?: Element | null): string =>
  element?.textContent?.replace(/\u200B/g, '').trim() ?? '';

// The list card's header holds nothing but the favicon and the disclosure, so
// match the disclosure itself rather than every ancestor with the same text.
const getAttributionText = (element?: Element | null): string =>
  element?.getAttribute('data-testid') === 'adAttribution'
    ? getNormalizedText(element)
    : '';

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

it('should float the grid ad controls over the creative only when compact', () => {
  const { rerender } = renderGridComponent();
  const controls = () =>
    screen.getByRole('link', { name: 'Advertise here' }).closest('.mx-4');

  expect(screen.getByTestId('adItem')).not.toHaveClass('group/ad');
  expect(controls()).toHaveClass('my-1');
  expect(controls()).not.toHaveClass('absolute');

  rerender(
    <TestBootProvider client={new QueryClient()}>
      <ActiveFeedContext.Provider value={{ items: [], queryKey: ['test'] }}>
        <AdGrid {...defaultProps} isCompact />
      </ActiveFeedContext.Provider>
    </TestBootProvider>,
  );

  expect(screen.getByTestId('adItem')).toHaveClass('group/ad');
  expect(controls()).toHaveClass('absolute');
  // Still reachable from the keyboard, which shows them.
  expect(screen.getByRole('link', { name: 'Advertise here' })).toBeVisible();
});

const promotedMatcher = (_: string, element?: Element | null): boolean =>
  getAttributionText(element) === 'Promoted' ||
  getAttributionText(element).startsWith('Promoted by ');

const promotedByMatcher =
  (source: string) =>
  (_: string, element?: Element | null): boolean =>
    getAttributionText(element) === `Promoted by ${source}`;

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
  expect(link).toHaveAttribute('rel', anchorSponsoredRel);
});

it('should render plain Promoted attribution without source link', async () => {
  renderListComponent();

  const attribution = await screen.findByText(
    (_, element) => getAttributionText(element) === 'Promoted',
  );
  expect(attribution.tagName).not.toBe('A');
});

it('should render Promoted attribution in grid variant', async () => {
  renderGridComponent();
  expect(await screen.findByText(promotedMatcher)).toBeInTheDocument();
});

const adLabelMatcher = (_: string, element?: Element | null): boolean =>
  getAttributionText(element) === 'Ad';

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

// These assert the class list, not the rendered gap: jsdom has no stylesheet to
// compute against. They catch the class being dropped, not a parent rule
// beating it, which is the failure Storybook's Ad Card Fixes page is the real
// check for.
describe('ad card spacing and controls', () => {
  it('should keep the disclosure off the ad copy on the grid card', async () => {
    renderGridComponent();

    const attribution = await screen.findByTestId('adAttribution');
    expect(attribution).toHaveClass('mt-3');
  });

  it('should put the list disclosure in the header, above the title like a post source', async () => {
    renderListComponent();

    const attribution = await screen.findByTestId('adAttribution');
    const title = screen.getByRole('heading', { level: 3 });
    expect(title).not.toContainElement(attribution);
    expect(
      // eslint-disable-next-line no-bitwise
      attribution.compareDocumentPosition(title) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('should size the list creative like a post cover', async () => {
    renderListComponent();

    const image = await screen.findByAltText('Ad image');
    expect(image).toHaveClass('h-40', 'w-full', 'mobileXL:w-60');
  });

  it('should render the list remove control flat, like the grid card', async () => {
    renderListComponent();

    const remove = await screen.findByRole('link', { name: 'Remove' });
    expect(remove).toHaveClass('btn-tertiary-bacon');
    expect(remove).not.toHaveClass('btn-tertiaryFloat-bacon');
  });
});

const renderGridTldrArm = (isEnabled: boolean): RenderResult => {
  const gb = new GrowthBook();
  gb.setFeatures({ [featureGridCardTldr.id]: { defaultValue: isEnabled } });
  return renderGridComponent({}, { gb });
};

it('should give the grid creative the shorter TLDR cover in the grid_card_tldr arm', async () => {
  renderGridTldrArm(true);

  expect(await screen.findByAltText('Ad image')).toHaveClass(
    gridCardTldrCoverClassName,
  );
});

it('should keep the grid creative cover in the grid_card_tldr control', async () => {
  renderGridTldrArm(false);

  expect(await screen.findByAltText('Ad image')).not.toHaveClass(
    gridCardTldrCoverClassName,
  );
});

it('should render advertise link on list ad', () => {
  renderListComponent();

  expect(screen.getByRole('link', { name: 'Advertise here' })).toHaveAttribute(
    'href',
    businessWebsiteUrl,
  );
});

it.each([
  ['grid', renderGridComponent],
  ['list', renderListComponent],
])('should track viewability on the %s card', async (_, renderComponent) => {
  renderComponent();

  const tracker = await screen.findByTestId('adViewability');
  // It only measures the creative's box while it stretches over the card root.
  const card = tracker.closest('article');
  expect(card).toBe(tracker.parentElement);
  expect(card).toHaveClass('relative');
});
