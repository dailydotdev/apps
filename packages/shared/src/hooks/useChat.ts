import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useCallback,
} from 'react';

type UseChatProps = {
  id?: string;
};

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

type UseChatMessage<Payload = unknown> = {
  type: UseChatMessageType;
  status?: string;
  timestamp: number;
  payload: Payload;
};

type UseChat = {
  messages: string[];
  error?: Error & {
    code: string;
  };
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  handleSubmit: () => void;
  isLoading: boolean;
  status: string;
};

const defaultState = {
  status: '',
  error: undefined,
  isLoading: false,
};

export const useChat = ({ id: idFromProps }: UseChatProps): UseChat => {
  const [messages, setMessages] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | undefined>(idFromProps);
  const [input, setInput] = useState('');
  const [state, setState] = useState<
    Pick<UseChat, 'status' | 'error' | 'isLoading'>
  >(() => ({ ...defaultState }));
  // //  WT-1554-stream-rendering save to useQuery
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const id = sessionId || idFromProps;

  useEffect(() => {
    if (!prompt) {
      return undefined;
    }

    const url = new URL('/search/query', process.env.NEXT_PUBLIC_MAGNI_URL);
    url.searchParams.set(
      'token',
      'TODO', //  WT-1554-stream-rendering set JWT
    );
    url.searchParams.set('prompt', prompt);

    const eventSource = new EventSource(url.toString());

    setState({ ...defaultState });
    setMessages([]); // for now we always clear messages on new promp because we only support single one

    const onMessage = (event: { data: string }) => {
      try {
        const data: UseChatMessage = JSON.parse(event.data);

        switch (data.type) {
          case UseChatMessageType.SessionCreated: {
            const { id: newSessionId } = data.payload as { id: string };
            setSessionId(newSessionId as string);
            setState((current) => ({
              ...current,
              isLoading: true,
            }));

            break;
          }
          case UseChatMessageType.WebSearchFinished:
          case UseChatMessageType.WebResultsFiltered:
          case UseChatMessageType.StatusUpdated: {
            setState((current) => ({
              ...current,
              status: data.status,
            }));

            break;
          }
          case UseChatMessageType.NewTokenReceived: {
            const { token } = data.payload as { token: string };

            setMessages((current) => [(current[0] || '') + token]);
            break;
          }
          case UseChatMessageType.Completed: {
            setState((current) => ({
              ...current,
              isLoading: false,
            }));
            setPrompt(undefined);

            break;
          }
          case UseChatMessageType.Error: {
            setState((current) => ({
              ...current,
              error: data.payload as UseChat['error'],
            }));

            break;
          }
          case UseChatMessageType.SessionFound: {
            // TODO WT-1554-stream-rendering redirect to session page

            break;
          }
          default:
            break;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[EventSource][message] error', error);
      }
    };

    const onError = (event) => {
      const error = new Error(event.message || 'unknown error');

      // eslint-disable-next-line no-console
      console.error('[EventSource] error', error);
    };

    eventSource.addEventListener('message', onMessage);
    eventSource.addEventListener('error', onError);

    return () => {
      eventSource.removeEventListener('message', onMessage);
      eventSource.removeEventListener('error', onError);
      eventSource.close();
    };
  }, [prompt]);

  return {
    ...state,
    messages,
    input,
    setInput,
    handleSubmit: useCallback(() => {
      setPrompt(input);
    }, [input]),
  };
};
