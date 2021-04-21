import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import TextField, { Props } from '../../components/fields/TextField';

const renderComponent = (props: Partial<Props> = {}): RenderResult => {
  const defaultProps: Props = {
    inputId: 'name',
    name: 'name',
    label: 'Name',
  };
  return render(<TextField {...defaultProps} {...props} />);
};

const getInput = (): HTMLInputElement =>
  screen.getByRole('textbox') as HTMLInputElement;

const getLabel = (): HTMLLabelElement =>
  screen.getByText('Name') as HTMLLabelElement;

it('should set by default placeholder as label', () => {
  renderComponent();
  expect(getInput().placeholder).toEqual('Name');
});

it('should show label when focused', async () => {
  renderComponent();
  expect(getLabel()).toHaveStyle({ display: 'none' });
  const input = getInput();
  input.focus();
  await waitFor(() => expect(input.placeholder).toEqual(''));
  await waitFor(() => expect(getLabel()).toHaveStyle({ display: 'block' }));
});

it('should show label when input is set', () => {
  renderComponent({ value: 'Value' });
  expect(getLabel()).toHaveStyle({ display: 'block' });
});

it('should mark field as invalid', async () => {
  renderComponent({ required: true });
  const input = getInput();
  input.dispatchEvent(new Event('blur', { bubbles: true }));
  await waitFor(() =>
    expect(screen.getByTestId('field')).toHaveStyle({
      'box-shadow': `inset 0.125rem 0 0 0 var(--theme-status-error)`,
    }),
  );
});

it('should set hint role as alert when invalid', async () => {
  renderComponent({ required: true, hint: 'Hint' });
  const input = getInput();
  input.dispatchEvent(new Event('blur', { bubbles: true }));
  const el = screen.getByText('Hint');
  await waitFor(() =>
    expect(el).toHaveStyle({ color: 'var(--theme-status-error)' }),
  );
  await waitFor(() => expect(el).toHaveAttribute('role', 'alert'));
});

it('should show both label and placeholder in compact mode', async () => {
  renderComponent({ compact: true, placeholder: 'Placeholder' });
  const input = getInput();
  await waitFor(() => expect(input.placeholder).toEqual('Placeholder'));
  await waitFor(() => expect(getLabel()).toHaveTextContent('Name'));
});
