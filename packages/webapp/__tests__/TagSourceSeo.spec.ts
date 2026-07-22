import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { KEYWORD_QUERY } from '@dailydotdev/shared/src/graphql/keywords';
import {
  SOURCE_QUERY,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { getStaticProps as getTagStaticProps } from '../pages/tags/[tag]';
import { getStaticProps as getSourceStaticProps } from '../pages/sources/[source]';

jest.mock('@dailydotdev/shared/src/graphql/common', () => {
  const actual = jest.requireActual('@dailydotdev/shared/src/graphql/common');

  return { ...actual, gqlClient: { request: jest.fn() } };
});

const request = gqlClient.request as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

// Share links are only worth promoting if the unfurl names the entity, so lock
// the per-entity title/description that `next-seo` turns into og:title and
// og:description (it falls back to `description` when `openGraph.description`
// is unset). og:url/canonical come from `_app`'s DefaultSeo, per route.
describe('tag page SEO', () => {
  it('describes the specific tag', async () => {
    request.mockImplementation((query) => {
      if (query === KEYWORD_QUERY) {
        return Promise.resolve({
          keyword: {
            value: 'webdev',
            flags: {
              title: 'Web Development',
              description: 'Everything about building for the web.',
            },
          },
        });
      }

      return Promise.reject(new Error('not mocked'));
    });

    const result = await getTagStaticProps({ params: { tag: 'webdev' } });

    expect('props' in result && result.props.seo).toMatchObject({
      title: 'Web Development posts | daily.dev',
      description: 'Everything about building for the web.',
      openGraph: { title: 'Web Development posts | daily.dev' },
    });
  });

  it('falls back to a generated description when the tag has none', async () => {
    request.mockImplementation((query) => {
      if (query === KEYWORD_QUERY) {
        return Promise.resolve({ keyword: { value: 'webdev', flags: {} } });
      }

      return Promise.reject(new Error('not mocked'));
    });

    const result = await getTagStaticProps({ params: { tag: 'webdev' } });

    expect('props' in result && result.props.seo?.description).toEqual(
      'Find all the recent posts, videos, updates and discussions about webdev',
    );
  });
});

describe('source page SEO', () => {
  const source = {
    id: 'tds',
    name: 'Towards Data Science',
    handle: 'tds',
    permalink: 'https://app.daily.dev/sources/tds',
    image: 'https://media.daily.dev/tds',
    type: SourceType.Machine,
    public: true,
    description: 'Sharing concepts, ideas and codes.',
  };

  it('describes the specific source', async () => {
    request.mockImplementation((query) => {
      if (query === SOURCE_QUERY) {
        return Promise.resolve({ source });
      }

      return Promise.reject(new Error('not mocked'));
    });

    const result = await getSourceStaticProps({ params: { source: 'tds' } });

    expect('props' in result && result.props.seo).toMatchObject({
      title: 'Towards Data Science posts | daily.dev',
      description: 'Sharing concepts, ideas and codes.',
      openGraph: { title: 'Towards Data Science posts | daily.dev' },
    });
  });

  it('keeps the generic description when the source has none', async () => {
    request.mockImplementation((query) => {
      if (query === SOURCE_QUERY) {
        return Promise.resolve({ source: { ...source, description: null } });
      }

      return Promise.reject(new Error('not mocked'));
    });

    const result = await getSourceStaticProps({ params: { source: 'tds' } });

    expect('props' in result && result.props.seo?.description).toContain(
      'daily.dev is the easiest way',
    );
  });
});
