import React, { useEffect, type ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import ProfileSkills from './ProfileSkills';
import { maxProfileSkillLength, maxProfileSkills } from '../common';

const mockDisplayToast = jest.fn();

jest.mock('../../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

type FormWrapperProps = {
  children: ReactNode;
  skills?: string[];
  onReady?: (methods: UseFormReturn<{ skills: string[] }>) => void;
};

const FormWrapper = ({ children, skills = [], onReady }: FormWrapperProps) => {
  const methods = useForm<{ skills: string[] }>({
    defaultValues: {
      skills,
    },
  });

  useEffect(() => {
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

const submitSkills = (input: HTMLElement, value: string) => {
  fireEvent.change(input, { target: { value } });
  advanceDebounce();
  fireEvent.keyDown(input, { code: 'Enter', key: 'Enter' });
};

describe('ProfileSkills', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
  it('does not add a skill that only differs by casing', () => {
    renderComponent({ skills: ['React'] });

    const input = screen.getByPlaceholderText('Search skills');
    submitSkills(input, 'react');

    expect(screen.getAllByRole('button', { name: /react/i })).toHaveLength(1);
  });

  it('blocks adding past the limit and shows the limit copy', () => {
    const skills = Array.from(
      { length: maxProfileSkills },
      (_, index) => `skill-${index}`,
    );
    renderComponent({ skills });

    const input = screen.getByPlaceholderText('Search skills');
    submitSkills(input, 'one too many');

    expect(
      screen.queryByRole('button', { name: 'one too many' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(`You can add up to ${maxProfileSkills} skills.`),
    ).toBeInTheDocument();
    expect(mockDisplayToast).toHaveBeenCalledWith(
      `You can add up to ${maxProfileSkills} skills. 1 skill was not added.`,
    );
  });

  it('caps a pasted batch that exceeds the limit and reports the remainder', () => {
    const skills = Array.from(
      { length: maxProfileSkills - 1 },
      (_, index) => `skill-${index}`,
    );
    renderComponent({ skills });

    const input = screen.getByPlaceholderText('Search skills');
    submitSkills(input, 'first,second,third');

    expect(screen.getByRole('button', { name: 'first' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'second' }),
    ).not.toBeInTheDocument();
    expect(mockDisplayToast).toHaveBeenCalledWith(
      `You can add up to ${maxProfileSkills} skills. 2 skills were not added.`,
    );
  });

  it('does not add a skill longer than the allowed length', () => {
    renderComponent();

    const input = screen.getByPlaceholderText('Search skills');
    const tooLong = 'a'.repeat(maxProfileSkillLength + 1);
    submitSkills(input, tooLong);

    expect(
      screen.queryByRole('button', { name: tooLong }),
    ).not.toBeInTheDocument();
    expect(mockDisplayToast).toHaveBeenCalledWith(
      `Skills can be up to ${maxProfileSkillLength} characters. 1 skill was not added.`,
    );
  });

  it('renders an array level server error', () => {
    let methods: UseFormReturn<{ skills: string[] }>;
    renderComponent({
      onReady: (form) => {
        methods = form;
      },
    });

    act(() => {
      methods.setError('skills', {
        type: 'too_big',
        message: 'You can add up to 50 skills.',
      });
    });

    expect(
      screen.getByText('You can add up to 50 skills.'),
    ).toBeInTheDocument();
  });

  it('renders an item level server error stored as a sparse array', () => {
    let methods: UseFormReturn<{ skills: string[] }>;
    renderComponent({
      skills: ['a', 'b', 'c', 'd'],
      onReady: (form) => {
        methods = form;
      },
    });

    act(() => {
      methods.setError('skills.3', {
        type: 'too_big',
        message: 'Skills can be up to 100 characters.',
      });
    });

    expect(
      screen.getByText('Skills can be up to 100 characters.'),
    ).toBeInTheDocument();
  });
});
