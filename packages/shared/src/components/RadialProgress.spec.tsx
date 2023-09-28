import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import RadialProgress, { RadialProgressProps } from './RadialProgress';

const renderComponent = (props: RadialProgressProps): RenderResult => {
  return render(<RadialProgress {...props} />);
};

it('should create dynamically the progress bar according to the props', async () => {
  renderComponent({ steps: 3, progress: 0 });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(0);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(3);
  });
});

it('should add completed bars according to the progress', async () => {
  renderComponent({ steps: 3, progress: 2 });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(2);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(1);
  });
});

it('should set accessibility attributes', async () => {
  renderComponent({ steps: 3, progress: 2 });
  const el = await screen.findByRole('progressbar');
  expect(el).toHaveAttribute('aria-valuenow', '2');
  expect(el).toHaveAttribute('aria-valuemin', '0');
  expect(el).toHaveAttribute('aria-valuemax', '3');
});
