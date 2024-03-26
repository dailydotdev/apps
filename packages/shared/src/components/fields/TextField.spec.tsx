import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextField } from './TextField';
import { TextFieldProps } from './common';

const renderComponent = (props: Partial<TextFieldProps> = {}): RenderResult => {
  const defaultProps: TextFieldProps = {
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
  expect(screen.queryByText('Name')).not.toBeInTheDocument();
  const input = getInput();
  input.focus();
  await waitFor(() => expect(input.placeholder).toEqual(''));
  await waitFor(() => expect(getLabel()).not.toHaveClass('hidden'));
});

it('should show label when input is set', () => {
  renderComponent({ value: 'Value' });
  expect(getLabel()).not.toHaveClass('hidden');
});

it('should mark field as invalid', async () => {
  renderComponent({ required: true });
  userEvent.tab();
  userEvent.tab();
  await waitFor(() =>
    expect(screen.getByTestId('field')).toHaveClass('invalid'),
  );
});

it('should set hint role as alert when invalid', async () => {
  renderComponent({ required: true, hint: 'Hint' });
  userEvent.tab();
  userEvent.tab();
  const el = screen.getByText('Hint');
  await waitFor(() => expect(el).toHaveStyle({ color: 'var(--status-error)' }));
  await waitFor(() => expect(el).toHaveAttribute('role', 'alert'));
});

it('should show both label and placeholder in secondary mode', async () => {
  renderComponent({ fieldType: 'secondary', placeholder: 'Placeholder' });
  const input = getInput();
  await waitFor(() => expect(input.placeholder).toEqual('Placeholder'));
  await waitFor(() => expect(getLabel()).toHaveTextContent('Name'));
});

it('should show label and placeholder based in its state in tertiary mode', async () => {
  renderComponent({
    fieldType: 'tertiary',
    placeholder: 'Placeholder',
    label: 'Label',
  });
  const input = getInput();
  await waitFor(() => expect(input.placeholder).toEqual('Label'));
  input.focus();
  await waitFor(() => expect(input.placeholder).toEqual('Placeholder'));
});
