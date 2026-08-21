import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { PromptOptions } from '../../hooks/usePrompt';
import { PROMPT_KEY, usePrompt } from '../../hooks/usePrompt';
import { PromptElement } from './Prompt';

const renderPrompt = (options: PromptOptions) => {
  const client = new QueryClient();

  client.setQueryData(PROMPT_KEY, {
    options,
    onSuccess: jest.fn(),
    onFail: jest.fn(),
    onError: jest.fn(),
  });

  return render(
    <QueryClientProvider client={client}>
      <PromptElement ariaHideApp={false} />
    </QueryClientProvider>,
  );
};

const createDeferred = () => {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: () => resolve(),
    reject: (error: Error) => reject(error),
  };
};

const renderPromptController = () => {
  const client = new QueryClient();
  const controller: {
    showPrompt?: ReturnType<typeof usePrompt>['showPrompt'];
  } = {};

  const TestComponent = () => {
    const { showPrompt } = usePrompt();
    controller.showPrompt = showPrompt;

    return <PromptElement ariaHideApp={false} />;
  };

  render(
    <QueryClientProvider client={client}>
      <TestComponent />
    </QueryClientProvider>,
  );

  return {
    client,
    controller: controller as {
      showPrompt: ReturnType<typeof usePrompt>['showPrompt'];
    },
  };
};

const waitForPromptReady = (client: QueryClient) =>
  waitFor(() =>
    expect(client.getQueryState(PROMPT_KEY)?.fetchStatus).toBe('idle'),
  );

describe('PromptElement', () => {
  it('does not render cancel button when cancelButton is null', () => {
    renderPrompt({
      title: 'Confirm action',
      okButton: { title: 'Got it' },
      cancelButton: null,
    });

    expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /cancel/i }),
    ).not.toBeInTheDocument();
  });

  it('renders explicit cancel button', () => {
    renderPrompt({
      title: 'Confirm action',
      okButton: { title: 'Continue' },
      cancelButton: { title: 'Cancel' },
    });

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument();
  });

  it('keeps prompt mounted and disables actions while async confirm is pending', async () => {
    const deferred = createDeferred();
    const onConfirm = jest.fn(() => deferred.promise);
    const { client, controller } = renderPromptController();
    await waitForPromptReady(client);

    let promptResult: Promise<boolean>;
    act(() => {
      promptResult = controller.showPrompt({
        title: 'Confirm action',
        okButton: { title: 'Continue' },
        onConfirm,
      });
    });

    const okButton = await screen.findByRole('button', { name: 'Continue' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    await userEvent.click(okButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(okButton).toHaveAttribute('aria-busy', 'true');
    expect(okButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(screen.getByText('Confirm action')).toBeInTheDocument();

    await userEvent.click(okButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await act(async () => {
      deferred.resolve();
      await deferred.promise;
    });

    await expect(promptResult!).resolves.toBe(true);
    await waitFor(() =>
      expect(screen.queryByText('Confirm action')).not.toBeInTheDocument(),
    );
  });

  it('closes prompt and rejects when async confirm fails', async () => {
    const deferred = createDeferred();
    const { client, controller } = renderPromptController();
    await waitForPromptReady(client);

    let promptResult: Promise<boolean>;
    act(() => {
      promptResult = controller.showPrompt({
        title: 'Confirm action',
        okButton: { title: 'Continue' },
        onConfirm: () => deferred.promise,
      });
    });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Continue' }),
    );

    const error = new Error('failed');
    const promptRejection = expect(promptResult!).rejects.toBe(error);
    await act(async () => {
      deferred.reject(error);
      await deferred.promise.catch(() => undefined);
    });

    await promptRejection;
    await waitFor(() =>
      expect(screen.queryByText('Confirm action')).not.toBeInTheDocument(),
    );
  });
});
