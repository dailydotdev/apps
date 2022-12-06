import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import React from 'react';
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
  await waitForElementToBeRemoved(() => screen.queryByRole('alert'), {
    timeout: 2000,
  });
});

it('should display a toast notification and be dismissable', async () => {
  renderComponent();
  const button = await screen.findByText('Regular Toast');
  fireEvent.click(button);
  await screen.findByRole('alert');
  const dismiss = await screen.findByLabelText('Dismiss toast notification');
  fireEvent.click(dismiss);
  await waitForElementToBeRemoved(() => screen.queryByRole('alert'));
});

it('should display a toast notification and do not automatically close', async () => {
  renderComponent(false);
  const button = await screen.findByText('Regular Toast');
  fireEvent.click(button);
  await screen.findByRole('alert');
  const dismiss = await screen.findByLabelText('Dismiss toast notification');
  fireEvent.click(dismiss);
  await waitForElementToBeRemoved(() => screen.queryByRole('alert'));
});

it('should display a toast notification and undoable action', async () => {
  renderComponent();
  const button = await screen.findByText('Undoable Toast');
  fireEvent.click(button);
  await screen.findByRole('alert');
  await screen.findByText('Undoable Notification');
  const undoBtn = await screen.findByLabelText('Undo action');
  fireEvent.click(undoBtn);
  await waitForElementToBeRemoved(() => screen.queryByRole('alert'));
  expect(undo).toBeCalled();
});
