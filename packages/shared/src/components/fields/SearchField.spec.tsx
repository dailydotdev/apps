import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SearchFieldProps } from './SearchField';
import { SearchField } from './SearchField';

const renderComponent = (
  props: Partial<SearchFieldProps> = {},
): RenderResult => {
  const defaultProps: SearchFieldProps = {
    inputId: 'name',
    name: 'name',
  };
  return render(<SearchField {...defaultProps} {...props} />);
};

const getInput = (): HTMLInputElement =>
  screen.queryByRole('textbox') as HTMLInputElement;

const getClearButton = (): HTMLButtonElement =>
  screen.queryByTitle('Clear query') as HTMLButtonElement;

it('should not show clear button when input is empty', async () => {
  renderComponent();
  await waitFor(() => expect(getClearButton()).not.toBeInTheDocument());
});

it('should show clear button when input is filled', async () => {
  renderComponent({ value: 'search' });
  await waitFor(() => expect(getClearButton()).toBeInTheDocument());
});

it('should clear input when clicking', async () => {
  renderComponent({ value: 'search' });
  expect(getInput().value).toEqual('search');
  fireEvent.click(getClearButton());
  expect(getInput().value).toEqual('');
});
