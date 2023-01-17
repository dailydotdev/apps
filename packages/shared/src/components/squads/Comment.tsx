import React, { ReactElement, useContext, useState } from 'react';
import { Modal } from '../modals/common/Modal';
import { Button } from '../buttons/Button';
import { ProfilePicture } from '../ProfilePicture';
import { Justify } from '../utilities';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import AuthContext from '../../contexts/AuthContext';
import OpenLinkIcon from '../icons/OpenLink';
import { SquadForm } from '../../graphql/squads';

export function SquadComment({
  onSubmit,
  form,
}: {
  onSubmit: (e) => void;
  form: Partial<SquadForm>;
}): ReactElement {
  const { post } = form.post;
  const { user } = useContext(AuthContext);
  const [commentary, setCommentary] = useState(form.commentary);

  return (
    <>
      <Modal.Body className="flex flex-col">
        <form
          onSubmit={onSubmit}
          className="flex flex-1 gap-4"
          id="squad-comment"
        >
          <ProfilePicture user={user} />
          <textarea
            placeholder="Share your thought and insights about the article…"
            className="flex-1 self-stretch w-full min-w-0 focus:placeholder-transparent bg-transparent focus:outline-none resize-none typo-body caret-theme-label-link text-theme-label-primary"
            value={commentary}
            onChange={(event) => setCommentary(event.target.value)}
          />
        </form>
        <div className="flex gap-4 items-center py-2 px-4 w-full rounded-12 border border-theme-divider-tertiary">
          <p className="flex-1 line-clamp-3 multi-truncate text-theme-label-secondary typo-caption1">
            {post.title}
          </p>
          <Image
            src={post.image}
            className="object-cover w-16 laptop:w-24 h-16 rounded-16"
            loading="lazy"
            fallbackSrc="https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1"
          />
          <a href={post.permalink} target="_blank">
            <OpenLinkIcon />
          </a>
        </div>
      </Modal.Body>
      <Modal.Footer justify={Justify.Between}>
        <div className="flex">
          <Image
            className="mr-3 h-8 rounded-full"
            src={form.file ?? cloudinary.squads.imageFallback}
          />
          <div>
            <h5 className="font-bold typo-caption1">{form.name}</h5>
            <h6 className="typo-caption1 text-theme-label-tertiary">
              @{form.handle}
            </h6>
          </div>
        </div>
        <Button
          form="squad-comment"
          className="btn-primary-cabbage"
          type="submit"
          disabled={!commentary}
        >
          Done
        </Button>
      </Modal.Footer>
    </>
  );
}
