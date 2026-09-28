import React from 'react';
import nock from 'nock';
import type { RenderResult } from '@testing-library/react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import {
  generateForbiddenSquadResult,
  generateNotFoundSquadResult,
  generateTestSquad,
} from '@dailydotdev/shared/__tests__/fixture/squads';
import type { GraphQLResult } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import type { SquadData } from '@dailydotdev/shared/src/graphql/squads';
import {
  getTopMembersBySquadSince,
  MAX_TOP_MEMBERS_BY_SQUAD,
  SQUAD_QUERY,
  TOP_MEMBERS_BY_SQUAD_QUERY,
  UPDATE_SQUAD_RULES_MUTATION,
} from '@dailydotdev/shared/src/graphql/squads';
import { SQUAD_PRODUCTS_QUERY } from '@dailydotdev/shared/src/graphql/squadProducts';
import {
  RankingAlgorithm,
  SOURCE_FEED_QUERY,
  baseFeedSupportedTypes,
} from '@dailydotdev/shared/src/graphql/feed';
import { PIN_POST_MUTATION } from '@dailydotdev/shared/src/graphql/posts';
import defaultPost from '@dailydotdev/shared/__tests__/fixture/post';
import type {
  SourceFeatures,
  SourceMember,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
} from '@dailydotdev/shared/src/graphql/sources';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import SquadPage from '../pages/squads/[handle]';
import SquadManageSectionPage from '../pages/squads/[handle]/manage/[section]';

jest.mock('@dailydotdev/shared/src/components/Feed', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockFeed = jest.mocked(Feed);
const replace = jest.fn();

const noFeatures: SourceFeatures = {
  verified: false,
  adFree: false,
  links: false,
  products: false,
};

const baseMember = generateTestSquad().currentMember as SourceMember;

const member = (
  role: SourceMemberRole,
  permissions: SourcePermissions[],
): SourceMember => ({ ...baseMember, role, permissions });

const memberPermissions = [
  SourcePermissions.View,
  SourcePermissions.Post,
  SourcePermissions.Invite,
  SourcePermissions.Leave,
];

const moderatorPermissions = [
  ...memberPermissions,
  SourcePermissions.ModeratePost,
  SourcePermissions.PostPin,
  SourcePermissions.ViewBlockedMembers,
  SourcePermissions.MemberRoleUpdate,
];

const adminMember = member(
  SourceMemberRole.Admin,
  Object.values(SourcePermissions),
);

const createSquad = (props: Partial<Squad> = {}): Squad =>
  generateTestSquad({
    features: noFeatures,
    website: null,
    links: [],
    moderationRequired: false,
    moderationPostCount: 0,
    ...props,
  });

const mockSquad = (
  squad: Squad,
  result: GraphQLResult<SquadData> = { data: { source: squad } },
) => {
  mockGraphQL({
    request: { query: SQUAD_QUERY, variables: { handle: squad.handle } },
    result,
  });

  if (result.data?.source?.public) {
    mockGraphQL({
      request: {
        query: TOP_MEMBERS_BY_SQUAD_QUERY,
        variables: {
          sourceId: squad.id,
          since: getTopMembersBySquadSince(),
          limit: MAX_TOP_MEMBERS_BY_SQUAD,
        },
      },
      result: { data: { topMembersBySquad: [] } },
    });
  }
};

const renderWithBoot = (
  page: JSX.Element,
  user: LoggedUser | null = defaultUser,
): RenderResult =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={
        user
          ? { user, squads: [] }
          : { user: undefined, isLoggedIn: false, squads: [] }
      }
    >
      {page}
    </TestBootProvider>,
  );

const renderSquadPage = (
  squad: Squad,
  user: LoggedUser | null = defaultUser,
): RenderResult =>
  renderWithBoot(
    SquadPage.getLayout(
      <SquadPage handle={squad.handle} />,
      {},
      SquadPage.layoutProps as unknown as Parameters<
        typeof SquadPage.getLayout
      >[2],
    ) as JSX.Element,
    user,
  );

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  jest.mocked(useRouter).mockReturnValue({
    pathname: '/squads/[handle]',
    asPath: '/squads/webteam',
    isFallback: false,
    isReady: true,
    query: {},
    replace,
    push: jest.fn(),
    events: { on: jest.fn(), off: jest.fn() },
  } as unknown as NextRouter);
});

