import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import Toast from '../../components/notifications/Toast';
import { CopySummaryButton } from './CopySummaryButton';

const writeText = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
  Object.assign(navigator, { clipboard: { writeText } });
});

const renderButton = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <Toast />
      <CopySummaryButton
        link="https://app.daily.dev/posts/p1"
        summary="They optimised the product they had."
        title="Why iconic tech brands lost their dominance"
      />
    </TestBootProvider>,
  );

describe('CopySummaryButton', () => {
  it('copies the headline, the summary and the link as three paragraphs', async () => {
    renderButton();

    fireEvent.click(screen.getByLabelText('Copy summary'));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    // The link is the tracked short one, resolved at press time; the test
    // shortener is a passthrough, so it comes back as the link given.
    expect(writeText).toHaveBeenCalledWith(
      [
        'Why iconic tech brands lost their dominance',
        'They optimised the product they had.',
        'https://app.daily.dev/posts/p1',
      ].join('\n\n'),
    );
  });

  it('says so when the browser blocks the clipboard', async () => {
    writeText.mockRejectedValueOnce(new Error('NotAllowedError'));

    renderButton();

    fireEvent.click(screen.getByLabelText('Copy summary'));

    expect(
      await screen.findByText('❌ Your browser blocked the clipboard'),
    ).toBeInTheDocument();
  });
});
