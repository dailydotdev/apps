import type {
  FormEvent,
  MutableRefObject,
  PropsWithChildren,
  ReactElement,
} from 'react';
import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import type {
  CreatePostPollProps,
  CreatePostProps,
  Post,
  SharedPost,
} from '../graphql/posts';
import type { Squad } from '../graphql/sources';
import ConditionalWrapper from '../components/ConditionalWrapper';
import { FormWrapper } from '../components/fields/form';
import type { SourcePostModeration } from '../graphql/squads';
import { useViewSize, ViewSize } from '../hooks/useViewSize';
import type { UseSchedulePost } from '../components/post/schedule/useSchedulePost';
import { SchedulePostControl } from '../components/post/schedule/SchedulePostControl';

export interface WriteForm {
  title: string;
  content: string;
  image?: string;
  filename?: string;
  options?: string[];
  duration?: number;
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
    prop: WriteForm &
      Omit<CreatePostProps | CreatePostPollProps, 'id'> & {
        sharedPostId?: string;
        commentary?: string;
      },
    type: Post['type'],
  ) => void;
  isPosting: boolean;
  squad: Squad | null;
  post?: Post;
  moderated?: SourcePostModeration;
  fetchedPost?: MergedWriteObject;
  enableUpload: boolean;
  formRef?: MutableRefObject<HTMLFormElement>;
  draft?: Partial<WriteForm>;
  updateDraft?: (props: Partial<WriteForm>) => Promise<void>;
  isUpdatingDraft?: boolean;
  formId?: string;
  // When provided, the schedule control is offered next to the submit button.
  schedule?: UseSchedulePost;
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

interface WritePostContextProviderProps extends WritePostProps {
  rightCopy?: string;
}

export const WritePostContextProvider = ({
  children,
  formId,
  rightCopy,
  ...props
}: PropsWithChildren<WritePostContextProviderProps>): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const router = useRouter();

  return (
    <WritePostContext.Provider value={props}>
      <ConditionalWrapper
        condition={!isLaptop}
        wrapper={(component) => (
          <FormWrapper
            className={{ container: 'w-full', header: 'border-b-0' }}
            copy={{ right: rightCopy ?? 'Post' }}
            rightButtonProps={{ disabled: props.isPosting }}
            leftButtonProps={{ onClick: () => router.back() }}
            headerActions={
              props.schedule ? (
                <SchedulePostControl
                  schedule={props.schedule}
                  disabled={props.isPosting}
                />
              ) : undefined
            }
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
