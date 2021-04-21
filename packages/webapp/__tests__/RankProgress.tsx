import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import RankProgress, { RankProgressProps } from '../components/RankProgress';

const renderComponent = (props: RankProgressProps): RenderResult => {
  return render(<RankProgress {...props} />);
};

it('should create dynamically the progress bar according to the props', async () => {
  renderComponent({ rank: 0, progress: 0 });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(0);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(3);
  });
});

it('should add completed bars according to the progress', async () => {
  renderComponent({ rank: 0, progress: 2 });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(2);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(1);
  });
});

it('should create dynamically the progress bar in the last rank if not completed everything', async () => {
  renderComponent({ rank: 5, progress: 0 });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(0);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(7);
  });
});

it('should create only one bar in the last rank if completed everything', async () => {
  renderComponent({ rank: 5, progress: 7 });
  await waitFor(() => {
    expect(screen.queryAllByTestId('completedPath').length).toEqual(1);
    expect(screen.queryAllByTestId('remainingPath').length).toEqual(0);
  });
});
