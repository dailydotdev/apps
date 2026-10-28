import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Chips, Segments, ShellRow } from './ShellRow';

jest.mock('../utilities/Link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    replace,
    scroll,
  }: {
    children: React.ReactElement;
    href: string;
    replace?: boolean;
    scroll?: boolean;
  }) =>
    jest.requireActual('react').cloneElement(children, {
      href,
      'data-replace': String(!!replace),
      'data-scroll': String(scroll ?? true),
    }),
}));

describe('ShellRow', () => {
  it('marks the segment its caller says is the page', () => {
    render(
      <ShellRow>
        <Segments
          items={[
            { key: 'a', label: 'For you', href: '/', active: true },
            { key: 'b', label: 'Following', href: '/following' },
          ]}
        />
      </ShellRow>,
    );

    expect(screen.getByRole('link', { name: 'For you' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Following' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('replaces the history entry for a segment and can keep the scroll', () => {
    render(
      <Segments
        items={[
          { key: 'a', label: 'Posts', href: '/posts', replace: true },
          {
            key: 'b',
            label: 'Latest',
            href: '/posts/latest',
            replace: true,
            keepScroll: true,
          },
          { key: 'c', label: 'Tags', href: '/tags' },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Posts' })).toHaveAttribute(
      'data-replace',
      'true',
    );
    expect(screen.getByRole('link', { name: 'Latest' })).toHaveAttribute(
      'data-scroll',
      'false',
    );
    expect(screen.getByRole('link', { name: 'Tags' })).toHaveAttribute(
      'data-replace',
      'false',
    );
  });

  it('turns the lit segment with a menu into the menu button', () => {
    const onMenu = jest.fn();
    render(
      <Segments
        menu="now"
        onMenu={onMenu}
        items={[
          {
            key: 'now',
            label: 'Happening now',
            href: '/highlights',
            active: true,
          },
          { key: 'b', label: 'Following', href: '/following' },
        ]}
      />,
    );

    const menu = screen.getByRole('button', {
      name: 'Happening now, choose a channel',
    });
    fireEvent.click(menu);

    expect(onMenu).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('link', { name: /Happening now/ }),
    ).not.toBeInTheDocument();
  });

  it('draws a filter chip as a pressed button when it has no address', () => {
    const onClick = jest.fn();
    render(
      <Chips
        items={[
          { key: 'all', label: 'All', active: true, onClick },
          { key: 'web', label: 'Web', href: '/squads/discover/web' },
        ]}
      />,
    );

    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('link', { name: 'Web' })).toHaveAttribute(
      'href',
      '/squads/discover/web',
    );
  });
});
