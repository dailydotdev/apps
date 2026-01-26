export enum WriteFormTab {
  NewPost = 'New post',
  Share = 'Share a link',
  Poll = 'Poll',
}

export const WriteFormTabToFormID = {
  [WriteFormTab.Share]: 'write-post-link',
  [WriteFormTab.NewPost]: 'write-post-freeform',
  [WriteFormTab.Poll]: 'write-post-poll',
};
