import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';

import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import YoutubeVideo from './YoutubeVideo';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { sharePost } from '../../../__tests__/fixture/post';
import { isIOSNative } from '../../lib/func';

jest.mock('../../lib/func', () => ({
  ...jest.requireActual('../../lib/func'),
  isIOSNative: jest.fn(),
}));

const mockIsIOSNative = isIOSNative as jest.MockedFunction<typeof isIOSNative>;

const renderComponent = (): RenderResult => {
  const client = new QueryClient();

  return render(
    <TestBootProvider client={client}>
      <YoutubeVideo
        placeholderProps={{
          post: { ...sharePost, title: 'test title' },
          onWatchVideo: jest.fn(),
        }}
        videoId="igZCEr3HwCg"
        data-testid="iframeId"
      />
    </TestBootProvider>,
  );
};

describe('YoutubeVideo', () => {
  beforeEach(() => {
    mockIsIOSNative.mockReturnValue(false);
  });

  it('should add the right title attribute', () => {
    renderComponent();

    const iframe = screen.getByTestId('iframeId');
    expect(iframe).toHaveAttribute('title', 'test title');
  });
  it('should add the right src attribute', () => {
    renderComponent();

    const iframe = screen.getByTestId('iframeId');
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/igZCEr3HwCg',
    );
  });

  it('should prevent the YouTube player from opening popups in the native iOS app', () => {
    mockIsIOSNative.mockReturnValue(true);

    renderComponent();

    expect(screen.getByTestId('iframeId')).toHaveAttribute(
      'sandbox',
      'allow-same-origin allow-scripts allow-presentation',
    );
  });

  it('should preserve YouTube popup behavior outside the native iOS app', () => {
    renderComponent();

    expect(screen.getByTestId('iframeId')).not.toHaveAttribute('sandbox');
  });
});
