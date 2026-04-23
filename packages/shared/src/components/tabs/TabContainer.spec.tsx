import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen } from '@testing-library/react';
import nock from 'nock';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { TabContainerProps } from './TabContainer';
import { Tab, TabContainer } from './TabContainer';

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

const renderUrlComponent = (props: TabContainerProps = {}): RenderResult => {
  return render(
    <TabContainer {...props} onActiveChange={onActiveClick}>
      <Tab label="First" url="/first">
        Sample
      </Tab>
      <Tab label="Second" url="/second">
        Test
      </Tab>
      <Tab label="Third" url="/third">
        Try
      </Tab>
    </TabContainer>,
  );
};

const routerPush = jest.fn();

describe('tab container component', () => {
  it('should render all the tabs', async () => {
    renderComponent();
    const active = await screen.findByText('First');
    const inactive1 = await screen.findByText('Second');
    const inactive2 = await screen.findByText('Third');

    expect(active).toHaveClass('bg-theme-active');
    expect(inactive1).not.toHaveClass('bg-theme-active');
    expect(inactive2).not.toHaveClass('bg-theme-active');
  });

  it('should switch between tabs', async () => {
    renderComponent();
    await screen.findByText('Sample');
    const second = await screen.findByText('Second');
    fireEvent.click(second);
    await screen.findByText('Test');
  });

  it('should drag-scroll the tab list on desktop when enabled', () => {
    renderComponent({
      className: { header: 'overflow-x-auto' },
      tabListProps: { dragScroll: true },
    });

    const list = screen.getByRole('list');
    const scrollableParent = list.parentElement as HTMLElement;

    Object.defineProperty(scrollableParent, 'scrollWidth', {
      configurable: true,
      value: 400,
    });
    Object.defineProperty(scrollableParent, 'clientWidth', {
      configurable: true,
      value: 200,
    });
    Object.defineProperty(scrollableParent, 'scrollLeft', {
      configurable: true,
      value: 100,
      writable: true,
    });

    fireEvent.mouseDown(list, {
      button: 0,
      clientX: 100,
    });
    fireEvent.mouseMove(window, {
      clientX: 60,
    });
    fireEvent.mouseUp(window, {
      clientX: 60,
    });

    expect(scrollableParent.scrollLeft).toBe(140);
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

  describe('with URLs', () => {
    jest.mock('next/router', () => ({
      useRouter() {
        return {
          isFallback: false,
        };
      },
    }));

    beforeAll(() => {
      const mockPathname = '/second';
      jest.mocked(useRouter).mockImplementation(
        () =>
          ({
            pathname: mockPathname,
            push: routerPush,
          } as unknown as NextRouter),
      );
    });

    it('should set the active tab based on the current path', async () => {
      renderUrlComponent({ shouldMountInactive: true });

      const active = await screen.findByText('Second');
      const inactive1 = await screen.findByText('First');
      const inactive2 = await screen.findByText('Third');

      expect(active).toHaveClass('bg-theme-active');
      expect(inactive1).not.toHaveClass('bg-theme-active');
      expect(inactive2).not.toHaveClass('bg-theme-active');
    });

    it('should redirect to the given URL on tab click', async () => {
      renderUrlComponent({ shouldMountInactive: true });

      const first = await screen.findByText('First');
      fireEvent.click(first);
      expect(routerPush).toHaveBeenCalledWith('/first', undefined, {
        shallow: false,
      });
    });

    it('should not redirect after a drag gesture', async () => {
      renderUrlComponent({
        className: { header: 'overflow-x-auto' },
        shouldMountInactive: true,
        tabListProps: { dragScroll: true },
      });

      const list = screen.getByRole('list');
      const first = await screen.findByText('First');
      const scrollableParent = list.parentElement as HTMLElement;

      Object.defineProperty(scrollableParent, 'scrollWidth', {
        configurable: true,
        value: 400,
      });
      Object.defineProperty(scrollableParent, 'clientWidth', {
        configurable: true,
        value: 200,
      });
      Object.defineProperty(scrollableParent, 'scrollLeft', {
        configurable: true,
        value: 100,
        writable: true,
      });

      fireEvent.mouseDown(list, {
        button: 0,
        clientX: 100,
      });
      fireEvent.mouseMove(window, {
        clientX: 60,
      });
      fireEvent.mouseUp(window, {
        clientX: 60,
      });
      fireEvent.click(first);

      expect(routerPush).not.toHaveBeenCalledWith('/first', undefined, {
        shallow: false,
      });
    });

    it('should disable native anchor dragging when drag scroll is enabled', async () => {
      renderUrlComponent({
        shouldMountInactive: true,
        tabListProps: { dragScroll: true },
      });

      const first = await screen.findByRole('link', { name: 'First' });

      expect(first).toHaveAttribute('draggable', 'false');
    });
  });
});
