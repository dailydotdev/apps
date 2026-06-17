import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GivebackSponsorTiers } from './GivebackSponsorTiers';
import { useContributionSponsors } from '../hooks/useContributionSponsors';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import { ContributionSponsorTier } from '../types';
import type { ContributionSponsor } from '../types';

jest.mock('../hooks/useContributionSponsors');
jest.mock('../../../contexts/LogContext');

const mockUseContributionSponsors =
  useContributionSponsors as jest.MockedFunction<
    typeof useContributionSponsors
  >;
const mockUseLogContext = useLogContext as jest.MockedFunction<
  typeof useLogContext
>;

const logEvent = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLogContext.mockReturnValue({ logEvent } as unknown as ReturnType<
    typeof useLogContext
  >);
});

const sponsor = (
  overrides: Partial<ContributionSponsor> & Pick<ContributionSponsor, 'id'>,
): ContributionSponsor => ({
  name: 'Acme',
  amountCents: 300000,
  url: 'https://acme.test',
  logoUrl: 'https://logos.test/acme.svg',
  tier: ContributionSponsorTier.Gold,
  ...overrides,
});

it('renders a brand logo card with an explicit tier pill per sponsor', () => {
  mockUseContributionSponsors.mockReturnValue({
    sponsors: [
      sponsor({ id: '1', name: 'Vercel', tier: ContributionSponsorTier.Gold }),
      sponsor({
        id: '2',
        name: 'GitHub',
        tier: ContributionSponsorTier.Silver,
      }),
      sponsor({
        id: '3',
        name: 'Datadog',
        tier: ContributionSponsorTier.Bronze,
      }),
    ],
    isPending: false,
  });

  render(<GivebackSponsorTiers />);

  expect(screen.getByText('Sponsored by')).toBeInTheDocument();
  expect(screen.getByText('Gold sponsor')).toBeInTheDocument();
  expect(screen.getByText('Bronze sponsor')).toBeInTheDocument();

  const link = screen.getByRole('link', { name: 'Vercel' });
  expect(link).toHaveAttribute('href', 'https://acme.test');
  expect(screen.getByAltText('Vercel logo')).toHaveAttribute(
    'src',
    'https://logos.test/acme.svg',
  );
});

it('logs a sponsor click with the sponsor id and tier', () => {
  mockUseContributionSponsors.mockReturnValue({
    sponsors: [
      sponsor({ id: 's1', name: 'Vercel', tier: ContributionSponsorTier.Gold }),
    ],
    isPending: false,
  });

  render(<GivebackSponsorTiers />);
  fireEvent.click(screen.getByRole('link', { name: 'Vercel' }));

  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ClickGivebackSponsor,
    target_id: 's1',
    extra: JSON.stringify({
      name: 'Vercel',
      tier: ContributionSponsorTier.Gold,
    }),
  });
});

it('falls back to a name pill when a sponsor has no logo', () => {
  mockUseContributionSponsors.mockReturnValue({
    sponsors: [
      sponsor({
        id: '1',
        name: 'Dana K.',
        tier: ContributionSponsorTier.Bronze,
        logoUrl: null,
        url: null,
      }),
    ],
    isPending: false,
  });

  render(<GivebackSponsorTiers />);

  expect(screen.getByText('Dana K.')).toBeInTheDocument();
});

it('renders nothing when there are no sponsors', () => {
  mockUseContributionSponsors.mockReturnValue({
    sponsors: [],
    isPending: false,
  });

  const { container } = render(<GivebackSponsorTiers />);

  expect(container).toBeEmptyDOMElement();
});
