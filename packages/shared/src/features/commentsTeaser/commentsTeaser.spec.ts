import { getCommentsTeaserTitle } from './commentsTeaser';

describe('getCommentsTeaserTitle', () => {
  it('should invite the reader when the post has no comments', () => {
    expect(getCommentsTeaserTitle(0)).toEqual('Join the conversation');
    expect(getCommentsTeaserTitle(undefined)).toEqual('Join the conversation');
  });

  it('should say "See all the comments", with no count, once there is one', () => {
    expect(getCommentsTeaserTitle(1)).toEqual('See all the comments');
    expect(getCommentsTeaserTitle(1214)).toEqual('See all the comments');
  });
});
