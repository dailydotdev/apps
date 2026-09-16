import {
  getSearchContentCurationFromUrl,
  getSearchContentCurationQueryParam,
  getSearchPostTypesFromUrl,
  getSearchPostTypesQueryParam,
} from './search';
import { PostType } from '../types';

it('round-trips search post types through URL slugs', () => {
  expect(getSearchPostTypesFromUrl('video,article,unknown')).toEqual([
    PostType.VideoYouTube,
    PostType.Article,
  ]);
  expect(
    getSearchPostTypesQueryParam([
      PostType.VideoYouTube,
      PostType.Article,
      PostType.VideoYouTube,
    ]),
  ).toEqual({ type: 'video,article' });
});

it('round-trips content curation filters through the URL', () => {
  expect(getSearchContentCurationFromUrl('news,release')).toEqual([
    'news',
    'release',
  ]);
  expect(
    getSearchContentCurationQueryParam(['news', 'release', 'news']),
  ).toEqual({ contentCuration: 'news,release' });
});
