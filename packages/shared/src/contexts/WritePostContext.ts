import React, { FormEvent, MutableRefObject, useContext } from 'react';
import { Post } from '../graphql/posts';
import { Squad } from '../graphql/sources';

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
