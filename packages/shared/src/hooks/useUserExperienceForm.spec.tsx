import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import useUserExperienceForm from './useUserExperienceForm';
import {
  upsertUserGeneralExperience,
  upsertUserWorkExperience,
  UserExperienceType,
} from '../graphql/user/profile';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('./useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: jest.fn() }),
}));

// Mock the GraphQL mutations
jest.mock('../graphql/user/profile', () => ({
  ...jest.requireActual('../graphql/user/profile'),
  upsertUserWorkExperience: jest.fn(),
  upsertUserGeneralExperience: jest.fn(),
}));

// Mock AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}));

jest.mock('../contexts/LogContext', () => ({
  useLogContext: jest.fn(() => ({
    logEvent: jest.fn(),
  })),
}));

jest.mock('./log/useLogEventOnce', () => jest.fn());

// Mock useUserExperiencesByType hook
jest.mock('../features/profile/hooks/useUserExperiencesByType', () => ({
  useUserExperiencesByType: jest.fn(() => ({
    queryKey: ['user-experiences', 'test-type', 'test-user-id'],
  })),
}));

const mockRouter = {
  back: jest.fn(),
  pathname: '/profile/experience',
  push: jest.fn(),
};

jest.mock('./useDirtyForm', () => ({
  __esModule: true,
  useDirtyForm: jest.fn((_, { onSave }) => ({
    save: onSave,
    allowNavigation: jest.fn(),
  })),
}));

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
  customCompanyName?: string | null;
  url?: string | null;
};

