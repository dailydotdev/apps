import React from 'react';
import nock from 'nock';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import { ALERT_DEFAULTS } from '../../../contexts/AlertContext';
import type { SettingsContextData } from '../../../contexts/SettingsContext';
import { feedV2SupportedTypes } from '../../../graphql/feed';
import type { FeedSettings } from '../../../graphql/feedSettings';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
  UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION,
} from '../../../graphql/feedSettings';
import type { SettingsFlags } from '../../../graphql/settings';
import { SidebarSettingsFlags } from '../../../graphql/settings';
import { getFeedSettingsQueryKey } from '../../../hooks/useFeedSettings';
import { LogEvent, TargetType } from '../../../lib/log';
import {
  RESET_FEED_PERSONALIZATION_MUTATION,
  SET_FEED_TOPIC_MODE_MUTATION,
  WHATS_OFF_QUERY,
} from '../graphql';
import { feedControlsQueryKey } from '../queries';
import type { WhatsOffChange, WhatsOffLine } from '../types';
import {
  FeedTopicMode,
  WhatsOffLineKind,
  WhatsOffOp,
  WhatsOffResponse,
  WhatsOffScope,
  WhatsOffTargetType,
} from '../types';
import { WHATS_OFF_MAX_LENGTH } from '../whatsOff';
import { WhatsOffBox } from './WhatsOffBox';

const logEvent = jest.fn();
const text = 'too much AI agents';
const answerId = 'answer-1';

const agents = {
  type: WhatsOffTargetType.Keyword,
  id: 'ai-agents',
  name: 'ai-agents',
};

const showLessAgents: WhatsOffChange = {
  op: WhatsOffOp.Topic,
  target: agents,
  mode: FeedTopicMode.Demote,
  certainty: 0.9,
  plusOnly: false,
};

const whatsOffRequest = {
  query: WHATS_OFF_QUERY,
  variables: { version: 116, text, supportedTypes: feedV2SupportedTypes },
};

const answerWith = (lines: WhatsOffLine[]) => ({
  data: {
    whatsOff: {
      id: answerId,
      response: WhatsOffResponse.Act,
      scope: WhatsOffScope.Feed,
      asks: [{ words: 'AI agents', direction: 'less' }],
      lines,
    },
  },
});

interface BoxOptions {
  feedSettings?: FeedSettings;
  settings?: Partial<SettingsContextData>;
}

const showBox = ({ feedSettings, settings }: BoxOptions = {}) => {
  const client = new QueryClient();
  client.setQueryData(feedControlsQueryKey(defaultUser), {
    topics: [],
    sources: [],
    authors: [],
    learning: true,
    fillIns: true,
    ranking: [],
  });
  client.setQueryData(getFeedSettingsQueryKey(defaultUser), {
    feedSettings: { advancedSettings: [], ...feedSettings },
  });
  const box = (boxSettings?: Partial<SettingsContextData>) => (
    <TestBootProvider
      client={client}
      auth={{ user: defaultUser }}
      // Past the feed filter alert, which a topic follow would update.
      alerts={{ alerts: { ...ALERT_DEFAULTS, filter: false } }}
      log={{ logEvent }}
      settings={boxSettings}
    >
      <WhatsOffBox version={116}>
        <button type="button">Done</button>
      </WhatsOffBox>
    </TestBootProvider>
  );
  const { rerender } = render(box(settings));
  return {
    client,
    input: screen.getByRole('textbox', {
      name: "Tell us what's off about your feed",
    }),
    setSettings: (next: Partial<SettingsContextData>) => rerender(box(next)),
  };
};

const askWith = async (
  lines: WhatsOffLine[],
  {
    result = answerWith(lines),
    ...options
  }: BoxOptions & { result?: Record<string, unknown> } = {},
) => {
  mockGraphQL({ request: whatsOffRequest, result });
  const box = showBox(options);
  await userEvent.type(box.input, text);
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));
  return box;
};

const sureLine = (change: WhatsOffChange): WhatsOffLine => ({
  kind: WhatsOffLineKind.Sure,
  words: 'AI agents',
  change,
  alternatives: [],
});

