import { Post } from '../../src/graphql/posts';

import comment from './comment';
import { author } from './loggedUser';

const post: Post = {
  id: 'e3fd75b62cadd02073a31ee3444975cc',
  title: 'The Prosecutor’s Fallacy',
  permalink: 'https://api.daily.dev/r/e3fd75b62cadd02073a31ee3444975cc',
  createdAt: '2018-06-13T01:20:42.000Z',
  source: {
    id: 'tds',
    name: 'Towards Data Science',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
  },
  readTime: 8,
  image:
    'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa',
  placeholder:
    'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAOAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABwQF/8QAJRAAAQMCBQQDAAAAAAAAAAAAAQIDBBEhAAUSIjEGFEGBExZR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwb/xAAeEQABAwQDAAAAAAAAAAAAAAACAQMRAAQFYSHw8f/aAAwDAQACEQMRAD8AvyKMIOdTJzSURmESVBsPrUXAAq6iQQNHu9L/ALhSiZpIdiMuFDJK0JUSkilx43cYCvt8eT2rMxD6GVDelltPsC4qK+OMaLHUoDDfasuiPpHxha06gmlq7eaYn8hhyuyQphe7pQvH3VUnY1x7X//Z',
  commentsPermalink: 'https://daily.dev',
  author,
  featuredComments: [comment],
  tags: ['webdev', 'javascript'],
};

export default post;
