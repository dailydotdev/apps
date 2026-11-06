import React from 'react';
import type { Bp, Category } from '../kit';
import { Box, Center, Col, Fields, ListRows, Row } from '../kit';

const Form = ({ spec }: { spec: string }) => (
  <Box label="Form" spec={spec} className="flex-1">
    <Fields count={5} />
  </Box>
);

/** A menu column next to a form card, in a max-w-5xl frame. */
const menuAndCard = (bp: Bp, menu: string, max = 1024) => {
  if (bp === 'phone') {
    return (
      <Box
        tone="nav"
        label={menu}
        spec="full-screen menu"
        className="m-4 flex-1"
      >
        <ListRows count={9} thumb={false} />
      </Box>
    );
  }
  return (
    <Center max={max} style={{ flex: 1, padding: 24 }}>
      <Row style={{ flex: 1 }}>
        <Box
          tone="nav"
          label={menu}
          spec="w-64 · 256px"
          style={{ width: 256 }}
          className="shrink-0 self-start"
        >
          <ListRows count={8} thumb={false} />
        </Box>
        <Form spec="flex-1 rounded-16 border" />
      </Row>
    </Center>
  );
};

export const menuPane: Category = {
  title: 'Menu + pane',
  summary:
    'A section menu next to a form. On phone the menu is its own screen or a drawer, and each section opens on its own.',
  intro: (
    <p>
      Settings puts its menu in the expanded sidebar&apos;s context panel on
      laptop, with a max-w-3xl form centred in the card. On tablet the same menu
      moves into the page as a 256px column. Organization settings and squad
      management keep that 256px column on laptop too.
    </p>
  ),
  variants: [
    {
      name: 'Account settings',
      production: { story: 'settings-profile', url: '/settings/profile' },
      routes: [
        '/settings/profile',
        '/settings/profile/experience/work',
        '/settings/profile/experience/education',
        '/settings/profile/experience/certification',
        '/settings/profile/experience/project',
        '/settings/profile/experience/opensource',
        '/settings/profile/experience/volunteering',
        '/settings/profile/experience/edit',
        '/settings/appearance',
        '/settings/composition',
        '/settings/notifications',
        '/settings/privacy',
        '/settings/security',
        '/settings/subscription',
        '/settings/invite',
        '/settings/api',
        '/settings/job-preferences',
        '/settings/feedback',
        '/settings/feedback/[id]',
        '/settings/organization',
        '/settings/customization/devcard',
        '/settings/customization/gamification',
        '/settings/customization/integrations',
        '/settings/customization/streaks',
        '/settings/feed/overview',
        '/settings/feed/general',
        '/settings/feed/filters',
        '/settings/feed/ranking',
        '/settings/feed/sources',
        '/settings/feed/tags',
        '/settings/feed/ai',
        '/notifications/settings',
        '/game-center/settings',
      ],
      chrome: 'app',
      sidebarPanel: 'Settings menu · sidebar panel',
      header: {
        laptop: 'PageHeader · min-h-14 px-6, portalled',
        tablet: '← Settings · h-14',
        phone: 'Settings',
      },
      widths: [
        'Laptop: the sidebar is forced expanded (laptop:!pl-[20rem]) and its panel holds the menu (MainLayout.tsx:159)',
        'Form column mx-auto w-full max-w-3xl · 768px tablet:p-6 (SettingsLayout/index.tsx:174); fields often max-w-sm · 384px',
        'Tablet: max-w-5xl, menu tablet:w-64 · 256px (ProfileSettingsMenu.tsx:436) + a bordered rounded-16 card with a sticky h-14 heading',
        'Phone: the menu is a full-screen NavDrawer; content is full width with p-4',
      ],
      flags: [
        'The phone bottom bar is hidden on /settings/* but shows on /notifications/settings and /game-center/settings, which re-export the same pages (shellNav.ts:103).',
      ],
      render: (bp) =>
        bp === 'laptop' ? (
          <Center max={768} style={{ flex: 1, padding: 24 }}>
            <Form spec="max-w-3xl · 768px" />
          </Center>
        ) : (
          menuAndCard(bp, 'Settings menu')
        ),
    },
    {
      name: 'Organization settings',
      production: {
        story: 'organization-general',
        url: '/settings/organization/[orgId]/general',
      },
      routes: [
        '/settings/organization/[orgId]/general',
        '/settings/organization/[orgId]/members',
        '/settings/organization/[orgId]/billing',
      ],
      chrome: 'no-sidebar',
      header: { phone: 'Organization' },
      widths: [
        'Frame mx-auto flex w-full max-w-5xl · 1024px gap-4 tablet:p-6 (OrganizationLayout/index.tsx:76)',
        'OrganizationSidebar tablet:w-64 · 256px (Sidebar.tsx:68) + AccountPageContent flex-1',
        'Phone: the org menu in a NavDrawer',
      ],
      flags: [
        'No page title on laptop: the PageHeader slot only exists in SettingsLayout.',
        'The content card loses its border on laptop (laptop:border-0) although there is no floating card around it.',
        'Members who are not admins get plain SettingsLayout with no rail, so on laptop they see no settings menu at all.',
      ],
      render: (bp) => menuAndCard(bp, 'Organization menu'),
    },
    {
      name: 'Squad management',
      production: {
        story: 'squad-manage',
        url: '/squads/daily_updates/manage',
      },
      routes: [
        '/squads/[handle]/manage',
        '/squads/[handle]/manage/[section]',
        '/squads/[handle]/manage/products/new',
        '/squads/[handle]/manage/products/[productId]',
      ],
      chrome: 'app',
      header: { phone: 'Manage squad' },
      widths: [
        'Frame mx-auto laptop:max-w-5xl laptopL:max-w-6xl · 1152px (SquadManageLayout.tsx:308)',
        'Menu aside w-64 · 256px, bordered, self-start + main flex-1 rounded bordered card',
        'Tablet and phone: the menu is a full-page list, each section its own screen',
      ],
      notes: 'No phone bottom bar.',
      render: (bp) =>
        bp === 'laptop' ? (
          menuAndCard(bp, 'Manage menu', 1152)
        ) : (
          <Col style={{ flex: 1 }}>
            <Box
              tone="nav"
              label="Manage menu"
              spec="full-page list"
              className="m-4 flex-1"
            >
              <ListRows count={9} thumb={false} />
            </Box>
          </Col>
        ),
    },
  ],
};
