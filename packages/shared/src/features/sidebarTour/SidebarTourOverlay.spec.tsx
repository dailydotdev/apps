import type { RenderResult } from '@testing-library/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import type { LoggedUser } from '../../lib/user';
import { featureSidebarTour } from '../../lib/featureManagement';
import { SpotlightProvider } from '../../components/spotlight/SpotlightContext';
import { SidebarDesktopV2 } from '../../components/sidebar/SidebarDesktopV2';
import { SIDEBAR_V2_ROLLOUT_DATE } from './useSidebarTourState';

jest.mock('../../hooks/layout/useLayoutVariant', () => ({
  useLayoutVariant: () => ({ isV2: true, isLoading: false }),
}));

const existingUser: LoggedUser = {
  ...defaultUser,
  createdAt: new Date(
    SIDEBAR_V2_ROLLOUT_DATE.getTime() - 1000 * 60 * 60 * 24,
  ).toISOString(),
};

const updateFlag = jest.fn();
// The one class the tour adds to the rail itself, lifting it over the scrim.
const RAIL_TOUR_LIFT_CLASS = 'laptop:!z-tooltip';
// The tour auto-starts on a grace timer, so every assertion about it needs more
// than the default 1s waitFor budget.
const TOUR_TIMEOUT = 4000;

const renderRail = (isFeatureEnabled: boolean): RenderResult => {
  const gb = new GrowthBook();
  gb.setFeatures({
    [featureSidebarTour.id]: { defaultValue: isFeatureEnabled },
  });

  return render(
    <TestBootProvider
      client={new QueryClient()}
      gb={gb}
      auth={{ user: existingUser, isLoggedIn: true }}
      settings={{ updateFlag }}
    >
      <SpotlightProvider>
        <SidebarDesktopV2 activePage="/" />
      </SpotlightProvider>
    </TestBootProvider>,
  );
};

describe('sidebar tour wiring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('with the feature flag off', () => {
    it('leaves the rail exactly as it is today', async () => {
      renderRail(false);

      const aside = await screen.findByTestId('sidebar-aside');
      expect(aside).not.toHaveClass(RAIL_TOUR_LIFT_CLASS);

      // Give the auto-start timer more than its grace period to misfire.
      await new Promise((resolve) => {
        setTimeout(resolve, 1200);
      });

      expect(
        screen.queryByTestId('sidebar-tour-scrim'),
      ).not.toBeInTheDocument();
      expect(screen.queryByText('Skip tour')).not.toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Support'));

      expect(screen.queryByText('Learn the sidebar')).not.toBeInTheDocument();
      expect(screen.getByText('Docs')).toBeInTheDocument();
    });
  });

  describe('with the feature flag on', () => {
    it('spotlights the rail and teaches compact mode on step one', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });
      expect(
        screen.getByText(
          'Your navigation moved into this rail, and panels open on hover.',
        ),
      ).toBeInTheDocument();

      const aside = screen.getByTestId('sidebar-aside');
      expect(aside).toHaveClass(RAIL_TOUR_LIFT_CLASS);

      fireEvent.click(screen.getByText('Compact mode'));

      expect(updateFlag).toHaveBeenCalledWith('sidebarCompact', true);
    });

    it('ends the tour on skip and does not bring it back', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });

      fireEvent.click(screen.getByText('Skip tour'));

      await waitFor(() =>
        expect(
          screen.queryByTestId('sidebar-tour-scrim'),
        ).not.toBeInTheDocument(),
      );

      await new Promise((resolve) => {
        setTimeout(resolve, 1200);
      });

      expect(
        screen.queryByTestId('sidebar-tour-scrim'),
      ).not.toBeInTheDocument();
    });

    it('offers the tour again from the support menu', async () => {
      renderRail(true);

      await screen.findByTestId('sidebar-tour-scrim', undefined, {
        timeout: TOUR_TIMEOUT,
      });
      fireEvent.click(screen.getByText('Skip tour'));
      await waitFor(() =>
        expect(
          screen.queryByTestId('sidebar-tour-scrim'),
        ).not.toBeInTheDocument(),
      );

      fireEvent.click(screen.getByLabelText('Support'));
      fireEvent.click(screen.getByText('Learn the sidebar'));

      await screen.findByTestId('sidebar-tour-scrim');
      expect(
        screen.getByText(
          'Your navigation moved into this rail, and panels open on hover.',
        ),
      ).toBeInTheDocument();
    });
  });
});
