import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextField, TextFieldProps } from './TextField';

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
  await waitFor(() =>
    expect(el).toHaveStyle({ color: 'var(--theme-status-error)' }),
  );
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

it('should render a password field', async () => {
  renderComponent({
    fieldType: 'tertiary',
    placeholder: 'Create a password',
    label: 'Create a password',
    type: 'password',
    role: 'textbox',
  });
  const input = getInput();
  await waitFor(() => expect(input.type).toEqual('password'));
});

it('should show password strength on input', async () => {
  renderComponent({
    fieldType: 'tertiary',
    placeholder: 'Create a password',
    label: 'Create a password',
    type: 'password',
    role: 'textbox',
  });
  const input = getInput();
  input.value = 'a';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = screen.getByText('Risky');
  await waitFor(() => expect(el).toHaveClass('text-theme-status-error'));
});

it('should show medium password strength on input', async () => {
  renderComponent({
    fieldType: 'tertiary',
    placeholder: 'Create a password',
    label: 'Create a password',
    type: 'password',
    role: 'textbox',
  });
  const input = getInput();
  input.value = 'asAS12!@';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = screen.getByText(`You're almost there`);
  await waitFor(() => expect(el).toHaveClass('text-theme-status-warning'));
});

it('should show strong password strength on input', async () => {
  renderComponent({
    fieldType: 'tertiary',
    placeholder: 'Create a password',
    label: 'Create a password',
    type: 'password',
    role: 'textbox',
  });
  const input = getInput();
  input.value = 'asAS12!@as';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const el = screen.getByText('Strong as it gets');
  await waitFor(() => expect(el).toHaveClass('text-theme-status-success'));
});

it('should show the password plain text on icon click', async () => {
  renderComponent({
    fieldType: 'tertiary',
    placeholder: 'Create a password',
    label: 'Create a password',
    type: 'password',
    role: 'textbox',
  });
  const button = screen.getByRole('button');
  await button.click();
  const input = getInput();
  await waitFor(() => expect(input.type).toEqual('text'));
});
