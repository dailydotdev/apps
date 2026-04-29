import { mockGraphQL } from '../../__tests__/helpers/graphql';
import {
  ClientQuestEventType,
  TRACK_QUEST_EVENT_MUTATION,
  trackQuestClientEvent,
} from './quests';

beforeEach(() => {
  jest.clearAllMocks();
});

it('should send trackQuestEvent mutation', async () => {
  let queryCalled = false;

  mockGraphQL({
    request: {
      query: TRACK_QUEST_EVENT_MUTATION,
      variables: {
        eventType: ClientQuestEventType.VisitExplorePage,
      },
    },
    result: () => {
      queryCalled = true;

      return {
        data: {
          trackQuestEvent: {
            _: true,
          },
        },
      };
    },
  });

  await trackQuestClientEvent(ClientQuestEventType.VisitExplorePage);

  expect(queryCalled).toBe(true);
});
