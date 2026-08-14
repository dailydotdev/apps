import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlusItemStatus, PlusListItem } from './PlusListItem';
import { plusOverviewDocs } from '../../lib/constants';

describe('PlusListItem', () => {
  it('renders a feature row with a checkmark and no link', () => {
    render(
      <ul>
        <PlusListItem
          item={{
            label: 'Ad-free experience',
            status: PlusItemStatus.Ready,
          }}
        />
      </ul>,
    );

    expect(screen.getByText('Ad-free experience')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders an href row as an external link without a checkmark', () => {
    render(
      <ul>
        <PlusListItem
          item={{
            id: 'plus-docs',
            label: 'Explore all Plus features',
            status: PlusItemStatus.Ready,
            href: plusOverviewDocs,
          }}
        />
      </ul>,
    );

    const link = screen.getByRole('link', { name: 'Explore all Plus features' });
    expect(link).toHaveAttribute('href', plusOverviewDocs);
    expect(link).toHaveAttribute('target', '_blank');
  });
});
