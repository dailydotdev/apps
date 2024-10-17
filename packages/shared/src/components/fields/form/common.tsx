export enum WriteFormTab {
  Share = 'Share a link',
  NewPost = 'New post',
}

export const WriteFormTabToFormID = {
  [WriteFormTab.Share]: 'write-post-link',
  [WriteFormTab.NewPost]: 'write-post-freeform',
};
