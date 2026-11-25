import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { SquadJob } from '../../../../graphql/squadJobs';
import {
  SquadJobEmploymentType,
  SquadJobWorkplace,
} from '../../../../graphql/squadJobs';
import { useSquadJobs } from '../../hooks/useSquadJobs';
import { SquadPageTabsProvider } from '../../SquadPageTabsContext';
import { SquadJobsWidget } from './SquadJobsWidget';

jest.mock('../../SquadPageContext', () => ({
  useSquadPageContext: () => ({
    squad: { id: 'acme-id', handle: 'acme', name: 'Acme' },
  }),
}));

jest.mock('../../hooks/useSquadJobs', () => ({
  useSquadJobs: jest.fn(),
}));

const mockLogEvent = jest.fn();
jest.mock('../../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

const makeJob = (index: number): SquadJob => ({
  id: `job-${index}`,
  sourceId: 'acme-id',
  title: `Role ${index}`,
  team: null,
  location: 'Remote',
  workplace: SquadJobWorkplace.Remote,
  employmentType: SquadJobEmploymentType.FullTime,
  salary: index === 1 ? '$100K–$120K' : null,
  about: null,
  bullets: [],
  applyUrl: 'https://acme.com/jobs',
  createdAt: new Date().toISOString(),
});

const mockJobs = (count: number, isEnabled = true) =>
  jest.mocked(useSquadJobs).mockReturnValue({
    isEnabled,
    isPending: false,
    jobs: Array.from({ length: count }, (_, index) => makeJob(index + 1)),
  });

const openJobs = jest.fn();

const renderWidget = (tabs = { openJobs, isJobsOpen: false }) =>
  render(
    <SquadPageTabsProvider {...tabs}>
      <SquadJobsWidget />
    </SquadPageTabsProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SquadJobsWidget', () => {
  it('features the first three roles and opens the Jobs tab', () => {
    mockJobs(5);
    renderWidget();

    expect(screen.getByText('Open roles at Acme')).toBeInTheDocument();
    expect(screen.getByText('Role 1')).toBeInTheDocument();
    expect(screen.getByText('Role 3')).toBeInTheDocument();
    expect(screen.queryByText('Role 4')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Role 1/ })).toHaveAttribute(
      'href',
      '/squads/acme/jobs/job-1',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show all 5 jobs' }));
    expect(openJobs).toHaveBeenCalled();
  });

  it('renders nothing without roles', () => {
    mockJobs(0);
    const { container } = renderWidget();

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the squad has no jobs board', () => {
    mockJobs(2, false);
    const { container } = renderWidget();

    expect(container).toBeEmptyDOMElement();
  });

  it('hides while the Jobs tab is open', () => {
    mockJobs(2);
    const { container } = renderWidget({ openJobs, isJobsOpen: true });

    expect(container).toBeEmptyDOMElement();
  });

  it('links to the Jobs tab on pages without one', () => {
    mockJobs(2);
    render(<SquadJobsWidget />);

    expect(screen.getByRole('link', { name: 'Show all jobs' })).toHaveAttribute(
      'href',
      '/squads/acme/jobs',
    );
  });
});
