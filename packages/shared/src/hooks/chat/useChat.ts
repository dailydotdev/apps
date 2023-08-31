import { UseChat, UseChatProps } from './types';
import { useChatSession } from './useChatSession';
import { useChatStream } from './useChatStream';

export const useChat = ({ id: idFromProps }: UseChatProps): UseChat => {
  const stream = useChatStream();
  const id = idFromProps || stream.id;
  const session = useChatSession({
    id,
    streamId: stream.id,
  });

  const isStreaming = !!(
    session?.data?.chunks?.[0]?.createdAt &&
    !session?.data?.chunks?.[0]?.completedAt
  );

  return {
    queryKey: session.queryKey,
    isLoading: isStreaming || session.isLoading,
    data: session.data,
    handleSubmit: stream.handleSubmit,
  };
};
