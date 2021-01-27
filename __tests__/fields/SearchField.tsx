import React from 'react';
import { render, RenderResult, screen } from '@testing-library/preact';
import SearchField, { Props } from '../../components/fields/SearchField';

const renderComponent = (props: Partial<Props> = {}): RenderResult => {
  const defaultProps: Props = {
    inputId: 'name',
    name: 'name',
  };
  return render(<SearchField {...defaultProps} {...props} />);
};

const getInput = (): HTMLInputElement =>
  screen.queryByRole('textbox') as HTMLInputElement;

const getClearButton = (): HTMLButtonElement =>
  screen.queryByRole('button') as HTMLButtonElement;

it('should not show clear button when input is empty', async () => {
  renderComponent();
  expect(getClearButton()).not.toBeInTheDocument();
});

it('should show clear button when input is filled', async () => {
  renderComponent({ value: 'search' });
  expect(getClearButton()).toBeInTheDocument();
});

it('should clear input when clicking', async () => {
  renderComponent({ value: 'search' });
  expect(getInput().value).toEqual('search');
  getClearButton().click();
  expect(getInput().value).toEqual('');
});
