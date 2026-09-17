import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { MarkdownCommand } from '../../../hooks/input/useMarkdownInput';
import MarkdownInput from '.';

const renderMarkdownInput = (
  enabledCommand: React.ComponentProps<typeof MarkdownInput>['enabledCommand'],
) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <MarkdownInput
        allowPreview={false}
        enabledCommand={enabledCommand}
        showMarkdownGuide={false}
      />
    </TestBootProvider>,
  );

describe('MarkdownInput', () => {
  it('does not show the GIF button when the GIF command is disabled', () => {
    renderMarkdownInput({ [MarkdownCommand.Link]: true });

    expect(
      screen.queryByRole('button', { name: 'Add GIF' }),
    ).not.toBeInTheDocument();
  });

  it('shows the GIF button when the GIF command is enabled', () => {
    renderMarkdownInput({ [MarkdownCommand.Gif]: true });

    expect(screen.getByRole('button', { name: 'Add GIF' })).toBeInTheDocument();
  });
});