interface ViewerCase {
  viewer: string;
  user: LoggedUser | null;
  squad: Partial<Squad>;
  primary: { label: string; disabled?: boolean } | null;
  hasBell: boolean;
  composer: string;
  isStaff: boolean;
  canEdit: boolean;
}

// The mock's viewer matrix (use-cases/cases.ts), one row per viewer.
const viewerCases: ViewerCase[] = [
  {
    viewer: 'anonymous',
    user: null,
    squad: { currentMember: undefined },
    primary: { label: 'Join Squad' },
    hasBell: false,
    composer: 'Join the Squad to create new posts',
    isStaff: false,
    canEdit: false,
  },
  {
    viewer: 'visitor',
    user: defaultUser,
    squad: { currentMember: undefined },
    primary: { label: 'Join Squad' },
    hasBell: false,
    composer: 'Join the Squad to create new posts',
    isStaff: false,
    canEdit: false,
  },
  {
    viewer: 'member',
    user: defaultUser,
    squad: {
      currentMember: member(SourceMemberRole.Member, memberPermissions),
    },
    primary: { label: 'Joined' },
    hasBell: true,
    composer: 'Share a link',
    isStaff: false,
    canEdit: false,
  },
  {
    viewer: 'member of a private squad',
    user: defaultUser,
    squad: {
      public: false,
      currentMember: member(SourceMemberRole.Member, memberPermissions),
    },
    primary: { label: 'Joined' },
    hasBell: true,
    composer: 'Share a link',
    isStaff: false,
    canEdit: false,
  },
  {
    viewer: 'moderator',
    user: defaultUser,
    squad: {
      currentMember: member(SourceMemberRole.Moderator, moderatorPermissions),
    },
    primary: { label: 'Joined' },
    hasBell: true,
    composer: 'Poll',
    isStaff: true,
    canEdit: false,
  },
  {
    viewer: 'admin',
    user: defaultUser,
    squad: { currentMember: adminMember },
    primary: null,
    hasBell: true,
    composer: 'Poll',
    isStaff: true,
    canEdit: true,
  },
  {
    viewer: 'blocked',
    user: defaultUser,
    squad: { currentMember: member(SourceMemberRole.Blocked, []) },
    primary: {
      label: 'You are not allowed to join the Squad',
      disabled: true,
    },
    hasBell: false,
    composer: 'You no longer have access to this Squad.',
    isStaff: false,
    canEdit: false,
  },
];

describe('squad page viewer matrix', () => {
  it.each(viewerCases)(
    'renders the page for the $viewer',
    async ({
      user,
      squad: props,
      primary,
      hasBell,
      composer,
      isStaff,
      canEdit,
    }) => {
      const squad = createSquad(props);
      mockSquad(squad);
      renderSquadPage(squad, user);

      await screen.findByLabelText('Squad options');
      expect(
        screen.getByRole('heading', { level: 1, name: squad.name }),
      ).toBeInTheDocument();
      expect(screen.getByText(squad.description)).toBeInTheDocument();
      expect(screen.getAllByText(composer).length).toBeGreaterThan(0);

      if (primary) {
        const button = screen.getAllByRole('button', {
          name: primary.label,
        })[0];
        expect(button).toBeInTheDocument();
        if (primary.disabled) {
          expect(button).toBeDisabled();
        }
      } else {
        expect(
          screen.queryByRole('button', { name: 'Join Squad' }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: 'Joined' }),
        ).not.toBeInTheDocument();
      }

      expect(!!screen.queryByLabelText('Squad notifications settings')).toBe(
        hasBell,
      );
      expect(!!screen.queryByLabelText('Edit page')).toBe(canEdit);
      expect(!!screen.queryByText('Public page & URL')).toBe(isStaff);
      expect(!!screen.queryByLabelText('View as a visitor')).toBe(isStaff);
    },
  );

  it('walls a private squad the viewer cannot read', async () => {
    const squad = createSquad({ public: false, currentMember: undefined });
    mockSquad(squad, generateForbiddenSquadResult());
    renderSquadPage(squad);

    await screen.findByText('Oops! This link leads to a private discussion');
    expect(screen.queryByLabelText('Squad options')).not.toBeInTheDocument();
  });

  it('offers a logged out visitor to log in on the private wall', async () => {
    const squad = createSquad({ public: false, currentMember: undefined });
    mockSquad(squad, generateForbiddenSquadResult());
    renderSquadPage(squad, null);

    await screen.findByText('Oops! This link leads to a private discussion');
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
  });

  it('shows not found for a missing squad', async () => {
    const squad = createSquad();
    mockSquad(squad, generateNotFoundSquadResult());
    renderSquadPage(squad);

    await screen.findByText('Why are you here?');
  });

  it('keeps the blocked member out with the banner', async () => {
    const squad = createSquad({
      currentMember: member(SourceMemberRole.Blocked, []),
    });
    mockSquad(squad);
    renderSquadPage(squad);

    await screen.findByText(
      /Contact a moderator if you think this is a mistake/,
    );
  });

  it('renders the page as a visitor while staff preview it', async () => {
    const squad = createSquad({ currentMember: adminMember });
    mockSquad(squad);
    renderSquadPage(squad);

    const toggle = await screen.findByLabelText('View as a visitor');
    toggle.click();

    await screen.findByText(/viewing the page as a visitor/);
    expect(screen.queryByLabelText('Edit page')).not.toBeInTheDocument();
    expect(screen.queryByText('Public page & URL')).not.toBeInTheDocument();
    expect(
      screen.getAllByText('Join the Squad to create new posts').length,
    ).toBeGreaterThan(0);
  });
});

