export const threadCommentBoxClassName = {
  container:
    'rounded-none border-0 bg-transparent px-0 pb-0 pt-0 hover:bg-transparent',
  content: 'ml-[52px] mt-1',
  markdown:
    '!text-[0.9375rem] [&_a]:!text-[0.9375rem] [&_li]:!text-[0.9375rem] [&_li]:!leading-[1.55] [&_p]:!text-[0.9375rem] [&_p]:!leading-[1.55]',
};

export interface CommentClassName {
  container?: string;
  commentBox?: {
    container?: string;
  };
}
