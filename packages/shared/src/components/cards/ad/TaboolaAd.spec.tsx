import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { TaboolaAd } from './TaboolaAd';
import { taboolaFrameSource } from '../../../features/monetization/taboolaFrame';

jest.mock('../../../lib/func', () => ({
  ...jest.requireActual('../../../lib/func'),
  isExtension: true,
}));

const onClick = jest.fn();

const renderComponent = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <TaboolaAd
        placement={2}
        variant="list"
        fallback={<p>House ad</p>}
        onClick={onClick}
      />
    </TestBootProvider>,
  );

const getFrame = () =>
  screen.getByTitle('Sponsored content') as HTMLIFrameElement;

const postFromFrame = (message: Record<string, unknown>) =>
  act(() => {
    globalThis.dispatchEvent(
      new MessageEvent('message', {
        data: { source: taboolaFrameSource, ...message },
        origin: new URL(getFrame().src).origin,
        source: getFrame().contentWindow,
      }),
    );
  });

beforeEach(() => jest.clearAllMocks());

it('should render the placement through the embed page in the extension', () => {
  renderComponent();

  const url = new URL(getFrame().src);
  expect(url.pathname).toBe('/embed/taboola');
  expect(url.searchParams.get('placement')).toBe('2');
  expect(url.searchParams.get('variant')).toBe('list');
});

it('should show the frame once filled and take the height it reports', () => {
  renderComponent();
  expect(screen.getByTestId('taboolaAdItem').parentElement).toHaveAttribute(
    'aria-hidden',
    'true',
  );

  postFromFrame({ type: 'result', result: 'filled' });
  postFromFrame({ type: 'height', height: 300 });
  postFromFrame({ type: 'click' });

  expect(screen.getByTestId('taboolaAdItem').parentElement).toHaveAttribute(
    'aria-hidden',
    'false',
  );
  expect(getFrame()).toHaveStyle({ height: '300px' });
  expect(onClick).toHaveBeenCalledTimes(1);
});

it('should show the house ad when the frame has nothing', () => {
  renderComponent();

  postFromFrame({ type: 'result', result: 'empty' });

  expect(screen.getByText('House ad')).toBeInTheDocument();
  expect(screen.queryByTitle('Sponsored content')).not.toBeInTheDocument();
});

it('should ignore messages from other windows', () => {
  renderComponent();

  act(() => {
    globalThis.dispatchEvent(
      new MessageEvent('message', {
        data: { source: taboolaFrameSource, type: 'result', result: 'empty' },
        origin: new URL(getFrame().src).origin,
      }),
    );
  });

  expect(screen.queryByText('House ad')).not.toBeInTheDocument();
});
