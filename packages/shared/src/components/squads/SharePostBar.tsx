import React, { FormEvent, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { ProfilePicture } from '../ProfilePicture';
import { Button, ButtonSize } from '../buttons/Button';
import { useAuthContext } from '../../contexts/AuthContext';
import useSidebarRendered from '../../hooks/useSidebarRendered';

interface SharePostBarProps {
  className?: string;
  onNewSquadPost?: () => void;
}

function SharePostBar({
  className,
  onNewSquadPost,
}: SharePostBarProps): ReactElement {
  const { user } = useAuthContext();
  const { sidebarRendered } = useSidebarRendered();
  const [url, setUrl] = useState('');
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form
      onSubmit={onSubmit}
      className={classNames(
        'flex flex-wrap items-center rounded-16 typo-callout border overflow-hidden',
        'bg-theme-float focus-within:border-theme-divider-primary border-theme-divider-tertiary hover:border-theme-divider-primary',
        className,
      )}
    >
      <ProfilePicture
        className="m-3"
        user={user}
        size="large"
        nativeLazyLoading
      />
      <input
        type="url"
        name="share-post-bar"
        className="flex-1 pl-1 outline-none bg-theme-bg-transparent text-theme-label-primary focus:placeholder-theme-label-quaternary hover:placeholder-theme-label-primary typo-callout"
        placeholder="Enter link to share"
        onInput={(e) => setUrl(e.currentTarget.value)}
        value={url}
      />
      {(!url || !sidebarRendered) && (
        <Button
          onClick={onNewSquadPost}
          buttonSize={sidebarRendered ? ButtonSize.Small : ButtonSize.Medium}
          className={classNames(
            'btn-tertiary',
            !sidebarRendered &&
              'w-full order-4 border-t !rounded-none border-theme-divider-tertiary',
          )}
        >
          Reading history
        </Button>
      )}
      <Button
        type="submit"
        buttonSize={ButtonSize.Medium}
        className="mx-3 btn-primary"
      >
        Post
      </Button>
    </form>
  );
}

export default SharePostBar;
