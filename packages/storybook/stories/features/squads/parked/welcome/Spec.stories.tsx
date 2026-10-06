import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  SQUAD_WELCOME_CTA_LABEL_MAX,
  SQUAD_WELCOME_HEADLINE_MAX,
  SQUAD_WELCOME_RULES_SHOWN,
  SQUAD_WELCOME_TEXT_MAX,
} from '@dailydotdev/shared/src/features/squads/lib/welcome';
import { SQUAD_LINK_MAX_LENGTH } from '@dailydotdev/shared/src/features/squads/lib/limits';
import {
  Code,
  Decision,
  H1,
  H2,
  H3,
  Lead,
  List,
  P,
  SpecPage,
  StoryLinks,
  Table,
} from '../kit';
import { titles } from '../titles';

const Spec = () => (
  <SpecPage>
    <H1>Welcome pop-up</H1>
    <Lead>
      A verified squad greets people the moment they join, with one pop-up the
      company fills in: a cover, an image, a headline, a line of text, the house
      rules and one button.
    </Lead>
    <StoryLinks
      links={[
        {
          label: 'Pop-up: default',
          title: titles.welcomePopup,
          story: 'Default',
        },
        { label: 'In the app', title: titles.welcomePopup, story: 'InTheApp' },
        { label: 'Manage page', title: titles.welcomeManage, story: 'Filled' },
        {
          label: 'Responsive sheet',
          title: titles.welcomeResponsive,
          story: 'AllWidths',
        },
      ]}
    />

    <H2>Who sees it, and when</H2>
    <List
      items={[
        'Opens once, right after a successful Join: from the squad header and after joining through an invite link. Never on a later visit.',
        <>
          Only for a <Code>features.verified</Code> squad whose pop-up is
          switched on (<Code>welcome.enabled</Code>).
        </>,
        'The saved pop-up is read fresh at join time. If that request fails, nothing opens; the join itself is never blocked.',
        'Laptop and up: a small centred modal. Phone: a bottom drawer.',
      ]}
    />

    <H2>The template</H2>
    <P>
      The layout never changes. Each field falls back to something sensible, so
      an empty template still works.
    </P>
    <Table
      head={['Field', 'When empty', 'Limit', 'Notes']}
      rows={[
        [
          'Cover',
          'The squad’s cover',
          '2 MB image',
          'Upload, or “Use the squad’s cover” to reset',
        ],
        [
          'Image',
          'The squad’s logo',
          '2 MB image',
          'Round, under the cover: a logo, event or product image',
        ],
        [
          'Headline',
          'Welcome to <squad>',
          `${SQUAD_WELCOME_HEADLINE_MAX} characters`,
          '',
        ],
        ['Text', 'Not shown', `${SQUAD_WELCOME_TEXT_MAX} characters`, ''],
        [
          'House rules',
          'Off',
          `The first ${SQUAD_WELCOME_RULES_SHOWN}`,
          'From Manage › Rules; the switch is disabled while the squad has none',
        ],
        [
          'Button label',
          '“Got it”, or “Open” with a link',
          `${SQUAD_WELCOME_CTA_LABEL_MAX} characters`,
          '',
        ],
        [
          'Button link',
          'The button closes the pop-up',
          `${SQUAD_LINK_MAX_LENGTH} characters`,
          'http or https with a real domain, the same check as the API',
        ],
      ]}
    />
    <H3>Examples</H3>
    <P>
      Four quick fills for the words only (Default, An event, A product, A
      launch). Images stay whatever the squad chose.
    </P>

    <H2>Manage › Welcome pop-up</H2>
    <List
      items={[
        'Listed under Community, for people with Edit permission on a verified squad.',
        'Fields on the left, a live preview on the right from laptop L (1360px); below that the preview stacks under the form.',
        'Switched off, the preview dims to 40% so it still reads as a draft.',
        'Save sends only what changed for images: a new upload, or a reset back to the squad’s own.',
      ]}
    />

    <H2>Decided in review</H2>
    <Decision>
      One template, not pop-up types. Event, product and launch are examples
      that fill the words in.
    </Decision>
    <Decision>
      “Maybe later” is always there next to the company’s button.
    </Decision>

    <H2>API</H2>
    <Table
      head={['', 'Contract', 'Who']}
      rows={[
        [
          <Code key="q">squadWelcome(sourceId)</Code>,
          'Returns SquadWelcome',
          'Anyone who can view the squad',
        ],
        [
          <Code key="m">
            updateSquadWelcome(sourceId, input, cover, image)
          </Code>,
          'Uploads, then merges only the keys sent into source.welcome (welcome || :json, atomic)',
          'Edit permission on a verified squad',
        ],
      ]}
    />
    <P>
      Stored in <Code>source.welcome</Code> (jsonb, default {'{}'}). Images go
      through the squad’s own upload helpers. <Code>resetCover</Code> and{' '}
      <Code>resetImage</Code> clear a custom image; an upload in the same save
      wins.
    </P>

    <H2>Analytics events</H2>
    <Table
      head={['Event', 'When', 'Extra']}
      rows={[
        [
          <Code key="a">show squad welcome</Code>,
          'The pop-up opens',
          'target_id = squad id',
        ],
        [
          <Code key="b">click squad welcome cta</Code>,
          'The company’s button',
          '{ hasLink }',
        ],
      ]}
    />

    <H2>Where the code is</H2>
    <Table
      head={['Repo', 'Files']}
      rows={[
        [
          'apps',
          <List
            key="apps"
            items={[
              <Code key="1">graphql/squadWelcomeAudience.ts</Code>,
              <Code key="2">features/squads/lib/welcome.ts (+ spec)</Code>,
              <Code key="3">features/squads/hooks/useSquadWelcome.ts</Code>,
              <Code key="4">
                features/squads/components/welcome/SquadWelcomeCard.tsx
              </Code>,
              <Code key="5">
                components/modals/squads/SquadWelcomeModal.tsx
                (LazyModal.SquadWelcome)
              </Code>,
              <Code key="6">
                features/squads/components/manage/SquadManageWelcome.tsx
              </Code>,
              <Code key="7">
                header/SquadActions.tsx and pages/squads/[handle]/[token].tsx
                open it
              </Code>,
            ]}
          />,
        ],
        [
          'daily-api',
          <List
            key="api"
            items={[
              <Code key="1">src/common/squadWelcomeAudience.ts</Code>,
              <Code key="2">src/schema/squadWelcomeAudience.ts</Code>,
              <Code key="3">src/entity/Source.ts (welcome column)</Code>,
              <Code key="4">src/migration/1792000000001-SquadWelcome.ts</Code>,
              <Code key="5">__tests__/squadWelcomeAudience.ts</Code>,
            ]}
          />,
        ],
      ]}
    />
  </SpecPage>
);

const meta: Meta = {
  title: 'Verified Squads (parked)/1. Welcome pop-up/Spec',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const WelcomePopupSpec: StoryObj = {
  name: 'Spec',
  render: () => <Spec />,
};
