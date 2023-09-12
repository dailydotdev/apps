import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { RankProgress, RankProgressProps } from './RankProgress';

const renderComponent = (props: RankProgressProps): RenderResult => {
  return render(<RankProgress {...props} />);
};

it('should create dynamically the progress bar according to the props', async () => {
  renderComponent({ rank: 1, progress: 0 });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(0);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(2);
  });
});

it('should add completed bars according to the progress', async () => {
  renderComponent({ rank: 1, progress: 1 });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(1);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(1);
  });
});

it('should create dynamically the progress bar in the last rank if not completed everything', async () => {
  renderComponent({ rank: 7, progress: 0 });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(0);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(7);
  });
});

it('should create only one bar in the last rank if completed everything', async () => {
  renderComponent({ rank: 7, progress: 7 });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(1);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(0);
  });
});
