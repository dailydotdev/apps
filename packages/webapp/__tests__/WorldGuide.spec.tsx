import React from 'react';
import { render, screen, within } from '@testing-library/react';
import type { WorldDistrict } from '../graphql/world';
import { WorldGuideRail } from '../components/world/WorldGuide';
import { LEVELS } from '../components/world/ladder';

const district = (slug: string, reads: number): WorldDistrict =>
  ({ niche: { id: slug, slug }, reads } as WorldDistrict);

const renderGuide = (
  props: Partial<Parameters<typeof WorldGuideRail>[0]> = {},
) => render(<WorldGuideRail isOwn onClose={jest.fn()} {...props} />);

describe('WorldGuideRail', () => {
  it('writes the ladder down, every rung of it', () => {
    renderGuide();

    const rungs = within(
      screen.getByRole('list', { name: 'Levels' }),
    ).getAllByRole('listitem');

    expect(rungs).toHaveLength(LEVELS.length);
    LEVELS.forEach(({ reads }, index) => {
      const rung = rungs[index];
      expect(within(rung).getByText(`L${index + 1}`)).toBeInTheDocument();
      expect(
        within(rung).getByText(reads.toLocaleString()),
      ).toBeInTheDocument();
    });
  });

  it('marks the rung the world is actually standing on', () => {
    // 40 is L7 and 12 is L5, so the busiest district carries the mark.
    renderGuide({ districts: [district('rust', 12), district('css', 40)] });

    expect(screen.getByText(/busiest district is L7/)).toBeInTheDocument();
  });

  /* A world with nothing read into it has no rung to point at, and "L0" is not
     one: the ladder starts at the first article. */
  it('says nothing about a rung on a world with no districts', () => {
    renderGuide({ districts: [] });

    expect(screen.queryByText(/busiest district/)).not.toBeInTheDocument();
  });

  it('promises the replay only where there is one to play', () => {
    const { rerender } = renderGuide({ hasReplay: true });
    expect(screen.getByText(/Play the bar below/)).toBeInTheDocument();

    rerender(<WorldGuideRail isOwn onClose={jest.fn()} />);
    expect(screen.queryByText(/Play the bar below/)).not.toBeInTheDocument();
  });

  /* Nobody else's world is yours to dress, so the bench is not offered on one. */
  it('points at the bench only on your own world', () => {
    const { rerender } = renderGuide({ canCustomize: true });
    expect(screen.getByText(/Make it yours/)).toBeInTheDocument();

    rerender(
      <WorldGuideRail isOwn={false} canCustomize={false} onClose={jest.fn()} />,
    );
    expect(screen.queryByText(/Make it yours/)).not.toBeInTheDocument();
  });

  it('speaks about the reader on their own world and about the owner on anyone else’s', () => {
    const { rerender } = renderGuide();
    expect(screen.getByText(/Every article you read/)).toBeInTheDocument();

    rerender(<WorldGuideRail isOwn={false} onClose={jest.fn()} />);
    expect(screen.getByText(/Every article they read/)).toBeInTheDocument();
  });
});
