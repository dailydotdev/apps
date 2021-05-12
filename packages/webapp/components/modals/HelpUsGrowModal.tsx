import React, { ReactElement, useContext, useState } from 'react';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import {
  StyledModal,
  ModalProps,
} from '@dailydotdev/shared/src/components/modals/StyledModal';
import { ModalCloseButton } from '@dailydotdev/shared/src/components/modals/ModalCloseButton';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';
import CopyIcon from '@dailydotdev/shared/icons/copy.svg';
import TwitterIcon from '@dailydotdev/shared/icons/twitter.svg';
import { useQuery } from 'react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import fetchTimeout from '@dailydotdev/shared/src/lib/fetchTimeout';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';

function getTweet(link: string): string {
  const text =
    'Daily makes it extremely easy to stay updated with the latest dev news.\n' +
    'It’s a 100% open-source browser extension, free (forever), and doesn’t even require a signup. A must-have tool for every busy developer. @dailydotdev\n';
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text,
  )}&url=${encodeURIComponent(link)}`;
}

export default function HelpUsGrowModal(props: ModalProps): ReactElement {
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
      style={{ content: { flexDirection: 'row', maxWidth: 'max-content' } }}
    >
      <ModalCloseButton onClick={props.onRequestClose} />
      <div className="flex flex-col p-8" style={{ maxWidth: '21rem' }}>
        <h2 className="typo-title2 font-bold">Enjoying daily.dev?</h2>
        <p className="mt-1 mb-4 typo-callout text-theme-label-secondary">
          Share your 💌 for daily.dev with your developer friends and help us
          grow.
        </p>
        <TextField
          className="my-4"
          inputId="referral-link"
          label="Your link"
          compact
          readOnly
          value={referralLink}
        />
        <Button className="btn-primary" icon={<CopyIcon />} onClick={copy}>
          {copying ? 'Copied!' : 'Copy link'}
        </Button>
        <div className="typo-callout text-theme-label-quaternary text-center my-4">
          or share via
        </div>
        <Button
          className="btn-primary-twitter text-white self-center"
          tag="a"
          href={getTweet(referralLink)}
          rel="noopener"
          target="_blank"
          icon={<TwitterIcon />}
        >
          Twitter
        </Button>
      </div>
      <div className="hidden laptop:block" style={{ width: '18.5rem' }}>
        <img
          className="w-full h-full object-cover"
          src={data.cover}
          alt="Help us grow cover"
        />
      </div>
    </StyledModal>
  );
}
