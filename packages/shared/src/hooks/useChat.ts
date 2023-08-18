import { MouseEvent, useCallback, useRef, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
  getSearchSession,
  initializeSearchSession,
  Search,
  SearchChunk,
  SearchChunkError,
  SearchChunkSource,
  updateSearchData,
} from '../graphql/search';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useAuthContext } from '../contexts/AuthContext';

interface UseChatProps {
  id?: string;
}

enum UseChatMessageType {
  SessionCreated = 'session_created',
  WebSearchFinished = 'web_search_finished',
  WebResultsFiltered = 'web_results_filtered',
  StatusUpdated = 'status_updated',
  NewTokenReceived = 'new_token_received',
  Completed = 'completed',
  Error = 'error',
  SessionFound = 'session_found',
}

interface SourcesMessage {
  sources: SearchChunkSource[];
}

interface UseChatMessage<Payload = unknown> {
  type: UseChatMessageType;
  status?: string;
  timestamp: number;
  payload: Payload;
}

interface UseChat {
  data: Search;
  isLoading: boolean;
  handleSubmit(event: MouseEvent, value: string): void;
}

interface CreatePayload {
  id: string;
  steps: number;
}

interface TokenPayload {
  token: string;
}

export const useChat = ({ id: idFromProps }: UseChatProps): UseChat => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const [prompt, setPrompt] = useState<string | undefined>();
  const id = idFromProps ?? 'new';
  const endStreamRef = useRef<() => void>();
  const idQueryKey = generateQueryKey(RequestKey.Search, user, id);
  const { data: search, isLoading: isLoadingSession } = useQuery(
    idQueryKey,
    () => getSearchSession(idFromProps),
    { enabled: !!idFromProps },
  );

  const setSearchQuery = useCallback(
    (chunk: Partial<SearchChunk>) => {
      client.setQueryData<Search>(idQueryKey, (previous) =>
        updateSearchData(previous, chunk),
      );
    },
    [client, idQueryKey],
  );

  const onMessage = useCallback(
    (event: { data: string }) => {
      try {
        const data: UseChatMessage = JSON.parse(event.data);

        console.log(data);

        switch (data.type) {
          case UseChatMessageType.SessionCreated:
            client.setQueryData(
              idQueryKey,
              initializeSearchSession({
                ...(data.payload as CreatePayload),
                createdAt: new Date(),
                status: data.status,
                prompt,
              }),
            );
            break;
          case UseChatMessageType.WebSearchFinished:
            setSearchQuery({
              sources: (data.payload as SourcesMessage).sources,
              status: data.status,
            });
            break;
          case UseChatMessageType.WebResultsFiltered:
            setSearchQuery({ status: data.status });
            break;
          case UseChatMessageType.StatusUpdated:
            setSearchQuery({ status: data.status });
            break;
          case UseChatMessageType.NewTokenReceived:
            setSearchQuery({ response: (data.payload as TokenPayload).token });
            break;
          case UseChatMessageType.Completed: {
            setSearchQuery({ completedAt: new Date(), status: data.status });
            setPrompt(undefined);
            break;
          }
          case UseChatMessageType.Error:
            setSearchQuery({ error: data.payload as SearchChunkError });
            break;
          case UseChatMessageType.SessionFound:
            client.setQueryData(idQueryKey, () => data.payload as Search);
            break;
          default:
            break;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[EventSource][message] error', error);
      }
    },
    [client, prompt, idQueryKey, setSearchQuery],
  );

  const executePrompt = useCallback(
    (value: string) => {
      if (!value) {
        return;
      }

      if (endStreamRef.current) {
        endStreamRef.current();
      }

      setSearchQuery(undefined);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      endStreamRef.current = mockChatStream({ onMessage });
    },
    [setSearchQuery, onMessage],
  );

  return {
    isLoading:
      isLoadingSession ||
      (search?.chunks?.[0]?.createdAt && !search?.chunks?.[0]?.completedAt),
    data: search,
    handleSubmit: useCallback(
      (_, value: string) => {
        executePrompt(value);
      },
      [executePrompt],
    ),
  };
};

