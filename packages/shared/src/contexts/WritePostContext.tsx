import React, {
  FormEvent,
  MutableRefObject,
  PropsWithChildren,
  ReactElement,
  useContext,
} from 'react';
import { useRouter } from 'next/router';
import { Post } from '../graphql/posts';
import { Squad } from '../graphql/sources';
import ConditionalWrapper from '../components/ConditionalWrapper';
import { useViewSize, ViewSize } from '../hooks';
import { FormWrapper } from '../components/fields/form';

export interface WriteForm {
  title: string;
  content: string;
  image: string;
  filename?: string;
}

export interface WritePostProps {
  onSubmitForm: (
    e: FormEvent<HTMLFormElement>,
    prop: WriteForm,
  ) => Promise<Post>;
  isPosting: boolean;
  squad: Squad;
  post?: Post;
  enableUpload: boolean;
  formRef?: MutableRefObject<HTMLFormElement>;
  draft?: Partial<WriteForm>;
  updateDraft?: (props: Partial<WriteForm>) => Promise<void>;
  isUpdatingDraft?: boolean;
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
});

export const useWritePostContext = (): WritePostProps =>
  useContext(WritePostContext);

export const WritePostContextProvider = ({
  children,
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
            form="write-post"
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
