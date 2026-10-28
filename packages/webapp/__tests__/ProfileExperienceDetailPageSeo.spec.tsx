import type { ReactElement } from 'react';
import React from 'react';
import { render } from '@testing-library/react';
import { HeadManagerContext } from 'next/dist/shared/lib/head-manager-context.shared-runtime';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { ProfileExperienceDetailPage } from '../components/layouts/ProfileLayout/ProfileExperienceDetailPage';

const user = {
  id: 'u1',
  name: 'Daily Dev',
  username: 'dailydotdev',
  image: 'https://daily.dev/daily.png',
  permalink: 'https://daily.dev/dailydotdev',
} as PublicProfile;

const renderHead = (
  noindex: boolean,
): { robots?: string; canonical?: string } => {
  let headState: ReactElement[] = [];
  const headManager = {
    mountedInstances: new Set(),
    updateHead: (state: ReactElement[]) => {
      headState = state;
    },
  } as never;

  render(
    <HeadManagerContext.Provider value={headManager}>
      <ProfileExperienceDetailPage
        user={user}
        noindex={noindex}
        experiences={undefined}
        title="Work Experience"
        seoTitle="Work experience for Daily Dev (@dailydotdev)"
      />
    </HeadManagerContext.Provider>,
  );

  const tags = headState.map((el) => el.props as Record<string, string>);

  return {
    robots: tags.find((props) => props.name === 'robots')?.content,
    canonical: tags.find((props) => props.rel === 'canonical')?.href,
  };
};

// The experiences only load on the client, so the server render is the one
// crawlers see. It must already carry the noindex and the profile canonical.
describe('profile experience detail page seo', () => {
  it.each([true, false])(
    'renders noindex,nofollow and the profile canonical before experiences load (user noindex: %s)',
    (noindex) => {
      const { robots, canonical } = renderHead(noindex);

      expect(robots).toBe('noindex,nofollow');
      expect(canonical).toBe('https://daily.dev/dailydotdev');
    },
  );
});
