import { MutableRefObject, useCallback, useRef } from 'react';
import { del as deleteCache } from 'idb-keyval';
import { formToJson } from '../../lib/form';
import { EditPostProps, Post } from '../../graphql/posts';
import {
  checkSavedProperty,
  generateWritePostKey,
  WriteForm,
  WriteFreeformContentProps,
} from '../../components/post/freeform';
import {
  UseExitConfirmation,
  useExitConfirmation,
} from '../useExitConfirmation';
import usePersistentContext from '../usePersistentContext';

interface UseDiscardPostProps {
  post?: Post;
  draftIdentifier?: string;
}

interface UseDiscardPost
  extends UseExitConfirmation,
    Pick<WriteFreeformContentProps, 'draft' | 'updateDraft'> {
  formRef: MutableRefObject<HTMLFormElement>;
  isDraftReady: boolean;
  clearDraft: () => void;
}

export const useDiscardPost = ({
  post,
  draftIdentifier,
}: UseDiscardPostProps = {}): UseDiscardPost => {
  const formRef = useRef<HTMLFormElement>();
  const draftKey = generateWritePostKey(draftIdentifier ?? post?.id);
  const [draft, updateDraft, isDraftReady] = usePersistentContext<
    Partial<WriteForm>
  >(draftKey, {});
  const onValidateAction = useCallback(() => {
    const form = formToJson<EditPostProps>(formRef.current);
    const isTitleSaved = checkSavedProperty('title', form, draft, post);
    const isContentSaved = checkSavedProperty('content', form, draft, post);
    return isTitleSaved && isContentSaved;
  }, [post, draft]);

  const { onAskConfirmation } = useExitConfirmation({ onValidateAction });

  const clearDraft = useCallback(async () => {
    await deleteCache(draftKey);
  }, [draftKey]);

  return {
    onAskConfirmation,
    draft,
    updateDraft,
    isDraftReady,
    formRef,
    clearDraft,
  };
};
