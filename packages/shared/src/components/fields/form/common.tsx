export enum WriteFormTab {
  Share = 'Share a link',
  NewPost = 'New post',
  Poll = 'Poll',
}

export const WriteFormTabToFormID = {
  [WriteFormTab.Share]: 'write-post-link',
  [WriteFormTab.NewPost]: 'write-post-freeform',
  [WriteFormTab.Poll]: 'write-post-poll',
};
