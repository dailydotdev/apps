import type { CommentMarkdownInputProps } from '../../components/fields/MarkdownInput/CommentMarkdownInput';

export interface CommentWriteProps {
  commentId: string;
  parentCommentId?: string | null;
  lastUpdatedAt?: string;
}

export interface CommentWrite {
  inputProps: Partial<CommentMarkdownInputProps> | null;
}
