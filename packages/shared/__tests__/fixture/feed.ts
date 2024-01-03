import { Connection } from '../../src/graphql/common';
import { Post, PostType } from '../../src/graphql/posts';

const feed: Connection<Post> = {
  pageInfo: {
    hasNextPage: true,
    endCursor: 'c2NvcmU6MjY0OTM5NzQ=',
  },
  edges: [
    {
      node: {
        id: '4f354bb73009e4adfa5dbcbf9b3c4ebf',
        title: 'Eminem Quotes Generator - Simple PHP RESTful API',
        createdAt: '2020-05-16T15:40:15.000Z',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/870995e312adb17439eee1f9c353c7e0',
        placeholder:
          'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAUH/8QAIRAAAgICAgEFAAAAAAAAAAAAAQMCEQASBAUxEyFRUpH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABoRAQACAwEAAAAAAAAAAAAAAAEAAgMR8CH/2gAMAwEAAhEDEQA/ANgZ2TUuetnJbGcWt0uEiFgk1f2vwPjLfXTcev425Zv6Ub2u7oecbyUrm1xmuEjLSyYg3R9vzHYFKIvsjxYks7e4n//Z',
        readTime: 0,
        source: {
          id: 'echojs',
          handle: 'echojs',
          permalink: 'permalink/echojs',
          name: 'Echo JS',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/echojs',
        },
        tags: ['javascript'],
        permalink: 'http://localhost:4000/r/hfX3FEcvaXhI',
        numComments: 1,
        numUpvotes: 5,
        commentsPermalink:
          'http://localhost:5002/posts/4f354bb73009e4adfa5dbcbf9b3c4ebf',
        read: true,
        upvoted: false,
        commented: true,
        type: PostType.Article,
      },
    },
    {
      node: {
        id: '618ca73c969187a24b29205216eec3bd',
        title: 'One Word Domains — Database of all available one-word domains',
        createdAt: '2020-05-16T15:38:58.000Z',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/cef1d75d7e7ebc5ee63ba705d71df430',
        placeholder:
          'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAFAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMH/8QAGxAAAgMAAwAAAAAAAAAAAAAAAAECAxESUrH/xAAUAQEAAAAAAAAAAAAAAAAAAAAD/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AxaNkVDi6a5Ps930kAMJ//9k=',
        readTime: 3,
        source: {
          id: 'ph',
          handle: 'ph',
          permalink: 'permalink/ph',
          name: 'Product Hunt',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/ph',
        },
        permalink: 'http://localhost:4000/r/4y6Eml1weg4O',
        numComments: 24,
        numUpvotes: 1,
        commentsPermalink:
          'http://localhost:5002/posts/618ca73c969187a24b29205216eec3bd',
        read: false,
        upvoted: true,
        commented: true,
        bookmarked: true,
        type: PostType.Article,
      },
    },
    {
      node: {
        id: '0e4005b2d3cf191f8c44c2718a457a1e',
        title: 'Learn SQL & MongoDb Simultaneously The Easy Way (Part 1)',
        createdAt: '2020-05-16T15:16:05.000Z',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
        placeholder:
          'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAEAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAHBAAAgICAwAAAAAAAAAAAAAAAQIAAwQhERJx/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABURAQEAAAAAAAAAAAAAAAAAAAAB/9oADAMBAAIRAxEAPwDGsKlTiWvywI6nXsn21qbXO9sYiIP/2Q==',
        readTime: 8,
        source: {
          id: 'tds',
          handle: 'tds',
          permalink: 'permalink/tds',
          name: 'Towards Data Science',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
        },
        permalink: 'http://localhost:4000/r/9CuRpr5NiEY5',
        numComments: 15,
        numUpvotes: 1,
        commentsPermalink:
          'http://localhost:5002/posts/0e4005b2d3cf191f8c44c2718a457a1e',
        read: false,
        upvoted: true,
        commented: true,
        type: PostType.Article,
      },
    },
    {
      node: {
        id: '89125087805bf16ab691b78a11bda62a',
        title:
          'This Week in Apps: Houseparty battles Messenger, Telegram drops crypto plans, Instagram Lite is gone',
        createdAt: '2020-05-16T15:10:19.000Z',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/f169085bf74a921e15db4b7d045915c0',
        placeholder:
          'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAFAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAT/xAAeEAACAgAHAAAAAAAAAAAAAAAAAQIDBAURFBUxUf/EABQBAQAAAAAAAAAAAAAAAAAAAAf/xAAdEQACAQQDAAAAAAAAAAAAAAABAgMABEHBEiEi/9oADAMBAAIRAxEAPwCurObttbJxTkmknr0T85iPEAJUUKcn6zoUavbxEL5xs1//2Q==',
        readTime: 2,
        source: {
          id: 'tc',
          handle: 'tc',
          permalink: 'permalink/tc',
          name: 'TechCrunch',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tc',
        },
        permalink: 'http://localhost:4000/r/KswVsSMeTGkS',
        numComments: 5,
        numUpvotes: 1,
        commentsPermalink:
          'http://localhost:5002/posts/89125087805bf16ab691b78a11bda62a',
        read: false,
        upvoted: true,
        commented: true,
        type: PostType.Article,
      },
    },
    {
      node: {
        id: 'e57c471faa6513b2e8428af604aba359',
        title: 'Star night',
        createdAt: '2020-05-16T14:23:10.000Z',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/7',
        placeholder:
          'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAABAUGB//EACYQAAIABAQGAwAAAAAAAAAAAAECAAMEBRESE0IGByExQVFScZH/xAAVAQEBAAAAAAAAAAAAAAAAAAABA//EABURAQEAAAAAAAAAAAAAAAAAAAAR/9oADAMBAAIRAxEAPwCgPMKtsdvWjpamiGsuCBVZzn3NmOAB+wYUni23kkz71OM09XObd5jBKufNagklprk4jux9QBqP82/YpQ//2Q==',
        readTime: null,
        source: {
          id: 'codepen',
          handle: 'codepen',
          permalink: 'permalink/codepen',
          name: 'CodePen',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/codepen',
        },
        permalink: 'http://localhost:4000/r/p9n4bNeH0JV',
        numComments: 1,
        numUpvotes: 1,
        commentsPermalink:
          'http://localhost:5002/posts/e57c471faa6513b2e8428af604aba359',
        read: false,
        upvoted: true,
        commented: true,
        type: PostType.Article,
      },
    },
    {
      node: {
        id: '7abecb1aee5063f4d7a852f8bf18dce9',
        title: 'How to change the Samsung Keyboard to Gboard',
        createdAt: '2020-05-16T14:18:17.000Z',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/7bd48c25940a571c7f7af6089795fac3',
        placeholder:
          'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUI/8QAHhAAAgICAgMAAAAAAAAAAAAAAgQBAwARBRIhUmH/xAAUAQEAAAAAAAAAAAAAAAAAAAAB/8QAFhEBAQEAAAAAAAAAAAAAAAAAABEh/9oADAMBAAIRAxEAPwDN/DuqoPps8giD6oF3NYikYsj1mYyWzYFjFp1BNVZFMiG99Y34jfzGMbkD/9k=',
        readTime: null,
        source: {
          id: 'andpol',
          handle: 'andpol',
          permalink: 'permalink/andpol',
          name: 'Android Police',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/andpol',
        },
        permalink: 'http://localhost:4000/r/-B6CB5PsDWvE',
        numComments: 3,
        numUpvotes: 1,
        commentsPermalink:
          'http://localhost:5002/posts/7abecb1aee5063f4d7a852f8bf18dce9',
        read: false,
        upvoted: true,
        commented: true,
        type: PostType.Article,
      },
    },
    {
      node: {
        id: '038579e39c6773a877e34a1bc9f24f6d',
        title: '3D Artists Talk About Inspiration and Influence',
        createdAt: '2020-05-16T14:14:10.000Z',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/d75d711e343e44ac6e177daa4a532d06',
        placeholder:
          'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAFAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAHxAAAgICAQUAAAAAAAAAAAAAAQIAAwQSESEjMVGR/8QAFAEBAAAAAAAAAAAAAAAAAAAABP/EABgRAAIDAAAAAAAAAAAAAAAAAAABAxEh/9oADAMBAAIRAxEAPwDJXuqtzb0sx1fVdlZmLH11J8yQcjgntp8iIePVbEy46R//2Q==',
        readTime: 7,
        source: {
          id: '80lv',
          handle: '80lv',
          permalink: 'permalink/80lv',
          name: '80 LEVEL',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/78eebcd76c154e6bbfd565fed7dc4093',
        },
        permalink: 'http://localhost:4000/r/GJq3MyGG8OJa',
        numComments: 1,
        numUpvotes: 0,
        commentsPermalink:
          'http://localhost:5002/posts/038579e39c6773a877e34a1bc9f24f6d',
        read: false,
        upvoted: false,
        commented: true,
        type: PostType.Article,
      },
    },
  ],
};

export default feed;
