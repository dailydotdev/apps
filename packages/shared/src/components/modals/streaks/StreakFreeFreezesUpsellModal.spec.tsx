import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ReactModal from 'react-modal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  STREAK_FREE_FREEZES_UPSELL_DESCRIPTION,
  STREAK_FREE_FREEZES_UPSELL_TITLE,
  StreakFreeFreezesUpsellModal,
} from './StreakFreeFreezesUpsellModal';
import { LazyModal } from '../common/types';
import { LogEvent, TargetType } from '../../../lib/log';

ReactModal.setAppElement('body');

const mockLogEvent = jest.fn();
const mockOpenModal = jest.fn();

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../../hooks/useLazyModal', () => ({
  useLazyModal: () => ({ openModal: mockOpenModal }),
}));

const onRequestClose = jest.fn();

const renderModal = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <StreakFreeFreezesUpsellModal isOpen onRequestClose={onRequestClose} />
    </QueryClientProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

it('shows the last free freeze copy and logs an impression', () => {
  renderModal();

  expect(
    screen.getByText(STREAK_FREE_FREEZES_UPSELL_TITLE),
  ).toBeInTheDocument();
  expect(
    screen.getByText(STREAK_FREE_FREEZES_UPSELL_DESCRIPTION),
  ).toBeInTheDocument();
  expect(
    `${STREAK_FREE_FREEZES_UPSELL_TITLE} ${STREAK_FREE_FREEZES_UPSELL_DESCRIPTION}`,
  ).toEqual(
    'We sorted you out twice. That was your last free freeze. Get more so a busy day never costs you your streak.',
  );
  expect(mockLogEvent).toHaveBeenCalledTimes(1);
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Impression,
    target_type: TargetType.StreakFreeFreezesUpsell,
  });
});

it('opens the freeze purchase on "Get freezes"', () => {
  renderModal();

  fireEvent.click(screen.getByRole('button', { name: 'Get freezes' }));

  expect(mockOpenModal).toHaveBeenCalledWith({
    type: LazyModal.StreakFreezePurchase,
  });
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Click,
    target_type: TargetType.StreakFreeFreezesUpsell,
    target_id: 'get freezes',
  });
});

it('closes on "Maybe later"', () => {
  renderModal();

  fireEvent.click(screen.getByRole('button', { name: 'Maybe later' }));

  expect(onRequestClose).toHaveBeenCalled();
  expect(mockOpenModal).not.toHaveBeenCalled();
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.Click,
    target_type: TargetType.StreakFreeFreezesUpsell,
    target_id: 'maybe later',
  });
});
