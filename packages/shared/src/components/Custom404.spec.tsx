import React from 'react';
import { render, screen, within } from '@testing-library/react';
import Custom404 from './Custom404';
import { webappUrl } from '../lib/constants';

const renderComponent = (showRecoveryLinks = false) =>
  render(<Custom404 showRecoveryLinks={showRecoveryLinks} />);

describe('Custom404', () => {
  it('should render the not-found container', () => {
    renderComponent();

    expect(screen.getByTestId('notFound')).toBeInTheDocument();
  });

  it('should keep a primary route home', () => {
    renderComponent();

    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('should not render the recovery nav by default', () => {
    renderComponent();

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it.each([
    ['Explore', 'posts'],
    ['Tags', 'tags'],
    ['Sources', 'sources'],
    ['Squads', 'squads/discover'],
  ])('should offer %s as a recovery link', (label, path) => {
    renderComponent(true);

    expect(screen.getByRole('link', { name: label })).toHaveAttribute(
      'href',
      `${webappUrl}${path}`,
    );
  });

  it('should group the recovery links in a labelled nav', () => {
    renderComponent(true);

    const nav = screen.getByRole('navigation', { name: 'Other places to go' });

    expect(within(nav).getAllByRole('link')).toHaveLength(4);
  });

  it('should build every recovery href from the per-build webapp prefix', () => {
    renderComponent(true);

    const nav = screen.getByRole('navigation', { name: 'Other places to go' });

    within(nav)
      .getAllByRole('link')
      .forEach((link) => {
        const href = link.getAttribute('href') ?? '';

        expect(href.startsWith(webappUrl)).toBe(true);
        expect(href).not.toContain('//squads');
      });
  });
});
