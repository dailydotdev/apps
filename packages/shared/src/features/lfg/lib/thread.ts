import type { DmMessage } from '../../messages/types';
import { DmMessageStatus } from '../../messages/types';
import type { LfgConversationReachOut } from '../graphql';

// A reach-out accepted into a chat the two already had never became its
// request message, so its pitch joins the thread as the sender's message,
// before the first message sent after it.
export const addLfgPitches = ({
  messages,
  reachOuts,
  requestMessage,
  peerId,
}: {
  messages: DmMessage[];
  reachOuts: LfgConversationReachOut[];
  requestMessage: string | null | undefined;
  peerId: string;
}): DmMessage[] =>
  reachOuts
    .filter(({ pitch }) => pitch !== requestMessage)
    .reduce((thread, { id, pitch, createdAt, sender }) => {
      const sentAt = Date.parse(createdAt);
      const index = thread.findIndex(
        (message) => Date.parse(message.createdAt) > sentAt,
      );
      const message: DmMessage = {
        id: `lfg-${id}`,
        peerId,
        senderId: sender.id,
        body: pitch,
        createdAt,
        status: DmMessageStatus.Sent,
      };

      return index === -1
        ? [...thread, message]
        : [...thread.slice(0, index), message, ...thread.slice(index)];
    }, messages);
