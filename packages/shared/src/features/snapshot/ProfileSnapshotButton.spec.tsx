import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { captureShareImage } from '../../lib/imageShare/captureShareImage';
import { copyShareImage } from '../../lib/imageShare/copyShareImage';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { ShareProvider } from '../../lib/share';
import { ProfileSnapshotButton } from './ProfileSnapshotButton';

jest.mock('../../lib/imageShare/captureShareImage', () => ({
  captureShareImage: jest.fn(),
}));
jest.mock('../../lib/imageShare/copyShareImage', () => ({
  copyShareImage: jest.fn(),
}));

const logEvent = jest.fn();
const renderCard = jest.fn((ref) => <div ref={ref}>profile card</div>);

const client = new QueryClient();
const snapshotButton = (ownerId = 'u1') => (
  <TestBootProvider client={client} log={{ logEvent }}>
    <ProfileSnapshotButton
      filename="daily-profile-testuser"
      origin={Origin.ProfileHeader}
      ownerId={ownerId}
      renderCard={renderCard}
    />
  </TestBootProvider>
);
const renderButton = () => render(snapshotButton());

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(captureShareImage)
    .mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
  jest.mocked(copyShareImage).mockResolvedValue(true);
});

describe('ProfileSnapshotButton', () => {
  it('does not build the card until the button is armed', () => {
    renderButton();

    expect(renderCard).not.toHaveBeenCalled();

    fireEvent.pointerEnter(screen.getByLabelText('Snapshot'));

    expect(screen.getByText('profile card')).toBeInTheDocument();
  });

  it('drops the armed card when the profile changes under it', () => {
    const { rerender } = renderButton();
    fireEvent.pointerEnter(screen.getByLabelText('Snapshot'));
    expect(screen.getByText('profile card')).toBeInTheDocument();

    rerender(snapshotButton('u2'));

    expect(screen.queryByText('profile card')).not.toBeInTheDocument();
  });

  it('logs the press as a profile share with its placement', async () => {
    renderButton();
    const button = screen.getByLabelText('Snapshot');
    fireEvent.pointerEnter(button);
    fireEvent.click(button);

    await waitFor(() =>
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.ShareProfile,
        target_type: TargetType.ProfilePage,
        target_id: 'u1',
        extra: JSON.stringify({
          provider: ShareProvider.Snapshot,
          origin: Origin.ProfileHeader,
          result: 'clipboard',
        }),
      }),
    );
  });
});