// TODO WT-1554-stream-rendering remove all the mocks
const carStoryMarkdownTest = `# Automatopia: The Autozens' Tale

Once upon a time in the bustling city of Automatopia, cars ruled the streets and highways.
These weren't ordinary cars; they were alive, each with its own unique personality and capabilities.
They were called "Autozens."

In Automatopia, the Autozens lived peacefully alongside humans, who cared for and respected them like family members.
The city thrived on the harmony between the two, with each car having a special bond with its owner.

Among them was Zoomer, a sleek, silver sports car, who loved nothing more than the rush of the wind on the open road.
Zoomer was owned by Alex, a passionate and adventurous young driver.
Together, they explored every corner of Automatopia, embarking on thrilling journeys, and even participating in races to test their speed.

~~~javascript
const a = 1;

a += 1

for (let i=0; i += 1; i < 10) {
  console.log(a + i)
}
~~~

### Recap
Among them was [Zoomer](https://arrow.fandom.com/wiki/Hunter_Zolomon), a sleek, **silver sports car, who** loved nothing more than the rush of the wind on the open road.
Zoomer was owned by Alex, a passionate and adventurous young driver.
Together, they explored every corner of Automatopia, embarking on thrilling journeys, and even participating in races to test their speed.

~~~html
<!DOCTYPE html>
<html>
  <head>
    <title>Markdown Example</title>
  </head>
  <body>
    <h1>Hello, Markdown!</h1>
  </body>
</html>
~~~

## Result

Markdown is a powerful and versatile tool for creating well-formatted documents.
With its straightforward syntax and broad compatibility, Markdown is widely used across various platforms and applications.
Start using Markdown today and enhance your documentation experience!

### The city

~~~javascript
const a = 1;

a += 1

for (let i=0; i += 1; i < 10) {
  console.log(a + i)
}
~~~

Across \`const c = 'inline'\` the city lived Betty, a cheerful minivan that belonged to the Morrison family. Betty had a warm heart, and she was always ready to take the children to school, soccer practice, or family outings. The Morrisons loved Betty dearly, and she cherished every moment spent with them, creating beautiful memories along the way.

However, not all cars were content in Automatopia. Rusty, an old and forgotten car, felt neglected and envious of the attention others received. He resided in a forgotten corner of the city, dreaming of being loved and appreciated like the other Autozens.

One day, a city-wide competition called "The Great Rally" was announced, promising fame and fortune to the winner. The race would be a test of skills, speed, and intelligence, bringing excitement to every car in Automatopia. Zoomer and Betty were thrilled to participate, excited to showcase their abilities to their loved ones.

### Rusty

When **Rusty** heard about the race, he saw an opportunity to prove his worth. Determined to change his destiny, he decided to join the competition as well, despite his old age and doubts. Rusty spent days in the garage, working hard to regain his former glory.

The day of the Great Rally finally arrived. The city's streets were filled with cheering crowds, excited to witness the thrilling race. Zoomer and Betty lined up with other cars, exuding confidence and enthusiasm. Meanwhile, Rusty stood nervously at the starting line, unsure of what the race would hold for him.

As the race began, Zoomer and Betty showcased their exceptional skills, leaving behind a trail of awe-struck spectators. They raced neck to neck, pushing themselves to their limits. The crowd marveled at their speed and precision.

~~~javascript
const a = 1;

a += 1

for (let i=0; i += 1; i < 10) {
  console.log(a + i)
}
~~~

Rusty, on the other hand, struggled initially, but he refused to give up. He remembered the joy and pride he saw in the eyes of others and found the strength to carry on. Slowly, he gained confidence, pushing forward with determination, surprising everyone with his perseverance.

As the race continued, Zoomer and Betty found themselves side by side, both reluctant to overtake the other. They valued their friendship more than victory, so they decided to cross the finish line together, sharing the glory and celebrating their bond.

However, the true surprise came from Rusty. With an unexpected burst of energy, he overtook the others and crossed the finish line first. The crowd erupted in cheers, celebrating his triumphant comeback. Rusty couldn't believe it—his dream of being appreciated had come true.

In the end, the Great Rally taught everyone a valuable lesson: it's not just about speed and victory, but about the love, companionship, and determination that made the Autozens special. From that day on, Rusty was no longer overlooked; he became a respected and cherished member of the Automatopia community.

~~~javascript
const a = 1;

a += 1

for (let i=0; i += 1; i < 10) {
  console.log(a + i)
}
~~~

#### Some rust

~~~rust
fn main() {
  // Statements here are executed when the compiled binary is called.

  // Print text to the console.
  println!("Hello World!");
}
~~~

## The end

And so, in the city of Automatopia, the cars continued to live harmoniously with their human companions, cherishing the bonds they shared and forever embracing the spirit of adventure and unity.`;

const queue = [
  {
    type: 'Type of the new event',
    status: 'Current status of the process (optional)',
    timestamp: 'Generation time of the event',
    payload: 'Generic container extact object depends on the event type',
  },
  {
    type: 'session_created',
    status: 'Generating search query...',
    payload: {
      id: 'new session id (can be used to update the page url)',
      steps: 'how many steps the process has',
    },
  },
  {
    type: 'web_search_finished',
    status: 'Narrowing down search results...',
    payload: {
      sources: [],
    },
  },
  {
    type: 'web_results_filtered',
    status: 'Scraping web pages...',
    payload: {
      ids: [],
    },
  },
];

const createStream = (content, chunkSize = 50) => {
  let cursor = 0;
  const stream = [];

  while (cursor <= content.length) {
    const chunk = content.slice(cursor, cursor + chunkSize);
    stream.push({
      type: 'new_token_received',
      payload: {
        token: chunk,
      },
    });
    cursor += chunkSize;
  }

  return stream;
};

const sampleSource = {
  id: 'source id 1',
  title: 'Understanding the LLaMa model and paper- mercurylabs.io',
  snippet: `When sampling the LLaMA model, it is important to note that LLaMA, unlike\n
    popular models like ChatGPT, was not optimized or fine-tuned for some more\n
    text that will get cut off automatically`,
  url: '#',
};

const mockChatStream = ({
  onMessage,
}: {
  onMessage: (event: { data: string }) => void;
}): (() => void) => {
  let mounted = true;

  const mockStream = async () => {
    const contentStream = createStream(carStoryMarkdownTest).reverse();
    const myQueue = [...queue].reverse();
    const stream = [
      {
        type: 'completed',
      },
      {
        type: 'web_search_finished',
        status: 'Narrowing down search results',
        payload: {
          sources: [
            sampleSource,
            { ...sampleSource, id: 'source id 2' },
            { ...sampleSource, id: 'source id 3' },
            { ...sampleSource, id: 'source id 4' },
            { ...sampleSource, id: 'source id 5' },
          ],
        },
      },
      ...contentStream,
      ...myQueue,
    ];

    while (stream.length) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 40));

      if (!mounted) {
        break;
      }

      onMessage({
        data: JSON.stringify(stream.pop()),
      });
    }
  };

  mockStream();

  return () => {
    mounted = false;
  };
};
