import React from 'react';
import nock from 'nock';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import { feedV2SupportedTypes } from '../../../graphql/feed';
import { UPDATE_ADVANCED_SETTINGS_FILTERS_MUTATION } from '../../../graphql/feedSettings';
import { getFeedSettingsQueryKey } from '../../../hooks/useFeedSettings';
import { LogEvent, TargetType } from '../../../lib/log';
import { SET_FEED_TOPIC_MODE_MUTATION, WHATS_OFF_QUERY } from '../graphql';
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

const showLessAgents: WhatsOffChange = {
  op: WhatsOffOp.Topic,
  target: {
    type: WhatsOffTargetType.Keyword,
    id: 'ai-agents',
    name: 'ai-agents',
  },
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

const showBox = () => {
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
    feedSettings: { advancedSettings: [] },
  });
  render(
    <TestBootProvider
      client={client}
      auth={{ user: defaultUser }}
      log={{ logEvent }}
    >
      <WhatsOffBox version={116}>
        <button type="button">Done</button>
      </WhatsOffBox>
    </TestBootProvider>,
  );
  return screen.getByRole('textbox', {
    name: "Tell us what's off about your feed",
  });
};

const askWith = async (
  lines: WhatsOffLine[],
  result: Record<string, unknown> = answerWith(lines),
) => {
  mockGraphQL({ request: whatsOffRequest, result });
  const input = showBox();
  await userEvent.type(input, text);
  await userEvent.click(screen.getByRole('button', { name: 'Send' }));
  return input;
};

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
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(await screen.findByText('Applied')).toBeInTheDocument();
    expect(demote.sent).toBe(true);
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
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
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
      screen.queryByRole('button', { name: 'Apply' }),
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
      screen.queryByRole('button', { name: 'Apply' }),
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
    const input = await askWith([], { errors: [{ message: 'boom' }] });

    expect(
      await screen.findByText("Couldn't get an answer just now."),
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
      errors: [{ message: 'Too many', extensions: { code: 'RATE_LIMITED' } }],
    });

    expect(
      await screen.findByText(
        "You've reached today's limit. Try again tomorrow.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Try again' }),
    ).not.toBeInTheDocument();
  });

  it('should say when the text reaches its length limit', async () => {
    const input = showBox();
    userEvent.paste(input, 'a'.repeat(WHATS_OFF_MAX_LENGTH + 20));

    expect(input).toHaveAttribute('maxLength', String(WHATS_OFF_MAX_LENGTH));
    expect(
      screen.getByText(
        `You've reached the ${WHATS_OFF_MAX_LENGTH}-character limit.`,
      ),
    ).toBeInTheDocument();
  });

  it('should keep a level change applied when its undo fails', async () => {
    await askWith([
      {
        kind: WhatsOffLineKind.Sure,
        words: 'AI agents',
        change: showLessAgents,
        alternatives: [],
      },
    ]);
    mockMutation(SET_FEED_TOPIC_MODE_MUTATION, {
      keyword: 'ai-agents',
      mode: FeedTopicMode.Demote,
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Apply' }));
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
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));

    await waitFor(() => expect(undo.sent).toBe(true));
    expect(await screen.findByText('Applied')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });
});
