import { useEffect, useRef } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import {
  ClientQuestEventType,
  trackQuestClientEvent,
} from '../graphql/quests';

interface UseTrackQuestClientEventProps {
  eventType: ClientQuestEventType;
  enabled?: boolean;
  eventKey?: string;
}

export const useTrackQuestClientEvent = ({
  eventType,
  enabled = true,
  eventKey,
}: UseTrackQuestClientEventProps): void => {
  const { user } = useAuthContext();
  const trackedEventKeysRef = useRef(new Set<string>());
  const key = eventKey ?? eventType;

  useEffect(() => {
    if (!user?.id || !enabled || trackedEventKeysRef.current.has(key)) {
      return;
    }

    trackedEventKeysRef.current.add(key);

    trackQuestClientEvent(eventType).catch(() => {
      trackedEventKeysRef.current.delete(key);
    });
  }, [enabled, eventType, key, user?.id]);
};
