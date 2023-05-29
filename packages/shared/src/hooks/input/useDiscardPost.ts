import { MutableRefObject, useCallback, useRef } from 'react';
import { formToJson } from '../../lib/form';
import { EditPostProps, Post } from '../../graphql/posts';
import {
  checkSavedProperty,
  generateWritePostKey,
  WriteForm,
} from '../../components/post/freeform';
import {
  UseExitConfirmation,
  useExitConfirmation,
} from '../useExitConfirmation';
import usePersistentContext from '../usePersistentContext';

interface UseDiscardPostProps {
  post?: Post;
}

interface UseDiscardPost extends UseExitConfirmation {
  formRef: MutableRefObject<HTMLFormElement>;
}

export const useDiscardPost = ({
  post,
}: UseDiscardPostProps = {}): UseDiscardPost => {
  const formRef = useRef<HTMLFormElement>();
  const draftKey = generateWritePostKey();
  const [draft] = usePersistentContext<WriteForm>(draftKey);
  const onValidateAction = useCallback(() => {
    const form = formToJson<EditPostProps>(formRef.current);
    const isTitleSaved = checkSavedProperty('title', form, draft, post);
    const isContentSaved = checkSavedProperty('content', form, draft, post);
    return isTitleSaved && isContentSaved;
  }, [post, draft, formRef]);

  const { onAskConfirmation } = useExitConfirmation({ onValidateAction });

  return { onAskConfirmation, formRef };
};
