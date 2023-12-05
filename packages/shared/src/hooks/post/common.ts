import { CommentMarkdownInputProps } from '../../components/fields/MarkdownInput/CommentMarkdownInput';

export interface CommentWriteProps {
  commentId: string;
  parentCommentId?: string;
  lastUpdatedAt?: string;
}

export interface CommentWrite {
  inputProps: Partial<CommentMarkdownInputProps>;
}
