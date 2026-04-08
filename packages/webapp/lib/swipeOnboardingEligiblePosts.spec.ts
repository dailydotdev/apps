import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import { PostType } from '@dailydotdev/shared/src/types';
import {
  isSwipeOnboardingEligiblePost,
  isSwipeOnboardingRelaxedEligiblePost,
} from './swipeOnboardingEligiblePosts';

function post(
  type: PostType,
  sourceType: SourceType,
): Pick<Post, 'type' | 'source'> {
  return {
    type,
    source: {
      id: 's',
      type: sourceType,
    } as Post['source'],
  };
}

describe('isSwipeOnboardingEligiblePost', () => {
  it('accepts article, video, and poll from machine sources', () => {
    expect(isSwipeOnboardingEligiblePost(post(PostType.Article, SourceType.Machine)))
      .toBe(true);
    expect(
      isSwipeOnboardingEligiblePost(post(PostType.VideoYouTube, SourceType.Machine)),
    ).toBe(true);
    expect(isSwipeOnboardingEligiblePost(post(PostType.Poll, SourceType.Machine))).toBe(
      true,
    );
  });

  it('rejects non-machine sources', () => {
    expect(isSwipeOnboardingEligiblePost(post(PostType.Article, SourceType.Squad))).toBe(
      false,
    );
    expect(isSwipeOnboardingEligiblePost(post(PostType.Article, SourceType.User))).toBe(
      false,
    );
  });

  it('rejects collection, share, freeform, and social posts even from machine', () => {
    expect(
      isSwipeOnboardingEligiblePost(post(PostType.Collection, SourceType.Machine)),
    ).toBe(false);
    expect(isSwipeOnboardingEligiblePost(post(PostType.Share, SourceType.Machine))).toBe(
      false,
    );
    expect(
      isSwipeOnboardingEligiblePost(post(PostType.Freeform, SourceType.Machine)),
    ).toBe(false);
    expect(
      isSwipeOnboardingEligiblePost(post(PostType.SocialTwitter, SourceType.Machine)),
    ).toBe(false);
  });

  it('rejects when source is missing', () => {
    expect(
      isSwipeOnboardingEligiblePost({
        type: PostType.Article,
        source: undefined,
      }),
    ).toBe(false);
  });
});

describe('isSwipeOnboardingRelaxedEligiblePost', () => {
  it('accepts article types from any source', () => {
    expect(
      isSwipeOnboardingRelaxedEligiblePost(
        post(PostType.Article, SourceType.Squad),
      ),
    ).toBe(true);
    expect(
      isSwipeOnboardingRelaxedEligiblePost(
        post(PostType.Article, SourceType.User),
      ),
    ).toBe(true);
  });

  it('rejects types outside onboarding feed set', () => {
    expect(
      isSwipeOnboardingRelaxedEligiblePost(
        post(PostType.Share, SourceType.Machine),
      ),
    ).toBe(false);
  });
});
