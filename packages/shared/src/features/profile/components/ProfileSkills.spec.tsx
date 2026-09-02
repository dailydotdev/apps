import React, { type ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import ProfileSkills from './ProfileSkills';

type FormWrapperProps = {
  children: ReactNode;
};

const FormWrapper = ({ children }: FormWrapperProps) => {
  const methods = useForm({
    defaultValues: {
      skills: [],
    },
  });

  return (
    <QueryClientProvider client={new QueryClient()}>
      <FormProvider {...methods}>{children}</FormProvider>
    </QueryClientProvider>
  );
};

const renderComponent = () =>
  render(
    <FormWrapper>
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
});
