import React, {
  FormEvent,
  FormEventHandler,
  KeyboardEvent,
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { Modal } from '../modals/common/Modal';
import { Button } from '../buttons/Button';
import { ProfilePicture } from '../ProfilePicture';
import { Justify } from '../utilities';
import { Image } from '../image/Image';
import { cloudinary } from '../../lib/image';
import AuthContext from '../../contexts/AuthContext';
import { SquadForm } from '../../graphql/squads';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { TextField } from '../fields/TextField';
import LinkIcon from '../icons/Link';
import { ExternalLink, Post } from '../../graphql/posts';
import useDebounce from '../../hooks/useDebounce';
import { isValidHttpUrl } from '../../lib/links';
import { KeyboardCommand } from '../../lib/element';
import PostPreview from '../post/PostPreview';
import { Loader } from '../Loader';
import { usePostToSquad } from '../../hooks/squads/usePostToSquad';

export type SubmitSharePostFunc = (
  e: React.FormEvent<HTMLFormElement>,
  commentary?: string,
) => Promise<Post | void>;

interface SquadCommentProps {
  onSubmit: SubmitSharePostFunc;
  form: Partial<SquadForm>;
  isLoading?: boolean;
  onUpdateForm?: (form: Partial<SquadForm>) => void;
}

enum LinkError {
  Required = 'Please enter URL!',
  Invalid = 'URL is invalid!',
}

const DEFAULT_ERROR = 'An error occurred, please try again';

export function SquadComment({
  onSubmit,
  form,
  isLoading,
  onUpdateForm,
}: SquadCommentProps): ReactElement {
  const textinput = useRef<HTMLTextAreaElement>();
  const { externalLink, post: postItem } = form;
  const { post } = postItem;
  const { user } = useContext(AuthContext);
  const [commentary, setCommentary] = useState(form.commentary);
  const [link, setLink] = useState(externalLink?.url);
  const [linkHint, setLinkHint] = useState(externalLink?.url);
  const { getPost, isLoadingPreview, isCheckingPost } = usePostToSquad({
    previewDefaultErrorMessage: DEFAULT_ERROR,
    previewCallback: {
      onSuccess: (preview, url) => {
        onUpdateForm({ externalLink: { url, ...preview } });
        textinput?.current?.focus();
      },
      onError: (_, url) => onUpdateForm({ externalLink: { url } }),
    },
    postCallback: {
      onSuccess: (postByUrl) => {
        if (!postByUrl) return;

        onUpdateForm({ post: { post: postByUrl } });
        textinput?.current?.focus();
      },
      onError: () => onUpdateForm({ post: { post: null } }),
    },
  });

  const [checkUrl] = useDebounce((url: string) => {
    if (!isValidHttpUrl(url) || url === form.externalLink?.url) return null;

    return getPost(url);
  }, 1000);

  const onInputChange: FormEventHandler<HTMLInputElement> = (e) => {
    const text = e.currentTarget.value;
    setLink(text);
    checkUrl(text);
    if (!text) return setLinkHint(LinkError.Required);

    if (isValidHttpUrl(text)) {
      if (linkHint) setLinkHint('');
      return null;
    }

    if (!linkHint || linkHint === LinkError.Required)
      return setLinkHint(LinkError.Invalid);

    return null;
  };

  useEffect(() => {
    if (post) {
      textinput?.current?.focus?.();
    }
  }, []);

  const onSubmitForm = (e?: FormEvent<HTMLFormElement>) =>
    onSubmit(e, commentary);

  const handleKeydown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const pressedSpecialkey = e.ctrlKey || e.metaKey;

    if (
      pressedSpecialkey &&
      e.key === KeyboardCommand.Enter &&
      commentary?.length
    ) {
      onSubmitForm(null);
    }
  };

  const preview: ExternalLink = (() => {
    if (post) {
      return { url: post.permalink, title: post.title, image: post.image };
    }

    if (externalLink?.title && externalLink?.image) {
      return externalLink;
    }

    return null;
  })();

  const isPreviewLoading = isLoadingPreview || isCheckingPost;
  const isInvalidPost = !form?.post?.post && !form?.externalLink?.title;

  return (
    <>
      <Modal.Body
        className={classNames('flex flex-col', externalLink && !post && 'pb-2')}
      >
        <form
          onSubmit={(e) => onSubmitForm(e)}
          className="flex flex-col flex-1"
          id="squad-comment"
        >
          <span className="flex flex-row flex-1 gap-4">
            <ProfilePicture user={user} />
            <textarea
              placeholder="Share your thought and insights about the post…"
              className="flex-1 self-stretch w-full min-w-0 focus:placeholder-transparent bg-transparent focus:outline-none resize-none typo-body caret-theme-label-link text-theme-label-primary"
              value={commentary}
              onKeyDown={handleKeydown}
              onChange={(event) => setCommentary(event.target.value)}
              ref={textinput}
            />
          </span>
          <PostPreview
            className="mb-4"
            preview={preview}
            isLoading={isPreviewLoading}
          />
          {externalLink && !post && (
            <TextField
              leftIcon={isPreviewLoading ? <Loader /> : <LinkIcon />}
              label="Enter link to share"
              fieldType="tertiary"
              inputId="url"
              name="url"
              type="url"
              autoComplete="off"
              required
              value={link}
              onInput={onInputChange}
              hint={linkHint}
              saveHintSpace
              disabled={isLoading}
            />
          )}
        </form>
      </Modal.Body>
      <Modal.Footer justify={Justify.Between}>
        <div className="flex">
          <Image
            className="object-cover mr-3 w-8 h-8 rounded-full"
            src={form.file ?? cloudinary.squads.imageFallback}
          />
          <div>
            <h5 className="font-bold typo-caption1">{form.name}</h5>
            <h6 className="typo-caption1 text-theme-label-tertiary">
              @{form.handle}
            </h6>
          </div>
        </div>
        <SimpleTooltip
          placement="left"
          disabled={!!commentary}
          content="Please add a comment before proceeding"
        >
          <div>
            <Button
              form="squad-comment"
              className="btn-primary-cabbage"
              type="submit"
              loading={isLoading}
              disabled={
                !commentary || isLoading || isPreviewLoading || isInvalidPost
              }
            >
              Done
            </Button>
          </div>
        </SimpleTooltip>
      </Modal.Footer>
    </>
  );
}
