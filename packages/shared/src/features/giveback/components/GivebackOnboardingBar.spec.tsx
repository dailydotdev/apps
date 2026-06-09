import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { GivebackOnboardingBar } from './GivebackOnboardingBar';

it('disables Continue when nothing is selected', () => {
  render(
    <GivebackOnboardingBar
      selectedCount={0}
      isSaving={false}
      onContinue={jest.fn()}
    />,
  );

  expect(screen.getByText('0 causes selected')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
});

it('continues with a selection and uses singular copy for one cause', () => {
  const onContinue = jest.fn();
  render(
    <GivebackOnboardingBar
      selectedCount={1}
      isSaving={false}
      onContinue={onContinue}
    />,
  );

  expect(screen.getByText('1 cause selected')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
  expect(onContinue).toHaveBeenCalled();
});
