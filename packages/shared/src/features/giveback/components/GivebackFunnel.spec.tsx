import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GivebackFunnel } from './GivebackFunnel';
import type { useGivebackCauseSelection } from '../hooks/useGivebackCauseSelection';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';

jest.mock('../../../contexts/LogContext');

const mockUseLogContext = useLogContext as jest.MockedFunction<
  typeof useLogContext
>;
const logEvent = jest.fn();

type Selection = ReturnType<typeof useGivebackCauseSelection>;

const buildSelection = (overrides: Partial<Selection> = {}): Selection => ({
  causes: [],
  isLoading: false,
  selectedIds: new Set<string>(),
  toggleCause: jest.fn(),
  selectedCount: 0,
  hasSavedCauses: false,
  save: jest.fn().mockResolvedValue(true),
  isSaving: false,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseLogContext.mockReturnValue({ logEvent } as unknown as ReturnType<
    typeof useLogContext
  >);
});

const advance = (label: string) =>
  fireEvent.click(screen.getByRole('button', { name: label }));

it('walks every step and completes on the final CTA', () => {
  const onComplete = jest.fn();
  render(
    <GivebackFunnel selection={buildSelection()} onComplete={onComplete} />,
  );

  expect(
    screen.getByText('Your activity funds real causes'),
  ).toBeInTheDocument();

  advance('Got it');
  expect(screen.getByText('You act. We pay. Causes win.')).toBeInTheDocument();

  // No causes available → Continue is not blocked.
  advance('Sounds good');
  advance('Continue');
  expect(screen.getByText('Real causes. Real impact.')).toBeInTheDocument();

  // Impact is now the final step; its CTA completes the funnel.
  advance("Let's start");

  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(logEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_name: LogEvent.CompleteGivebackFunnel }),
  );
});

it('blocks the causes step until at least one cause is picked', () => {
  const { rerender } = render(
    <GivebackFunnel
      selection={buildSelection({
        causes: [
          {
            id: 'c1',
            title: 'Open source',
            description: null,
            url: null,
            category: null,
            logoUrl: null,
          },
        ],
      })}
      onComplete={jest.fn()}
    />,
  );

  advance('Got it');
  advance('Sounds good');

  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();

  rerender(
    <GivebackFunnel
      selection={buildSelection({
        causes: [
          {
            id: 'c1',
            title: 'Open source',
            description: null,
            url: null,
            category: null,
            logoUrl: null,
          },
        ],
        selectedIds: new Set(['c1']),
        selectedCount: 1,
      })}
      onComplete={jest.fn()}
    />,
  );

  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
});

it('shows a close control only when it can be closed', () => {
  const onClose = jest.fn();
  const { rerender } = render(
    <GivebackFunnel selection={buildSelection()} onComplete={jest.fn()} />,
  );
  expect(screen.queryByTitle('Close')).not.toBeInTheDocument();

  rerender(
    <GivebackFunnel
      selection={buildSelection()}
      canClose
      onClose={onClose}
      onComplete={jest.fn()}
    />,
  );
  fireEvent.click(screen.getByTitle('Close'));
  expect(onClose).toHaveBeenCalled();
});
