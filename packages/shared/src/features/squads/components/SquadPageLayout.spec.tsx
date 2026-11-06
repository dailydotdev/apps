import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import { SquadPageLayout } from './SquadPageLayout';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('./widgets/SquadWidgets', () => ({
  SquadWidgets: () => null,
}));

jest.mock('./widgets/SquadPreview', () => ({
  SquadPreviewNotice: () => null,
}));

const replace = jest.fn();

const renderAt = (asPath: string, hasJobs = true) => {
  jest
    .mocked(useRouter)
    .mockReturnValue({ asPath, replace } as unknown as NextRouter);

  return render(
    <SquadPageLayout
      header={<div />}
      hasAboutTab
      jobs={hasJobs ? <p>Open roles</p> : undefined}
    >
      <p>Squad feed</p>
    </SquadPageLayout>,
  );
};

beforeEach(() => {
  replace.mockReset();
});

describe('SquadPageLayout jobs tab', () => {
  it('opens on Jobs from its address and goes back to the squad on Posts', () => {
    renderAt('/squads/acme/jobs?ref=x');

    expect(screen.getByText('Open roles')).toBeInTheDocument();
    expect(screen.queryByText('Squad feed')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Posts' })[0]);
    expect(replace).toHaveBeenCalledWith('/squads/acme', undefined, {
      shallow: true,
      scroll: false,
    });
  });

  it('keeps a squad whose handle is jobs on its posts', () => {
    renderAt('/squads/jobs');

    expect(screen.getByText('Squad feed')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Jobs' })[0]);
    expect(replace).toHaveBeenCalledWith('/squads/jobs/jobs', undefined, {
      shallow: true,
      scroll: false,
    });
  });

  it('shows the posts at the jobs address when the squad has no jobs tab', () => {
    renderAt('/squads/acme/jobs', false);

    expect(screen.getByText('Squad feed')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Jobs' }),
    ).not.toBeInTheDocument();
  });
});
