import { render, RenderResult, screen } from '@testing-library/react';

import React from 'react';
import YoutubeVideo from './YoutubeVideo';

const renderComponent = (): RenderResult => {
  return render(
    <YoutubeVideo
      title="test title"
      videoId="igZCEr3HwCg"
      data-testid="iframeId"
    />,
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
