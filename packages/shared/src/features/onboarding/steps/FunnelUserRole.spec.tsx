import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { FunnelUserRole } from './FunnelUserRole';
import type { FunnelStepUserRole } from '../types/funnel';
import { FunnelStepTransitionType, FunnelStepType } from '../types/funnel';
import { useAuthContext } from '../../../contexts/AuthContext';
import useProfileForm from '../../../hooks/useProfileForm';
import type { UpdateProfileParameters } from '../../../hooks/useProfileForm';

jest.mock('../../../contexts/AuthContext');
jest.mock('../../../hooks/useProfileForm');

const updateUserProfile = jest.fn((params: UpdateProfileParameters) =>
  params.onUpdateSuccess?.(),
);
const updateUser = jest.fn();
const onTransition = jest.fn();

const renderStep = (user: Record<string, unknown> = {}) => {
  (useAuthContext as jest.Mock).mockReturnValue({
    user: { id: 'u1', name: 'Ido', ...user },
    updateUser,
  });
  (useProfileForm as jest.Mock).mockReturnValue({
    updateUserProfile,
    isLoading: false,
  });

  const step = {
    id: 'user-role',
    type: FunnelStepType.UserRole,
    isActive: true,
    parameters: {},
    transitions: [],
    onTransition,
  } as unknown as FunnelStepUserRole;

  return render(<FunnelUserRole {...step} />);
};

const pick = (name: string) =>
  fireEvent.click(screen.getByRole('checkbox', { name }));

const next = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));

describe('FunnelUserRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // jsdom does not implement scrolling.
    jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  it('should wait for Continue after a role is picked', () => {
    renderStep();

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    pick('Developer');

    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    expect(screen.getByText('Who are you?')).toBeInTheDocument();
    expect(updateUserProfile).not.toHaveBeenCalled();
  });

  it('should store the picked experience level for an engineering role', () => {
    renderStep();

    pick('Developer');
    next();
    pick('Experienced, 4-5 years');
    next();

    expect(updateUserProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Developer',
        experienceLevel: 'MORE_THAN_4_YEARS',
      }),
    );
    expect(onTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { role: 'Developer', experienceLevel: 'MORE_THAN_4_YEARS' },
    });
  });

  it('should keep a non-engineering role out of the engineer signup conversions', () => {
    // `NOT_ENGINEER` is what PixelsContext reads to leave a signup out of the
    // engineer_signup events; the years answer goes to the funnel instead.
    renderStep();

    pick('Designer');
    next();
    pick('Experienced, 4-5 years');
    next();

    expect(updateUserProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Designer',
        experienceLevel: 'NOT_ENGINEER',
      }),
    );
    expect(onTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { role: 'Designer', experienceLevel: 'MORE_THAN_4_YEARS' },
    });
  });

  it('should only ask for the role when the experience level is already on file', () => {
    renderStep({ experienceLevel: 'MORE_THAN_2_YEARS' });

    pick('Founder');
    next();

    const [[params]] = updateUserProfile.mock.calls;
    expect(params.title).toBe('Founder');
    expect(params).not.toHaveProperty('experienceLevel');
    expect(onTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { role: 'Founder', experienceLevel: 'MORE_THAN_2_YEARS' },
    });
  });

  it('should carry the answers forward when the profile cannot be saved yet', () => {
    let onError: (() => void) | undefined;
    (useProfileForm as jest.Mock).mockImplementation((options) => {
      onError = options?.onError;
      return { updateUserProfile: () => onError?.(), isLoading: false };
    });
    (useAuthContext as jest.Mock).mockReturnValue({
      user: { id: 'u1', name: 'Ido' },
      updateUser,
    });
    const step = {
      id: 'user-role',
      type: FunnelStepType.UserRole,
      isActive: true,
      parameters: {},
      transitions: [],
      onTransition,
    } as unknown as FunnelStepUserRole;
    render(<FunnelUserRole {...step} />);

    pick('Designer');
    next();
    pick('Experienced, 4-5 years');
    next();

    expect(updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Designer',
        experienceLevel: 'NOT_ENGINEER',
      }),
    );
    expect(onTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { role: 'Designer', experienceLevel: 'MORE_THAN_4_YEARS' },
    });
  });
});