describe('squad page before the viewer query lands', () => {
  // The server renders the logged out copy; the viewer's role comes from boot
  // so role specific regions render once instead of shifting in later.
  const renderFromServerCopy = (squads: Squad[]): RenderResult => {
    const serverCopy = createSquad({ currentMember: undefined });

    return render(
      <TestBootProvider
        client={new QueryClient()}
        auth={{ user: defaultUser, squads }}
      >
        {
          SquadPage.getLayout(
            <SquadPage handle={serverCopy.handle} initialSquad={serverCopy} />,
            {},
            SquadPage.layoutProps as unknown as Parameters<
              typeof SquadPage.getLayout
            >[2],
          ) as JSX.Element
        }
      </TestBootProvider>,
    );
  };

  it('renders the staff regions for an admin from boot', async () => {
    const squad = createSquad();
    renderFromServerCopy([
      {
        ...squad,
        currentMember: member(SourceMemberRole.Admin, [
          SourcePermissions.Post,
          SourcePermissions.ModeratePost,
        ]),
      },
    ]);

    expect(
      await screen.findByLabelText('View as a visitor'),
    ).toBeInTheDocument();
    expect(screen.getByText('Public page & URL')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getAllByText('Share a link').length).toBeGreaterThan(0);
  });

  it('renders the composer for a member from boot', async () => {
    const squad = createSquad();
    renderFromServerCopy([
      {
        ...squad,
        currentMember: member(SourceMemberRole.Member, [
          SourcePermissions.Post,
        ]),
      },
    ]);

    expect((await screen.findAllByText('Share a link')).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.queryByLabelText('View as a visitor'),
    ).not.toBeInTheDocument();
  });

  it('renders the lock card for a squad the viewer has not joined', async () => {
    renderFromServerCopy([]);

    expect(
      (await screen.findAllByText('Join the Squad to create new posts')).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
  });
});

describe('squad page pinned posts', () => {
  const pinned = {
    ...defaultPost,
    title: 'Read this first',
    pinnedAt: new Date('2026-09-01'),
  };

  const mockPinned = (squad: Squad) =>
    mockGraphQL({
      request: {
        query: SOURCE_FEED_QUERY,
        variables: {
          source: squad.id,
          first: 10,
          loggedIn: true,
          ranking: RankingAlgorithm.Time,
          supportedTypes: baseFeedSupportedTypes,
        },
      },
      result: {
        data: {
          page: {
            pageInfo: { hasNextPage: false, endCursor: '' },
            edges: [{ node: pinned }],
          },
        },
      },
    });

  it('lets staff unpin a post, since the feed leaves pins out', async () => {
    const squad = createSquad({
      currentMember: member(SourceMemberRole.Moderator, moderatorPermissions),
    });
    mockSquad(squad);
    mockPinned(squad);
    let unpinned = false;
    mockGraphQL({
      request: {
        query: PIN_POST_MUTATION,
        variables: { id: pinned.id, pinned: false },
      },
      result: () => {
        unpinned = true;
        return { data: { updatePinPost: { _: true } } };
      },
    });
    renderSquadPage(squad);

    fireEvent.click(await screen.findByLabelText('Unpin post'));

    await waitFor(() => expect(unpinned).toBe(true));
  });

  it('shows the pins without the unpin control to members', async () => {
    const squad = createSquad({
      currentMember: member(SourceMemberRole.Member, memberPermissions),
    });
    mockSquad(squad);
    mockPinned(squad);
    renderSquadPage(squad);

    await screen.findByText(pinned.title);
    expect(screen.queryByLabelText('Unpin post')).not.toBeInTheDocument();
  });
});

const paidProps: Partial<Squad> = {
  currentMember: adminMember,
  website: 'https://coderabbit.ai',
  links: ['https://github.com/coderabbitai', 'https://x.com/coderabbitai'],
};

const product = {
  id: 'tool-1',
  title: 'CodeRabbit CLI',
  slug: 'coderabbit-cli',
  url: 'https://coderabbit.ai/cli',
  faviconUrl: null,
  category: null,
  tagline: 'Review your changes before you push',
  description: null,
  pricingModel: null,
  links: [],
};

const mockProducts = (squad: Squad) =>
  mockGraphQL({
    request: {
      query: SQUAD_PRODUCTS_QUERY,
      variables: { handle: squad.handle },
    },
    result: { data: { source: { id: squad.id, products: [product] } } },
  });

describe('squad page paid features', () => {
  it('shows no paid surface on a free squad, even to its admin', async () => {
    const squad = createSquad(paidProps);
    mockSquad(squad);
    renderSquadPage(squad);

    await screen.findByLabelText('Squad options');
    expect(
      screen.queryByText('Verified Company Squad'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Verified Company Squad'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Links' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('coderabbit.ai')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Products' }),
    ).not.toBeInTheDocument();
    expect(mockFeed.mock.calls.at(-1)?.[0].disableAds).toBe(false);
  });

  it('shows the badge and the card for the verified key only', async () => {
    const squad = createSquad({
      ...paidProps,
      features: { ...noFeatures, verified: true },
    });
    mockSquad(squad);
    renderSquadPage(squad);

    await screen.findByText('Verified Company Squad');
    expect(screen.getByLabelText('Verified Company Squad')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Links' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Products' }),
    ).not.toBeInTheDocument();
  });

  it('renders the links without nofollow for the links key', async () => {
    const squad = createSquad({
      ...paidProps,
      features: { ...noFeatures, links: true },
    });
    mockSquad(squad);
    renderSquadPage(squad);

    const widget = (
      await screen.findByRole('heading', { name: 'Links' })
    ).closest('section') as HTMLElement;
    const anchors = within(widget).getAllByRole('link');

    expect(anchors.map((anchor) => anchor.getAttribute('href'))).toEqual([
      paidProps.website,
      ...(paidProps.links ?? []),
    ]);
    anchors.forEach((anchor) => {
      expect(anchor).toHaveAttribute('rel', 'noopener');
      expect(anchor).toHaveAttribute('target', '_blank');
    });

    const website = screen
      .getAllByText('coderabbit.ai')
      .map((element) => element.closest('a'))
      .find((anchor) => !widget.contains(anchor));
    expect(website).toHaveAttribute('rel', 'noopener');
    expect(
      screen.queryByText('Verified Company Squad'),
    ).not.toBeInTheDocument();
  });

  it('shows the products shelf for the products key', async () => {
    const squad = createSquad({
      ...paidProps,
      features: { ...noFeatures, products: true },
    });
    mockSquad(squad);
    mockProducts(squad);
    renderSquadPage(squad);

    await screen.findByRole('heading', { name: 'Products' });
    expect(screen.getByText(product.title)).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Links' }),
    ).not.toBeInTheDocument();
  });

  it('turns the squad feed ads off for the adFree key', async () => {
    const squad = createSquad({
      ...paidProps,
      features: { ...noFeatures, adFree: true },
    });
    mockSquad(squad);
    renderSquadPage(squad);

    await screen.findByLabelText('Squad options');
    await waitFor(() =>
      expect(mockFeed.mock.calls.at(-1)?.[0].disableAds).toBe(true),
    );
  });

  it('turns the ads off on the squad search results too', async () => {
    jest.mocked(useRouter).mockReturnValue({
      pathname: '/squads/[handle]',
      asPath: '/squads/webteam?q=review',
      isReady: true,
      query: { q: 'review' },
      replace,
      push: jest.fn(),
      events: { on: jest.fn(), off: jest.fn() },
    } as unknown as NextRouter);
    const squad = createSquad({
      ...paidProps,
      features: { ...noFeatures, adFree: true },
    });
    mockSquad(squad);
    renderSquadPage(squad);

    await screen.findByLabelText('Clear search');
    const props = mockFeed.mock.calls.at(-1)?.[0];
    expect(props?.variables).toMatchObject({ query: 'review' });
    expect(props?.disableAds).toBe(true);
  });
});

