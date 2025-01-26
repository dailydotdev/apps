import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';

import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import YoutubeVideo from './YoutubeVideo';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { sharePost } from '../../../__tests__/fixture/post';

const renderComponent = (): RenderResult => {
  const client = new QueryClient();

  return render(
    <TestBootProvider client={client}>
      <YoutubeVideo
        title="test title"
        videoId="igZCEr3HwCg"
        data-testid="iframeId"
        image={sharePost.image}
        source={sharePost.source}
      />
    </TestBootProvider>,
  );
};

describe('YoutubeVideo', () => {
  it('should render successfully', () => {
    const { baseElement } = renderComponent();
    expect(baseElement).toBeTruthy();
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
});
