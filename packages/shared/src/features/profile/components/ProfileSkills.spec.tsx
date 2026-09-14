import React, { type ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import ProfileSkills from './ProfileSkills';
import { userExperienceSkillsLimit } from '../common';

const mockDisplayToast = jest.fn();

jest.mock('../../opportunity/queries', () => ({
  getKeywordAutocompleteOptions: () => ({
    queryKey: ['keyword-autocomplete'],
    queryFn: jest.fn(),
    enabled: false,
  }),
}));

jest.mock('../../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

type FormValues = {
  skills: string[];
};

type FormWrapperProps = {
  children: ReactNode;
  defaultSkills?: string[];
  onReady?: (methods: UseFormReturn<FormValues>) => void;
};

const FormWrapper = ({
  children,
  defaultSkills = [],
  onReady,
}: FormWrapperProps) => {
  const methods = useForm<FormValues>({
    defaultValues: {
      skills: defaultSkills,
    },
  });

  React.useEffect(() => {
    onReady?.(methods);
  }, [methods, onReady]);

  return (
    <QueryClientProvider client={new QueryClient()}>
      <FormProvider {...methods}>{children}</FormProvider>
    </QueryClientProvider>
  );
};

const renderComponent = (props: Omit<FormWrapperProps, 'children'> = {}) =>
  render(
    <FormWrapper {...props}>
      <ProfileSkills name="skills" />
    </FormWrapper>,
  );

const advanceDebounce = () => {
  act(() => {
    jest.advanceTimersByTime(300);
  });
};

describe('ProfileSkills', () => {
  beforeEach(() => {
    mockDisplayToast.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('keeps the input empty after clearing a pending debounced query', () => {
    renderComponent();

    const input = screen.getByPlaceholderText('Search skills');

    fireEvent.change(input, { target: { value: 'R' } });
    fireEvent.change(input, { target: { value: '' } });

    expect(input).toHaveValue('');

    advanceDebounce();

    expect(input).toHaveValue('');
  });

  it('keeps the input empty after submitting while a debounced query is pending', () => {
    renderComponent();

    const input = screen.getByPlaceholderText('Search skills');

    fireEvent.change(input, { target: { value: 'R' } });
    advanceDebounce();

    expect(input).toHaveValue('R');

    fireEvent.change(input, { target: { value: 'A' } });
    fireEvent.keyDown(input, { code: 'Enter', key: 'Enter' });

    expect(screen.getByRole('button', { name: 'R' })).toBeInTheDocument();
    expect(input).toHaveValue('');

    advanceDebounce();

    expect(input).toHaveValue('');
  });

  it('blocks adding skills after the limit and shows helper copy', () => {
    const skills = Array.from(
      { length: userExperienceSkillsLimit },
      (_, index) => `Skill ${index}`,
    );
    renderComponent({ defaultSkills: skills });

    expect(
      screen.getByText(`You can add up to ${userExperienceSkillsLimit} skills`),
    ).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Search skills');
    fireEvent.change(input, { target: { value: 'Extra' } });
    advanceDebounce();
    fireEvent.keyDown(input, { code: 'Enter', key: 'Enter' });

    expect(
      screen.queryByRole('button', { name: 'Extra' }),
    ).not.toBeInTheDocument();
    expect(mockDisplayToast).toHaveBeenCalledWith(
      `You can add up to ${userExperienceSkillsLimit} skills`,
    );
  });

  it('adds only the skills that fit when a comma batch exceeds the limit', () => {
    const skills = Array.from(
      { length: userExperienceSkillsLimit - 1 },
      (_, index) => `Skill ${index}`,
    );
    renderComponent({ defaultSkills: skills });

    const input = screen.getByPlaceholderText('Search skills');
    fireEvent.change(input, { target: { value: 'One, Two, Three' } });
    advanceDebounce();
    fireEvent.keyDown(input, { code: 'Enter', key: 'Enter' });

    expect(screen.getByRole('button', { name: 'One' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Two' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Three' }),
    ).not.toBeInTheDocument();
    expect(mockDisplayToast).toHaveBeenCalledWith(
      `You can add up to ${userExperienceSkillsLimit} skills. Some skills were not added.`,
    );
  });

  it('dedupes added skills case-insensitively', () => {
    renderComponent();

    const input = screen.getByPlaceholderText('Search skills');
    fireEvent.change(input, {
      target: { value: 'React, react, REACT, TypeScript' },
    });
    advanceDebounce();
    fireEvent.keyDown(input, { code: 'Enter', key: 'Enter' });

    expect(screen.getAllByRole('button', { name: /react/i })).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'TypeScript' }),
    ).toBeInTheDocument();
  });

  it('renders an array-level skills error', async () => {
    renderComponent({
      onReady: (methods) => {
        methods.setError('skills', {
          type: 'too_big',
          message: 'You can add up to 50 skills.',
        });
      },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You can add up to 50 skills.',
    );
  });

  it('renders an item-level skills error', async () => {
    renderComponent({
      defaultSkills: ['TypeScript', 'React', 'Node.js', 'GraphQL'],
      onReady: (methods) => {
        methods.setError('skills.3', {
          type: 'too_big',
          message: 'Each skill must be 100 characters or less.',
        });
      },
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Each skill must be 100 characters or less.',
    );
  });
});
