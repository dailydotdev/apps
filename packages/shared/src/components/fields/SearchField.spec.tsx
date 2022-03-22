import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { SearchField, SearchFieldProps } from './SearchField';

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
  getClearButton().click();
  expect(getInput().value).toEqual('');
});
