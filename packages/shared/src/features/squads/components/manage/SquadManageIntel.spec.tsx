import React from 'react';
import nock from 'nock';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import defaultUser from '../../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../../__tests__/helpers/graphql';
import { mockDesktop } from '../../../../../__tests__/helpers/media';
import type { Squad } from '../../../../graphql/sources';
import { SourceMemberRole } from '../../../../graphql/sources';
import type {
  SquadIntel,
  SquadIntelSettings,
} from '../../../../graphql/squadIntel';
import {
  squadIntelQueryOptions,
  squadIntelSettingsQueryOptions,
  UPDATE_SQUAD_INTEL_SETTINGS_MUTATION,
} from '../../../../graphql/squadIntel';
import { PromptElement } from '../../../../components/modals/Prompt';
import { PROMPT_KEY } from '../../../../hooks/usePrompt';
import { SquadPageContextProvider } from '../../SquadPageContext';
import { SquadManageIntel } from './SquadManageIntel';

const squad = {
  id: 'squad1',
  handle: 'acme',
  name: 'Acme',
  currentMember: { role: SourceMemberRole.Admin, seat: true },
} as unknown as Squad;

const settings: SquadIntelSettings = {
  selection: { tags: ['react'], seniority: null, regions: null },
  limits: { tags: 5, seniority: false, regions: false },
  nextIntelAt: '2026-11-09T00:00:00.000Z',
};

const intel: SquadIntel = {
  weekStart: '2026-10-26T00:00:00.000Z',
  weekEnd: '2026-11-02T00:00:00.000Z',
  selection: settings.selection,
  broadened: false,
  markdown: '# Weekly intel',
  generatedAt: '2026-11-02T00:20:00.000Z',
};

const openIntel = async (latest: SquadIntel | null) => {
  const client = new QueryClient();
  const options = { user: defaultUser, sourceId: squad.id };
  client.setQueryData(
    squadIntelSettingsQueryOptions(options).queryKey,
    settings,
  );
  client.setQueryData(squadIntelQueryOptions(options).queryKey, latest);

  render(
    <TestBootProvider client={client} auth={{ user: defaultUser }}>
      <SquadPageContextProvider squad={squad} isViewerReady>
        <SquadManageIntel />
        <PromptElement ariaHideApp={false} />
      </SquadPageContextProvider>
    </TestBootProvider>,
  );

  // Let the prompt's first read settle, so it does not wipe the prompt
  await waitFor(() =>
    expect(client.getQueryState(PROMPT_KEY)?.status).toBe('success'),
  );

  return () =>
    fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0]);
};

const mockSave = () => {
  let saved = false;
  mockGraphQL({
    request: {
      query: UPDATE_SQUAD_INTEL_SETTINGS_MUTATION,
      variables: { sourceId: squad.id, ...settings.selection },
    },
    result: () => {
      saved = true;
      return { data: { updateSquadIntelSettings: settings } };
    },
  });

  return () => saved;
};

beforeEach(() => {
  nock.cleanAll();
  mockDesktop();
});

describe('SquadManageIntel', () => {
  it('asks to confirm the settings before the first intel is built', async () => {
    const isSaved = mockSave();
    const submit = await openIntel(null);

    submit();

    expect(
      await screen.findByText('Build your first intel with these settings?'),
    ).toBeInTheDocument();
    expect(screen.getByText('Every level')).toBeInTheDocument();
    expect(isSaved()).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Build my intel' }));

    await waitFor(() => expect(isSaved()).toBe(true));
  });

  it('saves a change right away and says when it shows', async () => {
    const isSaved = mockSave();
    const submit = await openIntel(intel);

    expect(
      await screen.findByText(/show from the next one, on Monday, Nov 9/),
    ).toBeInTheDocument();
    submit();

    await waitFor(() => expect(isSaved()).toBe(true));
    expect(
      screen.queryByText('Build your first intel with these settings?'),
    ).not.toBeInTheDocument();
  });
});
