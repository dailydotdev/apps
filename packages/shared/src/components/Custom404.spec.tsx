import React from 'react';
import { render, screen, within } from '@testing-library/react';
import Custom404 from './Custom404';

describe('Custom404', () => {
  beforeEach(() => {
    render(<Custom404 />);
  });

  it('should render the not-found container', () => {
    expect(screen.getByTestId('notFound')).toBeInTheDocument();
  });

  it('should keep a primary route home', () => {
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  // The page used to be a dead end with a single link, which left both
  // people and crawlers with nowhere to go.
  it.each([
    ['Explore', '/posts'],
    ['Tags', '/tags'],
    ['Sources', '/sources'],
    ['Squads', '/squads/discover'],
    ['Blog', '/blog'],
  ])('should offer %s as a recovery link', (label, href) => {
    expect(screen.getByRole('link', { name: label })).toHaveAttribute(
      'href',
      href,
    );
  });

  it('should group the recovery links in a labelled nav', () => {
    const nav = screen.getByRole('navigation', {
      name: 'Other places to go',
    });

    expect(nav).toBeInTheDocument();
    expect(within(nav).getAllByRole('link')).toHaveLength(5);
  });
});
