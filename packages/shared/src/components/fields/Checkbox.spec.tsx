import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { Checkbox, CheckboxProps } from './Checkbox';

const renderComponent = (props: Partial<CheckboxProps> = {}): RenderResult => {
  return render(<Checkbox name="field" {...props} />);
};

it('should render children', async () => {
  renderComponent({ children: 'My Checkbox' });
  expect(await screen.findByText('My Checkbox')).toBeInTheDocument();
});

it('should trigger on toggle when clicked', async () => {
  const onToggle = jest.fn();
  renderComponent({ onToggleCallback: onToggle });
  const el = await screen.findByTestId('checkbox-input');
  fireEvent.click(el);
  await waitFor(() => expect(onToggle).toBeCalledWith(true));
});

it('should set value according to the checked property', async () => {
  renderComponent({ checked: true });
  const el = await screen.findByTestId('checkbox-input');
  expect((el as HTMLInputElement).checked).toEqual(true);
});

it('should add checked class', async () => {
  const onToggle = jest.fn();
  renderComponent({ onToggleCallback: onToggle });
  const el = await screen.findByTestId('checkbox-input');
  fireEvent.click(el);
  // eslint-disable-next-line testing-library/no-node-access
  await waitFor(() => expect(el.parentElement).toHaveClass('checked'));
});
