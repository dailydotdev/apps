import { useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { generateStorageKey, StorageTopic } from '../lib/storage';

const POPUP_SELECTOR_KEY = [generateStorageKey(StorageTopic.Popup, 'selector')];

type AppendFn = () => HTMLElement;

export interface PopupData {
  parentSelector: AppendFn;
}

interface UsePopupSelector extends PopupData {
  onAppendTooltipTo: (fn: AppendFn) => void;
}

interface UsePopupSelectorProps {
  parentSelector?: AppendFn;
}

export const usePopupSelector = ({
  parentSelector: propSelector,
}: UsePopupSelectorProps = {}): UsePopupSelector => {
  const client = useQueryClient();
  const { parentSelector } =
    client.getQueryData<PopupData>(POPUP_SELECTOR_KEY) ?? {};

  useEffect(() => {
    return () => {
      client.setQueryData(POPUP_SELECTOR_KEY, () => ({
        parentSelector: null,
      }));
    };
  }, [client]);

  return {
    parentSelector: useMemo(
      () => parentSelector ?? propSelector,
      [parentSelector, propSelector],
    ),
    onAppendTooltipTo: useCallback(
      (fn) =>
        client.setQueryData(POPUP_SELECTOR_KEY, () => ({
          parentSelector: fn,
        })),
      [client],
    ),
  };
};
