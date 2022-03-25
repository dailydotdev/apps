import React from 'react';
import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import nock from 'nock';
import TabContainer, { Tab, TabContainerProps } from './TabContainer';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const onActiveClick = jest.fn();
const renderComponent = (props: TabContainerProps = {}): RenderResult => {
  return render(
    <TabContainer {...props} onActiveChange={onActiveClick}>
      <Tab label="First">Sample</Tab>
      <Tab label="Second">Test</Tab>
      <Tab label="Third">Try</Tab>
    </TabContainer>,
  );
};

describe('tab container component', () => {
  it('should render all the tabs', async () => {
    renderComponent();
    const active = await screen.findByText('First');
    const inactive1 = await screen.findByText('Second');
    const inactive2 = await screen.findByText('Third');

    expect(active).toHaveClass('font-bold');
    expect(inactive1).toHaveClass('text-theme-label-tertiary');
    expect(inactive2).toHaveClass('text-theme-label-tertiary');
  });

  it('should switch betweem tabs', async () => {
    renderComponent();
    await screen.findByText('Sample');
    const second = await screen.findByText('Second');
    fireEvent.click(second);
    await screen.findByText('Test');
  });

  it('should mount tabs if shouldMountInactive is true but hidden', async () => {
    renderComponent({ shouldMountInactive: true });
    await screen.findByText('First');
    const second = screen.queryByText('Test');
    expect(second).toBeInTheDocument();
    expect(second).toHaveStyle({ display: 'none' });
    const third = screen.queryByText('Try');
    expect(third).toBeInTheDocument();
    expect(third).toHaveStyle({ display: 'none' });
  });
});
