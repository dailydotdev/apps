import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToastNotification } from '../../hooks';
import Toast from './Toast';

const undo = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

const ComponentWithToast = ({ autoDismissNotifications = true }) => {
  const { displayToast } = useToastNotification();

  return (
    <>
      <Toast autoDismissNotifications={autoDismissNotifications} />
      <button
        type="button"
        onClick={() => displayToast('Sample Notification', { timer: 500 })}
      >
        Regular Toast
      </button>
      <button
        type="button"
        onClick={() =>
          displayToast('Undoable Notification', {
            action: { copy: 'Undo', onClick: undo },
            timer: 500,
          })
        }
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
  jest.useFakeTimers();
  renderComponent();
  const button = await screen.findByText('Regular Toast');
  fireEvent.click(button);
  const alertEl = await screen.findByRole('alert');
  expect(alertEl).toBeInTheDocument();
  expect(jest.getTimerCount()).toBeGreaterThan(0);
  const el = await screen.findByText('Sample Notification');
  expect(el).toBeInTheDocument();
  act(() => {
    jest.advanceTimersByTime(500);
  });
  await waitFor(() =>
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
  );
});

it('should display a toast notification and be dismissable', async () => {
  jest.useFakeTimers();
  renderComponent();
  const button = await screen.findByText('Regular Toast');
  fireEvent.click(button);
  const alertEl = await screen.findByRole('alert');
  expect(alertEl).toBeInTheDocument();
  expect(jest.getTimerCount()).toBeGreaterThan(0);
  const dismiss = await screen.findByLabelText('Dismiss toast notification');
  expect(dismiss).toBeInTheDocument();
  fireEvent.click(dismiss);
  act(() => {
    jest.advanceTimersByTime(500);
  });
  await waitFor(() =>
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
  );
});

it('should display a toast notification and do not automatically close', async () => {
  jest.useFakeTimers();
  renderComponent(false);
  const button = await screen.findByText('Regular Toast');
  fireEvent.click(button);
  const alertEl = await screen.findByRole('alert');
  expect(alertEl).toBeInTheDocument();
  expect(jest.getTimerCount()).toBeGreaterThan(0);
  const dismiss = await screen.findByLabelText('Dismiss toast notification');
  expect(dismiss).toBeInTheDocument();
  fireEvent.click(dismiss);
  act(() => {
    jest.advanceTimersByTime(500);
  });
  await waitFor(() =>
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
  );
});

it('should display a toast notification and undoable action', async () => {
  jest.useFakeTimers();
  renderComponent();
  const button = await screen.findByText('Undoable Toast');
  fireEvent.click(button);
  const alertEl = await screen.findByRole('alert');
  expect(alertEl).toBeInTheDocument();
  expect(jest.getTimerCount()).toBeGreaterThan(0);
  const el = await screen.findByText('Undoable Notification');
  expect(el).toBeInTheDocument();
  const undoBtn = await screen.findByLabelText('Undo');
  expect(undoBtn).toBeInTheDocument();
  fireEvent.click(undoBtn);
  act(() => {
    jest.advanceTimersByTime(500);
  });
  await waitFor(() =>
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
  );
  expect(undo).toBeCalled();
});
