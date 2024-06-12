import { ReferralCampaignKey } from './referral';
import {
  AddLinkShareLogQueryParams,
  ShareProvider,
  addLogQueryParams,
  getShareLink,
} from './share';

describe('getShareLink tests', () => {
  const link = 'https://foo.bar';
  const text = 'hello world';
  it('should return WhatsApp share link', () => {
    const result = getShareLink({
      provider: ShareProvider.WhatsApp,
      link,
      text,
    });
    expect(result).toEqual(`https://wa.me/?text=${encodeURIComponent(link)}`);
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
      `https://reddit.com/submit?url=${encodeURIComponent(link)}&title=${text}`,
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
      `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`,
    );
  });

  it('should return Email share link', () => {
    const result = getShareLink({
      provider: ShareProvider.Email,
      link,
      text,
    });
    expect(result).toEqual(
      `mailto:?subject=${text}&body=${encodeURIComponent(link)}`,
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
