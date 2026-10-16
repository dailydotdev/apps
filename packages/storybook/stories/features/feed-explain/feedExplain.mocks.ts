import { fullPost } from '../../history/posts';
import type { ExplainedPost, ViewerProfile } from './components/feedExplain';
import { explainPost } from './components/feedExplain';

/**
 * A viewer a few days in: three topics picked at sign-up, two more inferred
 * from what they opened, and one source followed. The posts are real ones
 * from the /history story, so every title, source and tag is what the API
 * returned.
 */
export const newViewer: ViewerProfile = {
  pickedTags: ['webdev', 'react', 'ai'],
  readingTags: ['rust', 'docker'],
  followedSources: ['fireship'],
};

const explain = (ids: string[]): ExplainedPost[] =>
  ids.map((id) => explainPost(fullPost(id), newViewer));

export const forYouFeed = explain([
  '3wLIGsLJr',
  'Hd2eBXFkz',
  'XCmmeq8ZC',
  'BM2onQaux',
  'VNv8IMYss',
  'oBDUfGZ7N',
  'j4duNN9S2',
  'RFRxDV6yP',
  'DVZBShH7e',
  'DFJTpz2Tw',
  'IGmufOLb8',
  'AzxnBHN3V',
  '9tLNItvh5',
  'CrehqCUVO',
  '8YmexVcM0',
  'PFMO5JfPF',
]);

/** What a refresh can bring in, best ranked first. */
export const reserveFeed = explain([
  'BjYAz50EA',
  '4I7VllOCg',
  'Rvo54Shm1',
  '7p9nRlTLf',
  'hsSp9jc9T',
  'Lfny6jDqe',
  'jvlaswdix',
  '8eOv3hbFq',
  'B2K4Imgfa',
  'tbbNjYj52',
]);

const byId = new Map(
  [...forYouFeed, ...reserveFeed].map((item) => [item.post.id, item]),
);

export const feedItem = (id: string): ExplainedPost => {
  const item = byId.get(id);
  if (!item) {
    throw new Error(`No feed item ${id}`);
  }
  return item;
};
