import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import useUserExperienceForm from './useUserExperienceForm';
import { UserExperienceType } from '../graphql/user/profile';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('./useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: jest.fn() }),
}));

jest.mock('./useDirtyForm', () => ({
  __esModule: true,
  useDirtyForm: jest.fn(() => ({
    save: jest.fn(),
    allowNavigation: jest.fn(),
  })),
}));

// Mock the GraphQL mutations
jest.mock('../graphql/user/profile', () => ({
  ...jest.requireActual('../graphql/user/profile'),
  upsertUserWorkExperience: jest.fn(),
  upsertUserGeneralExperience: jest.fn(),
}));

const mockRouter = {
  back: jest.fn(),
  pathname: '/profile/experience',
  push: jest.fn(),
};

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

// BaseUserExperience type used by the hook
type BaseUserExperience = {
  type: UserExperienceType;
  title: string;
  description?: string | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  subtitle?: string | null;
  current?: boolean;
  companyId?: string | null;
};

describe('useUserExperienceForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should initialize form with default values', () => {
    const mockExperience: BaseUserExperience = {
      type: UserExperienceType.Work,
      title: 'Software Engineer',
      description: 'Building awesome things',
      startedAt: new Date('2020-01-01'),
      endedAt: new Date('2022-12-31'),
      current: false,
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: mockExperience }),
      { wrapper: createWrapper() },
    );

    expect(result.current.methods.getValues()).toMatchObject({
      type: UserExperienceType.Work,
      title: 'Software Engineer',
      description: 'Building awesome things',
    });
  });

  it('should validate required title field', async () => {
    const invalidExperience: BaseUserExperience = {
      type: UserExperienceType.Work,
      title: '', // Invalid - required field
      description: 'Description',
      startedAt: new Date('2020-01-01'),
      endedAt: new Date('2022-12-31'),
      current: false,
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: invalidExperience }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      const isValid = await result.current.methods.trigger();
      expect(isValid).toBe(false);
    });

    const { errors } = result.current.methods.formState;
    expect(errors.title).toBeDefined();
    expect(errors.title?.message).toBe('Title is required.');
  });

  it('should validate end date is required when not current', async () => {
    const invalidExperience: BaseUserExperience = {
      type: UserExperienceType.Work,
      title: 'Software Engineer',
      description: 'Description',
      startedAt: new Date('2020-01-01'),
      endedAt: undefined, // Invalid - end date required when not current
      current: false,
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: invalidExperience }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      const isValid = await result.current.methods.trigger();
      expect(isValid).toBe(false);
    });

    const { errors } = result.current.methods.formState;
    expect(errors.endedAt).toBeDefined();
    expect(errors.endedAt?.message).toBe(
      'End date is required when not current.',
    );
  });

  it('should not require end date when current is true', async () => {
    const validExperience: BaseUserExperience = {
      type: UserExperienceType.Work,
      title: 'Software Engineer',
      description: 'Description',
      startedAt: new Date('2020-01-01'),
      endedAt: undefined, // This is OK when current is true
      current: true,
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: validExperience }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      const isValid = await result.current.methods.trigger();
      expect(isValid).toBe(true);
    });

    const { errors } = result.current.methods.formState;
    expect(errors.endedAt).toBeUndefined();
  });

  it('should have isPending false initially', () => {
    const mockExperience: BaseUserExperience = {
      type: UserExperienceType.Work,
      title: 'Software Engineer',
      description: 'Building awesome things',
      startedAt: new Date('2020-01-01'),
      endedAt: new Date('2022-12-31'),
      current: false,
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: mockExperience }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isPending).toBe(false);
  });

  it('should handle current position toggle correctly', async () => {
    const mockExperience: BaseUserExperience = {
      type: UserExperienceType.Work,
      title: 'Software Engineer',
      description: 'Building awesome things',
      startedAt: new Date('2020-01-01'),
      endedAt: new Date('2022-12-31'),
      current: false,
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: mockExperience }),
      { wrapper: createWrapper() },
    );

    // Set current to true
    act(() => {
      result.current.methods.setValue('current', true);
    });

    // End date should not be required when current is true
    act(() => {
      result.current.methods.setValue('endedAt', undefined);
    });

    await act(async () => {
      const isValid = await result.current.methods.trigger();
      expect(isValid).toBe(true);
    });

    expect(result.current.methods.formState.errors.endedAt).toBeUndefined();

    // Set current back to false
    act(() => {
      result.current.methods.setValue('current', false);
    });

    await act(async () => {
      const isValid = await result.current.methods.trigger();
      expect(isValid).toBe(false);
    });

    expect(result.current.methods.formState.errors.endedAt).toBeDefined();
  });

  it('should validate max length constraints', async () => {
    const longTitle = 'a'.repeat(1001); // Exceeds max length of 1000
    const longDescription = 'a'.repeat(5001); // Exceeds max length of 5000

    const invalidExperience: BaseUserExperience = {
      type: UserExperienceType.Work,
      title: longTitle,
      description: longDescription,
      startedAt: new Date('2020-01-01'),
      endedAt: new Date('2022-12-31'),
      current: false,
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: invalidExperience }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      const isValid = await result.current.methods.trigger();
      expect(isValid).toBe(false);
    });

    const { errors } = result.current.methods.formState;
    expect(errors.title).toBeDefined();
    expect(errors.description).toBeDefined();
  });

  it('should validate start date is required', async () => {
    const invalidExperience = {
      type: UserExperienceType.Work,
      title: 'Software Engineer',
      description: 'Description',
      startedAt: undefined, // Invalid - start date is required
      endedAt: new Date('2022-12-31'),
      current: false,
    } as BaseUserExperience;

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: invalidExperience }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      const isValid = await result.current.methods.trigger();
      expect(isValid).toBe(false);
    });

    const { errors } = result.current.methods.formState;
    expect(errors.startedAt).toBeDefined();
    expect(errors.startedAt?.message).toBe('Start date is required.');
  });
});
