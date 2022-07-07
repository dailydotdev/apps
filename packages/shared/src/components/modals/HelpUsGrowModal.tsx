import React, { ReactElement, useContext, useState } from 'react';
import { useQuery } from 'react-query';
import classNames from 'classnames';
import { Button } from '../buttons/Button';
import { StyledModal, ModalProps } from './StyledModal';
import { ModalCloseButton } from './ModalCloseButton';
import { TextField } from '../fields/TextField';
import CopyIcon from '../icons/Copy';
import TwitterIcon from '../icons/Twitter';
import AuthContext from '../../contexts/AuthContext';
import fetchTimeout from '../../lib/fetchTimeout';
import { apiUrl } from '../../lib/config';
import styles from './HelpUsGrowModal.module.css';

function getTweet(link: string): string {
  const text =
    'I rarely share products on Twitter, but @dailydotdev truly deserves it. It’s a free site that gathers all developer news in one place. I love it as it makes it extremely easy to stay updated on the latest tech news.';
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text,
  )}&url=${encodeURIComponent(link)}`;
}

export default function HelpUsGrowModal({
  className,
  ...props
}: ModalProps): ReactElement {
  const { user, tokenRefreshed } = useContext(AuthContext);
  const { data } = useQuery<unknown, unknown, { link: string; cover: string }>(
    ['referralLink', user?.id],
    async () => {
      const res = await fetchTimeout(`${apiUrl}/v1/referrals/link`, 3000, {
        credentials: 'same-origin',
      });
      return res.json();
    },
    {
      enabled: tokenRefreshed,
    },
  );
  const [copying, setCopying] = useState(false);

  if (!data) {
    return <></>;
  }

  const referralLink = data.link;
  const copy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopying(true);
    setTimeout(() => {
      setCopying(false);
    }, 1000);
  };

  return (
    <StyledModal
      {...props}
      className={classNames(className, styles.helpUsGrowModal)}
    >
      <ModalCloseButton onClick={props.onRequestClose} />
      <div className={styles.image}>
        <picture className="object-cover w-full h-full">
          <source
            media="(min-width: 1020px)"
            srcSet="https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1625662066/webapp/desktop_monthly_prize"
          />
          <img
            src="https://daily-now-res.cloudinary.com/image/upload/f_auto,q_auto/v1625662066/webapp/mobile_monthly_prize"
            alt="Help us grow cover"
          />
        </picture>
      </div>
      <div className="flex flex-col laptop:flex-1 p-8">
        <h2 className="font-bold typo-title2">Refer a friend 🎁</h2>
        <p className="mt-1 typo-callout text-theme-label-secondary">
          Once a month, we are giving an epic prize to one of our ambassadors.
          Are you in?
        </p>
        <a
          href="https://daily.dev/monthly-prize"
          target="_blank"
          rel="noopener"
          className="mt-3 mb-6 font-bold underline text-theme-label-link typo-callout"
        >
          More details
        </a>
        <TextField
          className="mb-4"
          inputId="referral-link"
          label="Your link"
          compact
          readOnly
          value={referralLink}
        />
        <Button
          className={copying ? 'btn-primary-avocado' : 'btn-primary'}
          icon={<CopyIcon />}
          onClick={copy}
        >
          {copying ? 'Copied!' : 'Copy link'}
        </Button>
        <div className="hidden laptop:block my-4 text-center typo-callout text-theme-label-quaternary">
          or share via
        </div>
        <Button
          className="self-center text-white btn-primary-twitter"
          displayClass="hidden laptop:flex"
          tag="a"
          href={getTweet(referralLink)}
          rel="noopener"
          target="_blank"
          icon={<TwitterIcon secondary />}
        >
          Twitter
        </Button>
      </div>
    </StyledModal>
  );
}