const mockMutation = (query: string, variables: Record<string, unknown>) => {
  const request = { sent: false };
  mockGraphQL({
    request: { query, variables },
    result: () => {
      request.sent = true;
      return { data: { _: true } };
    },
  });
  return request;
};

beforeEach(() => {
  nock.cleanAll();
  logEvent.mockClear();
});

describe('WhatsOffBox', () => {
  it('should apply a level change with its mutation, logged under the answer', async () => {
    await askWith([
      {
        kind: WhatsOffLineKind.Sure,
        words: 'AI agents',
        change: showLessAgents,
        alternatives: [],
      },
    ]);

    expect(await screen.findByText('Show less #ai-agents')).toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.SubmitWhatsOff,
      target_type: TargetType.WhatsOff,
      target_id: answerId,
      extra: JSON.stringify({
        response: WhatsOffResponse.Act,
        scope: WhatsOffScope.Feed,
        kinds: { sure: 1 },
        gaps: [],
      }),
    });

    const demote = mockMutation(SET_FEED_TOPIC_MODE_MUTATION, {
      keyword: 'ai-agents',
      mode: FeedTopicMode.Demote,
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Apply: Show less #ai-agents' }),
    );
    expect(await screen.findByText('Applied')).toBeInTheDocument();
    expect(demote.sent).toBe(true);
    expect(
      screen.getByRole('button', { name: 'Undo: Show less #ai-agents' }),
    ).toHaveFocus();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ApplyWhatsOffChange,
      target_type: TargetType.WhatsOff,
      target_id: answerId,
      extra: JSON.stringify({
        line: 0,
        option: 0,
        kind: WhatsOffLineKind.Sure,
        op: WhatsOffOp.Topic,
        certainty: 0.9,
        locked: false,
      }),
    });
  });

  it('should label the closest change and toggle its advanced setting', async () => {
    await askWith([
      {
        kind: WhatsOffLineKind.Closest,
        words: 'pretty basic tutorials',
        gap: 'level',
        change: {
          op: WhatsOffOp.Curation,
          value: 'tutorial',
          advancedSettingId: 14,
          enabled: false,
          certainty: 0.7,
          plusOnly: false,
        },
        alternatives: [],
      },
    ]);

    expect(await screen.findByText('Closest we have')).toBeInTheDocument();
    expect(screen.getByText('Hide tutorials')).toBeInTheDocument();
    expect(
      screen.getByText("There's no setting for how advanced posts are yet."),
    ).toBeInTheDocument();

    const toggle = mockMutation(UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION, {
      settings: [{ id: 14, enabled: false }],
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Apply: Hide tutorials' }),
    );
    expect(await screen.findByText('Applied')).toBeInTheDocument();
    expect(toggle.sent).toBe(true);
  });

  it('should lock a Plus change for a free reader', async () => {
    await askWith([
      {
        kind: WhatsOffLineKind.Sure,
        words: 'old posts',
        change: {
          op: WhatsOffOp.Ranking,
          value: 'age.half_life_days',
          from: 3,
          to: 1.5,
          certainty: 0.8,
          plusOnly: true,
        },
        alternatives: [],
      },
    ]);

    expect(
      await screen.findByText('A post counts half as much after'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Apply/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get Plus' })).toBeInTheDocument();
  });

  it('should say what is not possible yet and what is already set', async () => {
    await askWith([
      {
        kind: WhatsOffLineKind.Missing,
        words: 'posts in Spanish',
        gap: 'language',
        alternatives: [],
      },
      { kind: WhatsOffLineKind.Already, words: 'no videos', alternatives: [] },
    ]);

    expect(await screen.findByText('Not possible yet')).toBeInTheDocument();
    expect(
      screen.getByText(
        "There's no setting for the language posts are in yet. We noted it.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Already set')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Apply/ }),
    ).not.toBeInTheDocument();
  });

  it('should offer the picked choice on a line it is unsure of', async () => {
    const turnOff: WhatsOffChange = {
      ...showLessAgents,
      mode: FeedTopicMode.Off,
      certainty: null,
    };
    await askWith([
      {
        kind: WhatsOffLineKind.Unsure,
        words: 'AI agents',
        change: { ...showLessAgents, certainty: 0.45 },
        alternatives: [turnOff],
      },
    ]);

    expect(await screen.findByText('Did you mean')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Turn off #ai-agents in For You' }),
    );

    expect(
      screen.getByRole('button', { name: 'Show less #ai-agents' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Turn off #ai-agents in For You' }),
    ).not.toBeInTheDocument();
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.PickWhatsOffChoice,
      target_type: TargetType.WhatsOff,
      target_id: answerId,
      extra: JSON.stringify({
        line: 0,
        option: 1,
        kind: WhatsOffLineKind.Unsure,
        op: WhatsOffOp.Topic,
        locked: false,
      }),
    });
  });

  it('should offer to try again when the answer fails, with the text back in the input', async () => {
    const { input } = await askWith([], {
      result: { errors: [{ message: 'boom' }] },
    });

    const panel = await screen.findByRole('region', { name: "What's off" });
    expect(
      await within(panel).findByText("Couldn't get an answer just now."),
    ).toBeInTheDocument();
    expect(input).toHaveValue(text);

    mockGraphQL({
      request: whatsOffRequest,
      result: answerWith([
        {
          kind: WhatsOffLineKind.Sure,
          words: 'AI agents',
          change: showLessAgents,
          alternatives: [],
        },
      ]),
    });
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Show less #ai-agents')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('should say when the daily limit is reached, with nothing to retry', async () => {
    await askWith([], {
      result: {
        errors: [{ message: 'Too many', extensions: { code: 'RATE_LIMITED' } }],
      },
    });

    const panel = await screen.findByRole('region', { name: "What's off" });
    expect(
      await within(panel).findByText(
        "You've reached today's limit. Try again tomorrow.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Try again' }),
    ).not.toBeInTheDocument();
  });

  it('should say when the text reaches its length limit', async () => {
    const { input } = showBox();
    userEvent.paste(input, 'a'.repeat(WHATS_OFF_MAX_LENGTH + 20));

    expect(input).toHaveAttribute('maxLength', String(WHATS_OFF_MAX_LENGTH));
    expect(
      screen.getByText(
        `You've reached the ${WHATS_OFF_MAX_LENGTH}-character limit.`,
      ),
    ).toBeInTheDocument();
  });

  it('should keep a level change applied, and not log the undo, when its undo fails', async () => {
    await askWith([sureLine(showLessAgents)]);
    mockMutation(SET_FEED_TOPIC_MODE_MUTATION, {
      keyword: 'ai-agents',
      mode: FeedTopicMode.Demote,
    });
    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Apply: Show less #ai-agents',
      }),
    );
    expect(await screen.findByText('Applied')).toBeInTheDocument();

    const undo = { sent: false };
    mockGraphQL({
      request: {
        query: SET_FEED_TOPIC_MODE_MUTATION,
        variables: { keyword: 'ai-agents', mode: null },
      },
      result: () => {
        undo.sent = true;
        return { errors: [{ message: 'boom' }] };
      },
    });
    const undoButton = screen.getByRole('button', {
      name: 'Undo: Show less #ai-agents',
    });
    await userEvent.click(undoButton);

    await waitFor(() => expect(undo.sent).toBe(true));
    await waitFor(() => expect(undoButton).toBeEnabled());
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(logEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.UndoWhatsOffChange,
      }),
    );
  });

  it('should undo a block on a followed topic back to the follow', async () => {
    const { client } = await askWith(
      [sureLine({ op: WhatsOffOp.Block, target: agents, plusOnly: false })],
      { feedSettings: { includeTags: ['ai-agents'], blockedTags: [] } },
    );
    const block = mockMutation(ADD_FILTERS_TO_FEED_MUTATION, {
      filters: { blockedTags: ['ai-agents'] },
    });
    await userEvent.click(
      await screen.findByRole('button', { name: 'Apply: Block #ai-agents' }),
    );
    expect(await screen.findByText('Applied')).toBeInTheDocument();
    expect(block.sent).toBe(true);

    const unblock = mockMutation(REMOVE_FILTERS_FROM_FEED_MUTATION, {
      filters: { blockedTags: ['ai-agents'] },
    });
    const follow = mockMutation(ADD_FILTERS_TO_FEED_MUTATION, {
      filters: { includeTags: ['ai-agents'] },
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Undo: Block #ai-agents' }),
    );

    expect(
      await screen.findByRole('button', { name: 'Apply: Block #ai-agents' }),
    ).toBeInTheDocument();
    expect(unblock.sent).toBe(true);
    expect(follow.sent).toBe(true);
    expect(
      client.getQueryData(getFeedSettingsQueryKey(defaultUser)),
    ).toMatchObject({
      feedSettings: { includeTags: ['ai-agents'], blockedTags: [] },
    });
  });

  it('should undo Clickbait Shield to the value it had, with the settings of the undo', async () => {
    const applyFlag = jest.fn();
    const { setSettings } = await askWith(
      [
        sureLine({
          op: WhatsOffOp.ClickbaitShield,
          enabled: false,
          plusOnly: false,
        }),
      ],
      {
        settings: {
          flags: { clickbaitShieldEnabled: true } as SettingsFlags,
          updateFlag: applyFlag,
        },
      },
    );
    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Apply: Turn off Clickbait Shield',
      }),
    );
    expect(await screen.findByText('Applied')).toBeInTheDocument();
    expect(applyFlag).toHaveBeenCalledWith(
      SidebarSettingsFlags.ClickbaitShieldEnabled,
      false,
    );

    const undoFlag = jest.fn();
    setSettings({
      flags: { clickbaitShieldEnabled: false } as SettingsFlags,
      updateFlag: undoFlag,
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Undo: Turn off Clickbait Shield' }),
    );

    await waitFor(() =>
      expect(undoFlag).toHaveBeenCalledWith(
        SidebarSettingsFlags.ClickbaitShieldEnabled,
        true,
      ),
    );
    expect(applyFlag).toHaveBeenCalledTimes(1);
  });

  it('should send a reset only once the reader confirms it', async () => {
    await askWith([
      sureLine({ op: WhatsOffOp.Reset, value: 'everything', plusOnly: false }),
    ]);
    const reset = mockMutation(RESET_FEED_PERSONALIZATION_MUTATION, {
      learned: true,
      seen: true,
      levels: true,
      ranking: true,
    });
    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Apply: Start your feed over',
      }),
    );

    expect(
      screen.getByRole('button', { name: 'Cancel: Start your feed over' }),
    ).toHaveFocus();
    expect(reset.sent).toBe(false);

    await userEvent.click(
      screen.getByRole('button', { name: 'Yes, reset: Start your feed over' }),
    );
    expect(await screen.findByText('Applied')).toBeInTheDocument();
    expect(reset.sent).toBe(true);
  });

  it('should leave out the changes this build does not know', async () => {
    const unknown = {
      op: 'boost_vibes' as WhatsOffOp,
      plusOnly: false,
    };
    await askWith([
      { ...sureLine(unknown), words: 'good vibes' },
      {
        kind: WhatsOffLineKind.Unsure,
        words: 'AI agents',
        change: showLessAgents,
        alternatives: [unknown],
      },
    ]);

    expect(await screen.findByText('Show less #ai-agents')).toBeInTheDocument();
    expect(screen.getByText('1 suggested change')).toBeInTheDocument();
    expect(screen.queryByText('“good vibes”')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Apply/ })).toHaveLength(1);
    expect(screen.queryByText('Or')).not.toBeInTheDocument();
  });

  it('should quote a line only when its words differ from the complaint', async () => {
    await askWith([
      {
        kind: WhatsOffLineKind.Sure,
        words: text,
        change: showLessAgents,
        alternatives: [],
      },
      {
        kind: WhatsOffLineKind.Missing,
        words: 'posts in Spanish',
        gap: 'language',
        change: null,
        alternatives: [],
      },
    ]);

    expect(await screen.findByText('Show less #ai-agents')).toBeInTheDocument();
    // Only the panel's header quotes the whole complaint.
    expect(screen.getAllByText(`“${text}”`)).toHaveLength(1);
    expect(screen.getByText('“posts in Spanish”')).toBeInTheDocument();
  });
});
