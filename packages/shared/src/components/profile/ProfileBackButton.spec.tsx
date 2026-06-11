import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { isPWA } from '../../lib/func';
import {
  useViewSize,
  useViewSizeClient,
  ViewSize,
} from '../../hooks/useViewSize';
import {
  ProfileDesktopPwaBackButton,
  ProfileMobileBackButton,
} from './ProfileBackButton';

jest.mock('../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../hooks/useViewSize'),
  useViewSize: jest.fn(),
  useViewSizeClient: jest.fn(),
}));

jest.mock('../../lib/func', () => ({
  ...jest.requireActual('../../lib/func'),
  isPWA: jest.fn(),
}));

jest.mock('../post/GoBackHeaderMobile', () => ({
  GoBackButton: ({ className }: { className?: string }) => (
    <button type="button" className={className}>
      Go back
    </button>
  ),
}));

const mockUseViewSize = useViewSize as jest.MockedFunction<typeof useViewSize>;
const mockUseViewSizeClient = useViewSizeClient as jest.MockedFunction<
  typeof useViewSizeClient
>;
const mockIsPWA = isPWA as jest.MockedFunction<typeof isPWA>;

describe('ProfileMobileBackButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders below laptop widths', () => {
    mockUseViewSize.mockImplementation((size) => size !== ViewSize.Laptop);

    render(<ProfileMobileBackButton className="mr-3" />);

    const button = screen.getByRole('button', { name: 'Go back' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('mr-3');
  });

  it('does not render at laptop widths', () => {
    mockUseViewSize.mockImplementation((size) => size === ViewSize.Laptop);

    render(<ProfileMobileBackButton />);

    expect(
      screen.queryByRole('button', { name: 'Go back' }),
    ).not.toBeInTheDocument();
  });
});

describe('ProfileDesktopPwaBackButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPWA.mockReturnValue(false);
  });

  it('renders at laptop widths in standalone PWA', async () => {
    mockUseViewSizeClient.mockImplementation(
      (size) => size === ViewSize.Laptop,
    );
    mockIsPWA.mockReturnValue(true);

    render(<ProfileDesktopPwaBackButton className="absolute left-4 top-4" />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Go back' }),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Go back' })).toHaveClass(
      'hidden',
      'laptop:flex',
      'absolute',
      'left-4',
      'top-4',
    );
  });

  it('does not render at laptop widths outside standalone PWA', async () => {
    mockUseViewSizeClient.mockImplementation(
      (size) => size === ViewSize.Laptop,
    );

    render(<ProfileDesktopPwaBackButton />);

    await waitFor(() => {
      expect(mockIsPWA).toHaveBeenCalled();
    });
    expect(
      screen.queryByRole('button', { name: 'Go back' }),
    ).not.toBeInTheDocument();
  });

  it('does not render below laptop widths in standalone PWA', async () => {
    mockUseViewSizeClient.mockImplementation(
      (size) => size !== ViewSize.Laptop,
    );
    mockIsPWA.mockReturnValue(true);

    render(<ProfileDesktopPwaBackButton />);

    await waitFor(() => {
      expect(mockIsPWA).toHaveBeenCalled();
    });
    expect(
      screen.queryByRole('button', { name: 'Go back' }),
    ).not.toBeInTheDocument();
  });
});
