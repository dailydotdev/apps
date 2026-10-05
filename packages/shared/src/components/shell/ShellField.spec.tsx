import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ShellField } from './ShellField';
import { useShellField } from './shellFieldStore';
import { revealShell } from './useShellScroll';
import { field, scroll } from './constants';

jest.mock('../../hooks/useViewSize', () => ({
  ...(jest.requireActual('../../hooks/useViewSize') as Record<string, unknown>),
  useIsPhone: jest.fn(() => true),
}));

const mockUseIsPhone = jest.requireMock('../../hooks/useViewSize')
  .useIsPhone as jest.Mock;

const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  window.dispatchEvent(new Event('scroll'));
};

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
    render(
      <>
        <ShellField placeholder="Search tags" />
        <Presence />
      </>,
    );

    expect(screen.queryByRole('search')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('false:false');
  });

  it('tells the bar a field is on the page, and when it has the keyboard', () => {
    const { unmount } = render(
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
    render(<Presence />);
    expect(screen.getByRole('status')).toHaveTextContent('false:false');
  });

  it('takes the compact size once the reader scrolls and rests again on focus', () => {
    render(<ShellField placeholder="Search tags" />);
    const form = screen.getByRole('search');
    expect(form).toHaveStyle({ height: `${field.rest}px` });

    act(() => {
      scrollTo(scroll.deadZone + scroll.hideTolerance + 40);
    });
    expect(form).toHaveStyle({ height: `${field.compact}px` });
    expect(screen.getByRole('searchbox')).toHaveAttribute(
      'placeholder',
      'Search',
    );

    fireEvent.focus(screen.getByRole('searchbox'));
    expect(form).toHaveStyle({ height: `${field.rest}px` });
  });

  it('reports typing, clearing and submitting', () => {
    const onChange = jest.fn();
    const onSubmit = jest.fn();
    render(
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
    render(<ShellField placeholder="Search posts" onOpen={onOpen} />);

    fireEvent.click(screen.getByRole('button', { name: 'Search posts' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });
});
