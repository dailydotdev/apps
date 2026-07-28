import { ReferralCampaignKey } from './referral';
import type { AddLinkShareLogQueryParams } from './share';
import { ShareProvider, addLogQueryParams, getShareLink } from './share';

describe('getShareLink tests', () => {
  const link = 'https://foo.bar';
  const text = 'hello world';
  it('should return WhatsApp share link', () => {
    const result = getShareLink({
      provider: ShareProvider.WhatsApp,
      link,
      text,
    });
    expect(result).toEqual(
      `https://wa.me/?text=${encodeURIComponent(`${text}\n${link}`)}`,
    );
  });

  it('should return Twitter share link', () => {
    const result = getShareLink({
      provider: ShareProvider.Twitter,
      link,
      text,
    });
    expect(result).toEqual(
      `http://twitter.com/share?url=${encodeURIComponent(
        link,
      )}&text=${encodeURIComponent(`${text} via @dailydotdev`)}`,
    );
  });

  it('should return Facebook share link', () => {
    const result = getShareLink({
      provider: ShareProvider.Facebook,
      link,
    });
    expect(result).toEqual(
      `https://www.facebook.com/sharer/sharer.php?display=page&u=${encodeURIComponent(
        link,
      )}`,
    );
  });

  it('should return Reddit share link', () => {
    const result = getShareLink({
      provider: ShareProvider.Reddit,
      link,
      text,
    });
    expect(result).toEqual(
      `https://reddit.com/submit?url=${encodeURIComponent(
        link,
      )}&title=${encodeURIComponent(text)}`,
    );
  });

  it('should return LinkedIn share link', () => {
    const result = getShareLink({
      provider: ShareProvider.LinkedIn,
      link,
    });
    expect(result).toEqual(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        link,
      )}`,
    );
  });

  it('should return Telegram share link', () => {
    const result = getShareLink({
      provider: ShareProvider.Telegram,
      link,
      text,
    });
    expect(result).toEqual(
      `https://t.me/share/url?url=${encodeURIComponent(
        link,
      )}&text=${encodeURIComponent(text)}`,
    );
  });

  it('should return Email share link', () => {
    const result = getShareLink({
      provider: ShareProvider.Email,
      link,
      text,
    });
    expect(result).toEqual(
      `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(
        link,
      )}`,
    );
  });

  it('should return Email share link with summary in body', () => {
    const summary = 'A short summary';
    const result = getShareLink({
      provider: ShareProvider.Email,
      link,
      text,
      emailSummary: summary,
    });
    expect(result).toEqual(
      `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(
        `${summary}\n\n${link}`,
      )}`,
    );
  });

  // Post titles routinely carry `&`, `#` and `?`, which silently truncate or
  // corrupt the shared text when interpolated raw.
  const unsafeText = 'Rust & Go: what #1 teams ask? 100% real';

  it('should encode Reddit titles containing URL characters', () => {
    const result = getShareLink({
      provider: ShareProvider.Reddit,
      link,
      text: unsafeText,
    });
    expect(result).toEqual(
      `https://reddit.com/submit?url=${encodeURIComponent(
        link,
      )}&title=${encodeURIComponent(unsafeText)}`,
    );
    expect(new URL(result).searchParams.get('title')).toEqual(unsafeText);
  });

  it('should encode Telegram text containing URL characters', () => {
    const result = getShareLink({
      provider: ShareProvider.Telegram,
      link,
      text: unsafeText,
    });
    expect(new URL(result).searchParams.get('text')).toEqual(unsafeText);
  });

  it('should carry the text into the WhatsApp message', () => {
    const result = getShareLink({
      provider: ShareProvider.WhatsApp,
      link,
      text: unsafeText,
    });
    expect(new URL(result).searchParams.get('text')).toEqual(
      `${unsafeText}\n${link}`,
    );
  });
});

describe('addLogQueryParams tests', () => {
  const link = 'https://foo.bar';
  const userId = '42';
  const cid = ReferralCampaignKey.SharePost;

  const runTest = (
    params: AddLinkShareLogQueryParams,
    expected: string | undefined,
  ) => {
    const result = addLogQueryParams(params);
    expect(result).toEqual(expected);
  };
  it('should return link as is if not provided', () => {
    runTest({ link: undefined, userId, cid }, undefined);
  });

  it('should return link as is if userId not provided', () => {
    runTest({ link, userId: null, cid }, link);
  });

  it('should add userId and cid query params', () => {
    runTest(
      { link, userId, cid },
      `https://foo.bar/?userid=${userId}&cid=${cid}`,
    );
  });

  it('should replace userId and cid query params', () => {
    runTest(
      { link: 'https://foo.bar/?userid=123&cid=share_comment', userId, cid },
      `https://foo.bar/?userid=${userId}&cid=${cid}`,
    );
  });
});
