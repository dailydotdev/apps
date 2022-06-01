import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useToastNotification } from '../../hooks/useToastNotification';
import Toast from './Toast';

const undo = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const ComponentWithToast = ({ autoDismissNotifications = true }) => {
  const { displayToast } = useToastNotification();

  return (
    <>
      <Toast autoDismissNotifications={autoDismissNotifications} />
      <button
        type="button"
        onClick={() => displayToast('Sample Notification', { timer: 1000 })}
      >
        Regular Toast
      </button>
      <button
        type="button"
        onClick={() => displayToast('Undoable Notification', { onUndo: undo })}
      >
        Undoable Toast
      </button>
    </>
  );
};

const renderComponent = (autoDismissNotifications = true) => {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <ComponentWithToast autoDismissNotifications={autoDismissNotifications} />
    </QueryClientProvider>,
  );
};

it('should display a toast notification', async () => {
  renderComponent();
  const button = await screen.findByText('Regular Toast');
  fireEvent.click(button);
  await screen.findByRole('alert');
  await screen.findByText('Sample Notification');
  await act(() => new Promise((resolve) => setTimeout(resolve, 1500))); // wait for the toast to expire
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('should display a toast notification and be dismissable', async () => {
  renderComponent();
  const button = await screen.findByText('Regular Toast');
  fireEvent.click(button);
  await screen.findByRole('alert');
  const dismiss = await screen.findByLabelText('Dismiss toast notification');
  fireEvent.click(dismiss);
  await act(() => new Promise((resolve) => setTimeout(resolve, 500))); // let the animation to finish
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('should display a toast notification and do not automatically close', async () => {
  renderComponent(false);
  const button = await screen.findByText('Regular Toast');
  fireEvent.click(button);
  await screen.findByRole('alert');
  await act(() => new Promise((resolve) => setTimeout(resolve, 1500))); // wait for the toast to expire
  await screen.findByRole('alert');
  const dismiss = await screen.findByLabelText('Dismiss toast notification');
  fireEvent.click(dismiss);
  await act(() => new Promise((resolve) => setTimeout(resolve, 500))); // let the animation to finish
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('should display a toast notification and undoable action', async () => {
  renderComponent();
  const button = await screen.findByText('Undoable Toast');
  fireEvent.click(button);
  await screen.findByRole('alert');
  await screen.findByText('Undoable Notification');
  const undoBtn = await screen.findByLabelText('Undo action');
  fireEvent.click(undoBtn);
  await act(() => new Promise((resolve) => setTimeout(resolve, 500))); // let the animation to finish
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(undo).toBeCalled();
});
