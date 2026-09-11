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
import { labels } from '../lib/labels';

// Mock dependencies
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockDisplayToast = jest.fn();

jest.mock('./useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
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

    await act(async () => {
      await result.current.save?.();
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
  describe('server validation errors', () => {
    const zodError = (
      issues: { path: (string | number)[]; message: string }[],
    ) => ({
      response: {
        errors: [
          {
            message: 'Validation error',
            extensions: {
              code: 'ZOD_VALIDATION_ERROR',
              issues: issues.map((issue) => ({ ...issue, code: 'too_big' })),
            },
          },
        ],
      },
    });

    it('should surface a rejected skills array on the form and as a toast', async () => {
      (upsertUserWorkExperience as jest.Mock).mockRejectedValue(
        zodError([
          { path: ['skills'], message: 'You can add up to 50 skills.' },
        ]),
      );

      const { result } = setupWorkExperienceForm();

      await act(async () => {
        await result.current.save?.();
      });

      await waitFor(() => {
        expect(mockDisplayToast).toHaveBeenCalledWith(
          'You can add up to 50 skills.',
        );
      });
      expect(
        result.current.methods.getFieldState('skills' as never).error,
      ).toBeDefined();
      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(result.current.methods.getValues('title')).toBe(
        'Software Engineer',
      );
    });

    it('should surface an item level skills issue as a toast', async () => {
      (upsertUserWorkExperience as jest.Mock).mockRejectedValue(
        zodError([
          {
            path: ['skills', 3],
            message: 'Skills can be up to 100 characters.',
          },
        ]),
      );

      const { result } = setupWorkExperienceForm();

      await act(async () => {
        await result.current.save?.();
      });

      await waitFor(() => {
        expect(mockDisplayToast).toHaveBeenCalledWith(
          'Skills can be up to 100 characters.',
        );
      });
      expect(
        result.current.methods.getFieldState('skills.3' as never).error,
      ).toBeDefined();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should keep the generic toast for non zod errors', async () => {
      (upsertUserWorkExperience as jest.Mock).mockRejectedValue({
        response: {
          errors: [{ message: 'Something exploded', extensions: {} }],
        },
      });

      const { result } = setupWorkExperienceForm();

      await act(async () => {
        await result.current.save?.();
      });

      await waitFor(() => {
        expect(mockDisplayToast).toHaveBeenCalledWith('Something exploded');
      });
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('dirty form save', () => {
    it('should not run the mutation when the form is invalid', async () => {
      const { result } = setupWorkExperienceForm();

      act(() => {
        result.current.methods.setValue('title', '');
      });

      await act(async () => {
        await result.current.save?.();
      });

      expect(upsertUserWorkExperience).not.toHaveBeenCalled();
      expect(mockDisplayToast).toHaveBeenCalledWith(labels.error.formInvalid);
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should resolve only once the save settles and keep the values on failure', async () => {
      let rejectMutation: (error: unknown) => void;
      (upsertUserWorkExperience as jest.Mock).mockReturnValue(
        new Promise((_, reject) => {
          rejectMutation = reject;
        }),
      );

      const { result } = setupWorkExperienceForm();

      let settled = false;
      let savePromise: Promise<void>;
      await act(async () => {
        savePromise = Promise.resolve(result.current.save?.()).then(() => {
          settled = true;
        });
      });

      expect(settled).toBe(false);

      await act(async () => {
        rejectMutation({
          response: { errors: [{ message: 'Nope', extensions: {} }] },
        });
        await savePromise;
      });

      expect(settled).toBe(true);
      expect(result.current.methods.getValues('title')).toBe(
        'Software Engineer',
      );
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
