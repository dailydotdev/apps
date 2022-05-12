import React, { ReactElement, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import { Button } from '../buttons/Button';
import { ModalCloseButton } from './ModalCloseButton';
import { ModalProps } from './StyledModal';
import { formToJson } from '../../lib/form';
import { apiUrl } from '../../lib/config';
import {
  contentGuidlines,
  requestAccessSubmitArticle,
} from '../../lib/constants';
import { ResponsiveModal } from './ResponsiveModal';
import { TextField } from '../fields/TextField';
import LinkIcon from '../../../icons/link.svg';
import { SUBMIT_ARTICLE_MUTATION } from '../../graphql/submitArticle';
import PostItemCard from '../post/PostItemCard';
import { PostItem } from '../../graphql/posts';

type SubmitArticleProps = {
  isEnabled: boolean;
  headerCopy: string;
  submitArticleModalButton: string;
} & ModalProps;

export default function SubmitArticle({
  isEnabled,
  headerCopy,
  submitArticleModalButton,
  onRequestClose,
  ...modalProps
}: SubmitArticleProps): ReactElement {
  const submitFormRef = useRef<HTMLFormElement>();
  const [enableSubmission, setEnableSubmission] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [existingArticle, setExistingArticle] = useState<PostItem>(null);
  const [urlHint, setUrlHint] = useState<string>();

  const { mutateAsync: submitArticle } = useMutation<unknown, unknown, string>(
    (articleUrl: string) =>
      request(`${apiUrl}/graphql`, SUBMIT_ARTICLE_MUTATION, {
        url: articleUrl,
      }),
  );

  const onUrlChanged = () => {
    if (submitFormRef.current) {
      if (existingArticle) {
        setExistingArticle(null);
      }
      if (urlHint) {
        setUrlHint(null);
      }
      setEnableSubmission(submitFormRef.current.checkValidity());
    }
  };

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    const data = formToJson<{ articleUrl: string }>(event.currentTarget);
    setIsValidating(true);

    if (!data.articleUrl) {
      setUrlHint('Please submit a valid URL');
      setIsValidating(false);

      return;
    }

    try {
      await submitArticle(data.articleUrl);
      setIsSubmitted(true);
    } catch (err) {
      const error = JSON.parse(JSON.stringify(err));
      try {
        const errorMessage = JSON.parse(error?.response?.errors[0]?.message);
        setExistingArticle(errorMessage);
      } catch (e) {
        setUrlHint(
          error?.response?.errors[0]?.message ??
            'Something went wrong, try again',
        );
        setEnableSubmission(false);
      }
    } finally {
      setIsValidating(false);
    }
  };

  const getButton = (): ReactElement => {
    if (isSubmitted) {
      return (
        <>
          <div className="flex items-center mt-4 mb-6 h-8 font-bold rounded-10 w-fit bg-theme-status-success text-theme-label-invert padding px-[0.9375rem]">
            Request sent
          </div>
          <p className="mb-2 typo-callout text-theme-label-tertiary">
            You will be notified via email about the article request status.
          </p>
        </>
      );
    }

    if (isEnabled) {
      return (
        <Button
          className="mt-4 btn-primary "
          buttonSize="small"
          type="submit"
          aria-label={submitArticleModalButton}
          disabled={!enableSubmission}
          loading={isValidating}
        >
          <span className={isValidating && 'invisible'}>
            {submitArticleModalButton}
          </span>
        </Button>
      );
    }
    return (
      <Button
        tag="a"
        href={requestAccessSubmitArticle}
        target="_blank"
        rel="noopener"
        aria-label="Request access"
        className="mt-4 w-fit btn-secondary"
      >
        Request access
      </Button>
    );
  };

  return (
    <ResponsiveModal
      {...modalProps}
      onRequestClose={onRequestClose}
      padding={false}
    >
      <header className="flex justify-between items-center py-4 px-6 w-full border-b border-theme-divider-tertiary">
        <h3 className="font-bold typo-title3">{headerCopy}</h3>
        <ModalCloseButton onClick={onRequestClose} />
      </header>
      <section className="overflow-auto relative px-10 pt-6 pb-10 w-full h-full shrink max-h-full">
        <p className="mb-2 typo-callout text-theme-label-tertiary">
          Found an interesting article? Do you want to share it with the
          community? Enter the article&apos;s URL / link below to add it to the
          feed.
        </p>
        <a
          className="font-bold underline typo-callout text-theme-label-link"
          target="_blank"
          rel="noopener"
          href={contentGuidlines}
        >
          Content guidelines
        </a>
        <p className="mt-6 mb-4 typo-callout">Daily suggestions used 0/3</p>
        <form
          className="w-full"
          ref={submitFormRef}
          aria-busy={isValidating}
          onSubmit={onSubmit}
        >
          <TextField
            autoFocus
            type="url"
            leftIcon={<LinkIcon />}
            fieldType="tertiary"
            name="articleUrl"
            inputId="article_url"
            label="Paste article url"
            disabled={!isEnabled}
            hint={urlHint}
            valid={!urlHint}
            valueChanged={onUrlChanged}
          />
          {getButton()}
        </form>
      </section>
      {existingArticle && (
        <div>
          <h4 className="px-10 pb-3.5 font-bold border-b border-theme-divider-tertiary typo-callout">
            Article exists
          </h4>
          <PostItemCard postItem={existingArticle} showButtons={false} />
        </div>
      )}
    </ResponsiveModal>
  );
}
