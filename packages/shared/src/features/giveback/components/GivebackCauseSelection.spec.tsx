import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GivebackCauseSelection } from './GivebackCauseSelection';
import { useContributionCauses } from '../hooks/useContributionCauses';
import { useContributionCausePreferences } from '../hooks/useContributionCausePreferences';
import { useUpdateContributionCausePreferences } from '../hooks/useUpdateContributionCausePreferences';
import { useToastNotification } from '../../../hooks/useToastNotification';
import type { ContributionCause } from '../types';

jest.mock('../hooks/useContributionCauses');
jest.mock('../hooks/useContributionCausePreferences');
jest.mock('../hooks/useUpdateContributionCausePreferences');
jest.mock('../../../hooks/useToastNotification');

const mockUseCauses = useContributionCauses as jest.MockedFunction<
  typeof useContributionCauses
>;
const mockUsePreferences =
  useContributionCausePreferences as jest.MockedFunction<
    typeof useContributionCausePreferences
  >;
const mockUseUpdate =
  useUpdateContributionCausePreferences as jest.MockedFunction<
    typeof useUpdateContributionCausePreferences
  >;
const mockUseToast = useToastNotification as jest.MockedFunction<
  typeof useToastNotification
>;

const saveCausePreferences = jest.fn().mockResolvedValue(undefined);
const displayToast = jest.fn();

const cause = (
  overrides: Partial<ContributionCause> & Pick<ContributionCause, 'id'>,
): ContributionCause => ({
  title: 'Open Source Fund',
  url: 'https://cause.test',
  description: 'Funds maintainers',
  category: 'Open source',
  logoUrl: null,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseUpdate.mockReturnValue({ saveCausePreferences, isPending: false });
  mockUseToast.mockReturnValue({ displayToast } as unknown as ReturnType<
    typeof useToastNotification
  >);
  mockUsePreferences.mockReturnValue({
    selectedCauseIds: [],
    isPending: false,
  });
});

it('shows a skeleton while causes are loading', () => {
  mockUseCauses.mockReturnValue({ causes: [], isPending: true });

  render(<GivebackCauseSelection />);

  expect(
    screen.queryByRole('button', { name: 'Continue' }),
  ).not.toBeInTheDocument();
});

it('keeps Continue disabled until a cause is selected, then saves', async () => {
  mockUseCauses.mockReturnValue({
    causes: [cause({ id: 'c1', title: 'Climate' })],
    isPending: false,
  });

  const onComplete = jest.fn();
  render(<GivebackCauseSelection onComplete={onComplete} />);

  const continueButton = screen.getByRole('button', { name: 'Continue' });
  expect(continueButton).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: 'Select Climate' }));
  expect(continueButton).toBeEnabled();

  fireEvent.click(continueButton);

  await waitFor(() =>
    expect(saveCausePreferences).toHaveBeenCalledWith(['c1']),
  );
  expect(displayToast).toHaveBeenCalledWith('Your causes are saved');
  await waitFor(() => expect(onComplete).toHaveBeenCalled());
});

it('seeds the picker from saved preferences', () => {
  mockUseCauses.mockReturnValue({
    causes: [cause({ id: 'c1', title: 'Climate' })],
    isPending: false,
  });
  mockUsePreferences.mockReturnValue({
    selectedCauseIds: ['c1'],
    isPending: false,
  });

  render(<GivebackCauseSelection />);

  expect(
    screen.getByRole('button', { name: 'Deselect Climate' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
});
