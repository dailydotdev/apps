import React from 'react';
import type { ReactElement } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShellField } from './ShellField';
import { useShellField } from './shellFieldStore';
import { revealShell } from './useShellScroll';
import { field, scroll } from './constants';

jest.mock('./shellFieldPlacement', () => ({
  useShellFieldPlacement: jest.fn(() => 'bottom'),
}));
jest.mock('../../hooks/useViewSize', () => ({
  ...(jest.requireActual('../../hooks/useViewSize') as Record<string, unknown>),
  useIsPhone: jest.fn(() => true),
}));

const mockUsePlacement = jest.requireMock('./shellFieldPlacement')
  .useShellFieldPlacement as jest.Mock;
const mockUseIsPhone = jest.requireMock('../../hooks/useViewSize')
  .useIsPhone as jest.Mock;

const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  window.dispatchEvent(new Event('scroll'));
};

// The field portals to the root, which asks the request protocol for the
// extension's wrapper; that hook needs a query client.
const renderWithClient = (ui: ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  );

const Presence = () => {
  const { mounted, focused } = useShellField();
  return <output>{`${mounted}:${focused}`}</output>;
};

describe('ShellField', () => {
  beforeEach(() => {
    mockUseIsPhone.mockReturnValue(true);
    scrollTo(0);
    revealShell();
  });

  it('renders nothing above phone width', () => {
    mockUseIsPhone.mockReturnValue(false);
    renderWithClient(
      <>
        <ShellField placeholder="Search tags" />
        <Presence />
      </>,
    );

    expect(screen.queryByRole('search')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('false:false');
  });

  it('tells the bar a field is on the page, and when it has the keyboard', () => {
    const { unmount } = renderWithClient(
      <>
        <ShellField placeholder="Search tags" />
        <Presence />
      </>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('true:false');

    fireEvent.focus(screen.getByRole('searchbox', { name: 'Search tags' }));
    expect(screen.getByRole('status')).toHaveTextContent('true:true');

    fireEvent.blur(screen.getByRole('searchbox', { name: 'Search tags' }));
    expect(screen.getByRole('status')).toHaveTextContent('true:false');

    unmount();
    renderWithClient(<Presence />);
    expect(screen.getByRole('status')).toHaveTextContent('false:false');
  });

  it('takes the compact size once the reader scrolls, keeps its words, and rests again on focus', () => {
    renderWithClient(<ShellField placeholder="Search tags" />);
    const form = screen.getByRole('search');
    expect(form).toHaveStyle({ height: `${field.rest}px` });

    act(() => {
      scrollTo(scroll.deadZone + scroll.hideTolerance + 40);
    });
    expect(form).toHaveStyle({ height: `${field.compact}px` });
    expect(screen.getByRole('searchbox')).toHaveAttribute(
      'placeholder',
      'Search tags',
    );

    fireEvent.focus(screen.getByRole('searchbox'));
    expect(form).toHaveStyle({ height: `${field.rest}px` });
  });

  it('reports typing, clearing and submitting', () => {
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    renderWithClient(
      <ShellField
        placeholder="Search bookmarks"
        value="rust"
        onChange={onChange}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'rusty' },
    });
    expect(onChange).toHaveBeenCalledWith('rusty');

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChange).toHaveBeenCalledWith('');

    fireEvent.submit(screen.getByRole('search'));
    expect(onSubmit).toHaveBeenCalledWith('rust');
  });

  it('is a button when it opens something else', () => {
    const onOpen = jest.fn();
    renderWithClient(<ShellField placeholder="Search posts" onOpen={onOpen} />);

    fireEvent.click(screen.getByRole('button', { name: 'Search posts' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
  it('sits inline at the top of the page in a browser, and leaves the bar alone', () => {
    mockUsePlacement.mockReturnValue('top');
    renderWithClient(
      <>
        <ShellField placeholder="Search tags" />
        <Presence />
      </>,
    );
    const form = screen.getByRole('search');
    expect(form.closest('.shell-field')).toBeNull();
    expect(form).toHaveStyle({ height: '52px' });
    expect(screen.getByRole('status')).toHaveTextContent('false:false');
    mockUsePlacement.mockReturnValue('bottom');
  });
});