describe('useUserExperienceForm', () => {
  const baseWorkExperience: BaseUserExperience = {
    type: UserExperienceType.Work,
    title: 'Software Engineer',
    description: 'Description',
    startedAt: new Date('2020-01-01'),
    endedAt: new Date('2022-12-31'),
    current: false,
  };

  const setupWorkExperienceForm = () =>
    renderHook(
      () => useUserExperienceForm({ defaultValues: baseWorkExperience }),
      {
        wrapper: createWrapper(),
      },
    );

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

  it('should include type in the mutation payload when editing', async () => {
    (upsertUserWorkExperience as jest.Mock).mockResolvedValue({ id: 'exp-1' });

    const existingExperience: BaseUserExperience & { id: string } = {
      ...baseWorkExperience,
      id: 'exp-1',
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: existingExperience }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.methods.reset({
        ...existingExperience,
        type: undefined as never,
      });
    });

    await act(async () => {
      result.current.save?.();
    });

    await waitFor(() => {
      expect(upsertUserGeneralExperience).not.toHaveBeenCalled();
      expect(upsertUserWorkExperience).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'exp-1',
          type: UserExperienceType.Work,
          title: 'Software Engineer',
        }),
        'exp-1',
      );
    });
  });

  it('should validate required title field', async () => {
    const validExperience: BaseUserExperience = {
      type: UserExperienceType.Work,
      title: 'Software Engineer',
      description: 'Description',
      startedAt: new Date('2020-01-01'),
      endedAt: new Date('2022-12-31'),
      current: false,
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: validExperience }),
      { wrapper: createWrapper() },
    );

    // Set invalid title value (empty string)
    act(() => {
      result.current.methods.setValue('title', '');
    });

    // Trigger validation for title field
    let isValid = false;
    await act(async () => {
      isValid = await result.current.methods.trigger('title');
    });

    // Validation should fail for empty title
    expect(isValid).toBe(false);
  });

  it('should validate end date is required when not current', async () => {
    const validExperience: BaseUserExperience = {
      type: UserExperienceType.Work,
      title: 'Software Engineer',
      description: 'Description',
      startedAt: new Date('2020-01-01'),
      endedAt: new Date('2022-12-31'),
      current: false,
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: validExperience }),
      { wrapper: createWrapper() },
    );

    // Set endedAt to undefined while current is false
    act(() => {
      result.current.methods.setValue('endedAt', undefined);
      result.current.methods.setValue('current', false);
    });

    // Trigger validation
    let isValid = false;
    await act(async () => {
      isValid = await result.current.methods.trigger();
    });

    // Validation should fail when endedAt is undefined and current is false
    expect(isValid).toBe(false);
  });

  it('should fail validation when start date is after end date', async () => {
    const { result } = setupWorkExperienceForm();

    act(() => {
      result.current.methods.setValue('startedAt', new Date('2023-06-01'));
      result.current.methods.setValue('endedAt', new Date('2022-01-01'));
    });

    let isValid = false;
    await act(async () => {
      isValid = await result.current.methods.trigger();
    });

    const endedAtError = result.current.methods.getFieldState('endedAt').error;

    expect(isValid).toBe(false);
    expect(endedAtError).toBeDefined();
    expect(endedAtError?.message).toBe(
      'End date must be on or after start date.',
    );
  });

  it('should pass validation when start date is before end date', async () => {
    const { result } = setupWorkExperienceForm();

    act(() => {
      result.current.methods.setValue('startedAt', new Date('2020-01-01'));
      result.current.methods.setValue('endedAt', new Date('2022-12-31'));
    });

    let isValid = false;
    await act(async () => {
      isValid = await result.current.methods.trigger();
    });

    expect(isValid).toBe(true);
    expect(
      result.current.methods.getFieldState('endedAt').error,
    ).toBeUndefined();
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

    const validExperience: BaseUserExperience = {
      type: UserExperienceType.Work,
      title: 'Software Engineer',
      description: 'Description',
      startedAt: new Date('2020-01-01'),
      endedAt: new Date('2022-12-31'),
      current: false,
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: validExperience }),
      { wrapper: createWrapper() },
    );

    // Set values that exceed max length
    act(() => {
      result.current.methods.setValue('title', longTitle);
      result.current.methods.setValue('description', longDescription);
    });

    // Trigger validation
    let isValid = false;
    await act(async () => {
      isValid = await result.current.methods.trigger();
    });

    // Validation should fail for values exceeding max length
    expect(isValid).toBe(false);
  });

  it('should validate start date is required', async () => {
    const validExperience: BaseUserExperience = {
      type: UserExperienceType.Work,
      title: 'Software Engineer',
      description: 'Description',
      startedAt: new Date('2020-01-01'),
      endedAt: new Date('2022-12-31'),
      current: false,
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: validExperience }),
      { wrapper: createWrapper() },
    );

    // Set startedAt to undefined
    act(() => {
      result.current.methods.setValue('startedAt', undefined);
    });

    // Trigger validation for startedAt field
    let isValid = false;
    await act(async () => {
      isValid = await result.current.methods.trigger('startedAt');
    });

    // Validation should fail for undefined startedAt
    expect(isValid).toBe(false);
  });

  it('should validate repository with nullable id for custom repositories', async () => {
    const openSourceExperience: BaseUserExperience & {
      repository?: {
        id: string | null;
        owner: string | null;
        name: string;
        url: string;
        image: string | null;
      };
    } = {
      type: UserExperienceType.OpenSource,
      title: 'Open Source Contributor',
      description: 'Contributing to projects',
      startedAt: new Date('2023-01-01'),
      current: true,
      repository: {
        id: null, // Custom repository has null id
        owner: 'myorg',
        name: 'myrepo',
        url: 'https://gitlab.com/myorg/myrepo',
        image: null,
      },
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: openSourceExperience }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      const isValid = await result.current.methods.trigger('repository');
      // Should be valid even with null id
      expect(isValid).toBe(true);
    });
  });

  it('should validate custom repository with inferred GitHub URL', async () => {
    const openSourceExperience: BaseUserExperience & {
      repository?: {
        id: string | null;
        owner: string | null;
        name: string;
        url: string;
        image: string | null;
      };
    } = {
      type: UserExperienceType.OpenSource,
      title: 'Open Source Contributor',
      description: 'Contributing to projects',
      startedAt: new Date('2023-01-01'),
      current: true,
      repository: {
        id: null,
        owner: 'myorg',
        name: 'myrepo',
        url: 'https://github.com/myorg/myrepo',
        image: null,
      },
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: openSourceExperience }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      const isValid = await result.current.methods.trigger('repository');
      expect(isValid).toBe(true);
    });
  });

  it('should validate repository with GitHub id', async () => {
    const openSourceExperience: BaseUserExperience & {
      repository?: {
        id: string | null;
        owner: string | null;
        name: string;
        url: string;
        image: string | null;
      };
    } = {
      type: UserExperienceType.OpenSource,
      title: 'React Contributor',
      description: 'Contributing to React',
      startedAt: new Date('2023-01-01'),
      current: true,
      repository: {
        id: '10270250', // GitHub repository has string id
        owner: 'facebook',
        name: 'react',
        url: 'https://github.com/facebook/react',
        image: 'https://avatars.githubusercontent.com/u/69631?v=4',
      },
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: openSourceExperience }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      const isValid = await result.current.methods.trigger('repository');
      expect(isValid).toBe(true);
    });
  });

  it('should require repository URL even for custom repositories', async () => {
    const openSourceExperience: BaseUserExperience & {
      repository?: {
        id: string | null;
        owner: string | null;
        name: string;
        url: string | null;
        image: string | null;
      };
    } = {
      type: UserExperienceType.OpenSource,
      title: 'Open Source Contributor',
      startedAt: new Date('2023-01-01'),
      current: true,
      repository: {
        id: null,
        owner: 'myorg',
        name: 'myrepo',
        url: null, // Missing URL should fail validation
        image: null,
      },
    };

    const { result } = renderHook(
      () => useUserExperienceForm({ defaultValues: openSourceExperience }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      const isValid = await result.current.methods.trigger('repository');
      // Should be invalid without URL
      expect(isValid).toBe(false);
    });
  });
});
