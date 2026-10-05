import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { generateTestSquad } from '../../../../__tests__/fixture/squads';
import { SquadPageContextProvider } from '../SquadPageContext';
import { SquadPageTab } from '../lib/routes';
import { SquadPageLayout } from './SquadPageLayout';

const squad = generateTestSquad({ id: 'squad', handle: 'squad' });

const renderLayout = (
  props: Partial<React.ComponentProps<typeof SquadPageLayout>> = {},
) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <SquadPageContextProvider squad={squad} isViewerReady>
        <SquadPageLayout
          header={<div />}
          hasAboutTab
          tabs={[
            {
              id: SquadPageTab.Jobs,
              label: 'Jobs',
              content: <p>Open roles</p>,
            },
          ]}
          {...props}
        >
          <p>The feed</p>
        </SquadPageLayout>
      </SquadPageContextProvider>
    </TestBootProvider>,
  );

describe('SquadPageLayout tabs', () => {
  it('should open on Posts and switch to an extra tab', () => {
    const onTabChange = jest.fn();
    renderLayout({ onTabChange });

    expect(screen.getByText('The feed')).toBeInTheDocument();
    expect(screen.queryByText('Open roles')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Jobs' })[0]);

    expect(screen.getByText('Open roles')).toBeInTheDocument();
    expect(screen.queryByText('The feed')).not.toBeInTheDocument();
    expect(onTabChange).toHaveBeenCalledWith(SquadPageTab.Jobs);
  });

  it('should open on the tab the address asks for', () => {
    renderLayout({ initialTab: SquadPageTab.Jobs });

    expect(screen.getByText('Open roles')).toBeInTheDocument();
  });

  it('should fall back to Posts while the asked tab is not there', () => {
    renderLayout({ initialTab: SquadPageTab.Perks });

    expect(screen.getByText('The feed')).toBeInTheDocument();
  });

  it('should keep the Posts and About tabs alone without extra tabs', () => {
    renderLayout({ tabs: [] });

    expect(
      screen.getByRole('navigation', { name: 'Posts and About' }),
    ).toBeInTheDocument();
  });
});
