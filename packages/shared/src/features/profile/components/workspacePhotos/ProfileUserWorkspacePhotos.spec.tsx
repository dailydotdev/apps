import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PublicProfile } from '../../../../lib/user';
import { ProfileUserWorkspacePhotos } from './ProfileUserWorkspacePhotos';
import { useUserWorkspacePhotos } from '../../hooks/useUserWorkspacePhotos';
import { useGear } from '../../hooks/useGear';
import { getLogContextStatic } from '../../../../contexts/LogContext';

jest.mock('../../hooks/useUserWorkspacePhotos', () => ({
  ...jest.requireActual('../../hooks/useUserWorkspacePhotos'),
  useUserWorkspacePhotos: jest.fn(),
}));

jest.mock('../../hooks/useGear', () => ({
  useGear: jest.fn(),
}));

jest.mock('../../../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: jest.fn() }),
}));

jest.mock('../../../../hooks/usePrompt', () => ({
  usePrompt: () => ({ showPrompt: jest.fn() }),
}));

const LogContext = getLogContextStatic();

const mockUseUserWorkspacePhotos =
  useUserWorkspacePhotos as jest.MockedFunction<typeof useUserWorkspacePhotos>;
const mockUseGear = useGear as jest.MockedFunction<typeof useGear>;

const baseUser: PublicProfile = {
  id: 'u1',
  name: 'Test User',
  username: 'testuser',
  image: 'https://daily.dev/user.png',
  permalink: 'https://daily.dev/testuser',
  reputation: 100,
  createdAt: '2020-01-01T00:00:00.000Z',
  premium: false,
};

const photo = {
  id: 'p1',
  image: 'https://daily.dev/desk.png',
  position: 0,
};

const renderComponent = () =>
  render(
    <LogContext.Provider
      value={{
        logEvent: jest.fn(),
        logEventStart: jest.fn(),
        logEventEnd: jest.fn(),
        sendBeacon: jest.fn(),
      }}
    >
      <ProfileUserWorkspacePhotos user={baseUser} />
    </LogContext.Provider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockUseUserWorkspacePhotos.mockReturnValue({
    photos: [photo],
    isOwner: false,
    canAddMore: true,
    add: jest.fn(),
    remove: jest.fn(),
    reorder: jest.fn(),
  } as unknown as ReturnType<typeof useUserWorkspacePhotos>);
  mockUseGear.mockReturnValue({
    gearItems: [],
    isOwner: false,
    add: jest.fn(),
    remove: jest.fn(),
  } as unknown as ReturnType<typeof useGear>);
});

const openLightbox = () => {
  fireEvent.click(screen.getByRole('button', { name: 'View workspace photo' }));
};

describe('ProfileUserWorkspacePhotos lightbox', () => {
  it('opens the lightbox with a dialog role when a photo is clicked', () => {
    renderComponent();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    openLightbox();

    expect(
      screen.getByRole('dialog', { name: 'Workspace photo lightbox' }),
    ).toBeInTheDocument();
  });

  it('renders a backdrop with a blur utility class', () => {
    renderComponent();
    openLightbox();

    const backdrop = screen.getByRole('button', { name: 'Close lightbox' });
    expect(backdrop.className).toMatch(/backdrop-blur/);
  });

  it('closes the lightbox when the backdrop is clicked', () => {
    renderComponent();
    openLightbox();

    fireEvent.click(screen.getByRole('button', { name: 'Close lightbox' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the lightbox when the close button is clicked', () => {
    renderComponent();
    openLightbox();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
