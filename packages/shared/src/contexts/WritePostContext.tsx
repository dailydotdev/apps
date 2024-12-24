import type {
  FormEvent,
  MutableRefObject,
  PropsWithChildren,
  ReactElement,
} from 'react';
import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import type { EditPostProps, Post, SharedPost } from '../graphql/posts';
import type { Squad } from '../graphql/sources';
import ConditionalWrapper from '../components/ConditionalWrapper';
import { useViewSize, ViewSize } from '../hooks';
import { FormWrapper } from '../components/fields/form';
import type { SourcePostModeration } from '../graphql/squads';

export interface WriteForm {
  title: string;
  content: string;
  image: string;
  filename?: string;
}

export interface MergedWriteObject
  extends Partial<Pick<WriteForm, 'title' | 'content' | 'image'>> {
  id?: string;
  type?: string;
  sharedPost?: SharedPost;
}

export interface WritePostProps {
  onSubmitForm: (
    e: FormEvent<HTMLFormElement>,
    prop: WriteForm & Omit<EditPostProps, 'id'>,
  ) => void;
  isPosting: boolean;
  squad: Squad;
  post?: Post;
  moderated?: SourcePostModeration;
  fetchedPost?: MergedWriteObject;
  enableUpload: boolean;
  formRef?: MutableRefObject<HTMLFormElement>;
  draft?: Partial<WriteForm>;
  updateDraft?: (props: Partial<WriteForm>) => Promise<void>;
  isUpdatingDraft?: boolean;
  formId?: string;
}

export const WritePostContext = React.createContext<WritePostProps>({
  onSubmitForm: null,
  isPosting: false,
  squad: null,
  post: null,
  enableUpload: false,
  formRef: null,
  draft: {},
  updateDraft: null,
  formId: null,
});

export const useWritePostContext = (): WritePostProps =>
  useContext(WritePostContext);

export const WritePostContextProvider = ({
  children,
  formId,
  ...props
}: PropsWithChildren<WritePostProps>): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const router = useRouter();

  return (
    <WritePostContext.Provider value={props}>
      <ConditionalWrapper
        condition={!isLaptop}
        wrapper={(component) => (
          <FormWrapper
            className={{ container: 'w-full', header: 'border-b-0' }}
            copy={{ right: 'Post' }}
            rightButtonProps={{ disabled: props.isPosting }}
            leftButtonProps={{ onClick: () => router.back() }}
            form={formId}
          >
            {component}
          </FormWrapper>
        )}
      >
        {children}
      </ConditionalWrapper>
    </WritePostContext.Provider>
  );
};
