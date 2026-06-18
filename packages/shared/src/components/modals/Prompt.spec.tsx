import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { PromptOptions } from '../../hooks/usePrompt';
import { PROMPT_KEY } from '../../hooks/usePrompt';
import { PromptElement } from './Prompt';

const renderPrompt = (options: PromptOptions) => {
  const client = new QueryClient();

  client.setQueryData(PROMPT_KEY, {
    options,
    onSuccess: jest.fn(),
    onFail: jest.fn(),
  });

  return render(
    <QueryClientProvider client={client}>
      <PromptElement ariaHideApp={false} />
    </QueryClientProvider>,
  );
};

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
});