describe('squad rules', () => {
  const rules = [
    { title: 'Stay on topic', description: 'Posts fit the Squad.' },
    { title: 'Be respectful', description: null },
  ];

  it('lists the rule titles in the widget and links to the rules page', async () => {
    const squad = createSquad({ rules });
    mockSquad(squad);
    renderSquadPage(squad);

    const widget = (
      await screen.findByRole('heading', { name: 'Rules' })
    ).closest('section') as HTMLElement;
    expect(
      within(widget)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['1Stay on topic', '2Be respectful']);
    expect(
      within(widget).getByRole('link', { name: 'All rules' }),
    ).toHaveAttribute('href', '/squads/webteam/rules');
  });

  it('shows no rules widget when the squad removed every rule', async () => {
    const squad = createSquad({ rules: [] });
    mockSquad(squad);
    renderSquadPage(squad);

    await screen.findByLabelText('Squad options');
    expect(
      screen.queryByRole('heading', { name: 'Rules' }),
    ).not.toBeInTheDocument();
  });
});

describe('squad manage area', () => {
  const renderManage = (
    squad: Squad,
    section: SquadManageSection = SquadManageSection.Members,
  ) =>
    renderWithBoot(
      SquadManageSectionPage.getLayout(
        <SquadManageSectionPage handle={squad.handle} section={section} />,
      ) as JSX.Element,
    );

  it('lists no paid section for a free squad', async () => {
    const squad = createSquad({ currentMember: adminMember });
    mockSquad(squad);
    renderManage(squad);

    const menu = (
      await screen.findAllByRole('navigation', { name: 'Manage' })
    )[0];
    expect(within(menu).getByText('Details')).toBeInTheDocument();
    expect(within(menu).queryByText('Products')).not.toBeInTheDocument();
    expect(within(menu).queryByText('Links')).not.toBeInTheDocument();
  });

  it('lists the paid sections the squad has', async () => {
    const squad = createSquad({
      currentMember: adminMember,
      features: { ...noFeatures, links: true, products: true },
    });
    mockSquad(squad);
    renderManage(squad);

    const menu = (
      await screen.findAllByRole('navigation', { name: 'Manage' })
    )[0];
    expect(within(menu).getByText('Products')).toBeInTheDocument();
    expect(within(menu).getByText('Links')).toBeInTheDocument();
  });

  it('sends a member without staff rights back to the squad', async () => {
    const squad = createSquad({
      currentMember: member(SourceMemberRole.Member, memberPermissions),
    });
    mockSquad(squad);
    renderManage(squad);

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith('/squads/webteam'),
    );
  });

  it('saves the edited rules in their new order', async () => {
    const squad = createSquad({
      currentMember: adminMember,
      rules: [
        { title: 'Stay on topic', description: 'Posts fit the Squad.' },
        { title: 'Be respectful', description: null },
      ],
    });
    mockSquad(squad);
    const saved = [
      { title: 'Be respectful', description: null },
      { title: 'Stay on topic', description: 'Posts fit the Squad.' },
      { title: 'No spam', description: null },
    ];
    let isSaved = false;
    mockGraphQL({
      request: {
        query: UPDATE_SQUAD_RULES_MUTATION,
        variables: { sourceId: squad.id, rules: saved },
      },
      result: () => {
        isSaved = true;
        return { data: { updateSquadRules: { id: squad.id, rules: saved } } };
      },
    });
    renderManage(squad, SquadManageSection.Rules);

    fireEvent.click(await screen.findByLabelText('Move rule 2 up'));
    fireEvent.click(screen.getByText('Add rule'));
    const titles = document.querySelectorAll('input[name^="rule-title-"]');
    fireEvent.input(titles[2], { target: { value: '  No spam  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await screen.findByText('The rules have been updated');
    expect(isSaved).toBe(true);
  });
});
