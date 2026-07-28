import React from 'react';
import type { RenderResult } from '@testing-library/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { AchievementShareActions } from './AchievementShareActions';
import { AchievementType } from '../../../../graphql/user/achievements';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { Origin } from '../../../../lib/log';
import { useViewSize } from '../../../../hooks/useViewSize';
import { downloadUrl } from '../../../../lib/blob';
import { shouldUseNativeShare } from '../../../../lib/func';

jest.mock('../../../../hooks/useViewSize', () => {
  const actual = jest.requireActual('../../../../hooks/useViewSize');
  return { __esModule: true, ...actual, useViewSize: jest.fn() };
});

jest.mock('../../../../lib/func', () => {
  const actual = jest.requireActual('../../../../lib/func');
  return { __esModule: true, ...actual, shouldUseNativeShare: jest.fn() };
});

jest.mock('../../../../lib/blob', () => ({
  __esModule: true,
  downloadUrl: jest.fn().mockResolvedValue(undefined),
}));

const mockDisplayToast = jest.fn();
jest.mock('../../../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../../../hooks/useToastNotification'),
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

const useViewSizeMock = useViewSize as jest.Mock;
const downloadUrlMock = downloadUrl as jest.Mock;
const shouldUseNativeShareMock = shouldUseNativeShare as jest.Mock;
const writeText = jest.fn().mockResolvedValue(undefined);

const achievement = {
  id: 'ach-1',
  name: 'Night owl',
  description: 'Read 100 posts after midnight',
  image: 'https://daily.dev/achievement.png',
  type: AchievementType.Milestone,
  criteria: { targetCount: 100 },
  points: 250,
  rarity: 3,
  unit: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  useViewSizeMock.mockReturnValue(true);
  shouldUseNativeShareMock.mockReturnValue(false);
  Object.assign(navigator, { clipboard: { writeText } });
});

const renderActions = (
  props: Partial<React.ComponentProps<typeof AchievementShareActions>> = {},
): RenderResult =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AchievementShareActions
        achievement={achievement}
        username="ada"
        name="Ada Lovelace"
        isOwner
        origin={Origin.Achievements}
        {...props}
      />
    </TestBootProvider>,
  );

describe('AchievementShareActions', () => {
  it('renders exactly one download control and one share control', () => {
    renderActions();

    expect(screen.getAllByLabelText('Download badge')).toHaveLength(1);
    expect(screen.getAllByLabelText('Share this achievement')).toHaveLength(1);
  });

  it('downloads the achievement badge image', async () => {
    renderActions();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Download badge'));
    });

    await waitFor(() =>
      expect(downloadUrlMock).toHaveBeenCalledWith({
        url: achievement.image,
        filename: 'Night owl.png',
      }),
    );
  });

  it('copies the achievement link and toasts when native share is unavailable', async () => {
    useViewSizeMock.mockReturnValue(false); // mobile
    renderActions();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share this achievement'));
    });

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        expect.stringContaining('ada/achievements'),
      ),
    );
    expect(mockDisplayToast).toHaveBeenCalledWith(
      '✅ Copied link to clipboard',
      expect.anything(),
    );
  });

  it('uses the native share sheet on mobile when available', async () => {
    useViewSizeMock.mockReturnValue(false);
    shouldUseNativeShareMock.mockReturnValue(true);
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });
    renderActions();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Share this achievement'));
    });

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(writeText).not.toHaveBeenCalled();
  });

  it('omits the share control when the profile has no username', () => {
    renderActions({ username: undefined });

    expect(
      screen.queryByLabelText('Share this achievement'),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Download badge')).toBeInTheDocument();
  });
});
