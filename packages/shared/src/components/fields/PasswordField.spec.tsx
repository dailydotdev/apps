import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PasswordField } from './PasswordField';
import type { TextFieldProps } from './TextField';

const renderComponent = (props: Partial<TextFieldProps> = {}): RenderResult => {
  const defaultProps: TextFieldProps = {
    inputId: 'name',
    name: 'name',
    label: 'Name',
  };
  return render(<PasswordField {...defaultProps} {...props} />);
};

const getInput = (): HTMLInputElement =>
  screen.getByRole('textbox') as HTMLInputElement;

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
  fireEvent.input(input, { bubbles: true });
  const el = await screen.findByText('Risky');
  await waitFor(() => expect(el).toHaveClass('text-status-error'));
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
  fireEvent.input(input, { bubbles: true });
  const el = await screen.findByText(`You're almost there`);
  await waitFor(() => expect(el).toHaveClass('text-status-warning'));
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
  fireEvent.input(input, { bubbles: true });
  const el = await screen.findByText('Strong as it gets');
  await waitFor(() => expect(el).toHaveClass('text-status-success'));
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
  fireEvent.click(button);
  const input = getInput();
  await waitFor(() => expect(input.type).toEqual('text'));
});
