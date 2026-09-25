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
const onTransition = jest.fn();

const renderStep = (user: Record<string, unknown> = {}) => {
  (useAuthContext as jest.Mock).mockReturnValue({
    user: { id: 'u1', name: 'Ido', ...user },
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
    (useProfileForm as jest.Mock).mockReturnValue({
      updateUserProfile,
      isLoading: false,
    });
  });

  it('should store the picked role as the job title', () => {
    renderStep();

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    pick('AI engineer');
    next();

    expect(updateUserProfile).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'AI engineer' }),
    );
    expect(updateUserProfile.mock.calls[0][0]).not.toHaveProperty(
      'experienceLevel',
    );
    expect(onTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { role: 'AI engineer' },
    });
  });

  it('should not put "Other" on the profile as a job title', () => {
    renderStep();

    pick('Something else');
    next();

    expect(updateUserProfile).not.toHaveBeenCalled();
    expect(onTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { role: 'Other' },
    });
  });

  it('should move on when the title cannot be saved', () => {
    (useProfileForm as jest.Mock).mockImplementation((options) => ({
      updateUserProfile: () => options?.onError?.(),
      isLoading: false,
    }));
    renderStep();

    pick('Designer');
    next();

    expect(onTransition).toHaveBeenCalledWith({
      type: FunnelStepTransitionType.Complete,
      details: { role: 'Designer' },
    });
  });
});
