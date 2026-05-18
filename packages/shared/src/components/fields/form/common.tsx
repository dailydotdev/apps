export enum WriteFormTab {
  NewPost = 'New post',
  Share = 'Share a link',
  Poll = 'Poll',
  Standup = 'Standup',
}

export const CREATE_LIVE_ROOM_FORM_ID = 'create-live-room-form';

export const WriteFormTabToFormID = {
  [WriteFormTab.Share]: 'write-post-link',
  [WriteFormTab.NewPost]: 'write-post-freeform',
  [WriteFormTab.Poll]: 'write-post-poll',
  [WriteFormTab.Standup]: CREATE_LIVE_ROOM_FORM_ID,
};
