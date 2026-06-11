import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GivebackCampaignPanel } from './GivebackCampaignPanel';
import { useContributionStatus } from '../hooks/useContributionStatus';
import { useContributionCausePicker } from '../hooks/useContributionCausePicker';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import type { ContributionCause } from '../types';

jest.mock('../hooks/useContributionStatus');
jest.mock('../hooks/useContributionCausePicker');
jest.mock('../../../contexts/LogContext');
jest.mock('./GivebackEditCausesModal', () => ({
  GivebackEditCausesModal: (): JSX.Element => (
    <div role="dialog">Edit your causes</div>
  ),
}));

const mockStatus = useContributionStatus as jest.MockedFunction<
  typeof useContributionStatus
>;
const mockPicker = useContributionCausePicker as jest.MockedFunction<
  typeof useContributionCausePicker
>;
const mockLog = useLogContext as jest.MockedFunction<typeof useLogContext>;
const logEvent = jest.fn();

const cause = (id: string, title: string): ContributionCause => ({
  id,
  title,
  url: 'https://example.com',
  description: null,
  category: 'Open source',
  logoUrl: null,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockLog.mockReturnValue({ logEvent } as unknown as ReturnType<
    typeof useLogContext
  >);
  mockStatus.mockReturnValue({
    status: {
      enabled: true,
      eligible: true,
      currentCyclePoints: 0,
      currentCycleTargetPoints: 50000,
      lifetimePoints: 0,
      lifetimeAmountCents: 0,
      contributorsCount: 0,
      userPoints: 0,
    },
    isPending: false,
  });
  mockPicker.mockReturnValue({
    causes: [cause('c1', 'Open Source Fund'), cause('c2', 'Code Scholarships')],
    selectedCauseIds: ['c1'],
    isPending: false,
  });
});

it('renders the campaign headline and reason', () => {
  render(<GivebackCampaignPanel />);

  expect(screen.getByText('Big tech buys ads.')).toBeInTheDocument();
  expect(screen.getByText('We fund developers.')).toBeInTheDocument();
  expect(screen.getByText(/\$50,000 goes/)).toBeInTheDocument();
});

it('lists only the picked causes', () => {
  render(<GivebackCampaignPanel />);

  expect(screen.getByText('Open Source Fund')).toBeInTheDocument();
  expect(screen.queryByText('Code Scholarships')).not.toBeInTheDocument();
});

it('opens the edit modal and logs it', () => {
  render(<GivebackCampaignPanel />);

  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Edit your causes')).toBeInTheDocument();
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ClickGivebackEditCauses,
    extra: JSON.stringify({ has_causes: true }),
  });
});

it('expands an FAQ answer on click', () => {
  render(<GivebackCampaignPanel />);

  expect(screen.getByText('Frequently asked questions')).toBeInTheDocument();
  const question = screen.getByRole('button', {
    name: 'Who chooses the causes?',
  });
  expect(question).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(question);

  expect(question).toHaveAttribute('aria-expanded', 'true');
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ClickGivebackFaq,
    target_id: 'causes',
  });
});

it('prompts to pick causes when none are selected', () => {
  mockPicker.mockReturnValue({
    causes: [cause('c1', 'Open Source Fund')],
    selectedCauseIds: [],
    isPending: false,
  });
  render(<GivebackCampaignPanel />);

  expect(
    screen.getByRole('button', { name: 'Pick your causes' }),
  ).toBeInTheDocument();
});
