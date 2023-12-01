import { CommentMarkdownInputProps } from '../../components/fields/MarkdownInput/CommentMarkdownInput';

export interface CommentWriteProps {
  commentId: string;
  parentCommentId?: string;
}

export interface CommentWrite {
  inputProps: Partial<CommentMarkdownInputProps>;
}
