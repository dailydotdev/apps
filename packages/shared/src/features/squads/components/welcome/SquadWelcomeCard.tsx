import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { OpenLinkIcon } from '../../../../components/icons';
import { Image, ImageType } from '../../../../components/image/Image';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import type { SquadWelcomeView } from '../../lib/welcome';

interface SquadWelcomeCardProps {
  view: SquadWelcomeView;
  onCta?: () => void;
  onClose?: () => void;
}

/**
 * The welcome pop-up's content. The layout never changes; only the fields
 * do, which keeps it one template for the company to fill in. Manage ›
 * Welcome pop-up renders it as the live preview.
 */
export const SquadWelcomeCard = ({
  view,
  onCta,
  onClose,
}: SquadWelcomeCardProps): ReactElement => (
  <div className="flex flex-col">
    <div className="relative h-28 bg-surface-float">
      {!!view.coverUrl && (
        <img src={view.coverUrl} alt="" className="size-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background-default to-transparent" />
    </div>
    <div className="-mt-10 flex flex-col gap-3 px-5 pb-5">
      <Image
        src={view.imageUrl}
        alt=""
        type={ImageType.Squad}
        className="relative size-16 rounded-full bg-background-default object-cover ring-4 ring-background-default"
      />
      <div className="flex flex-col gap-1">
        <Typography tag={TypographyTag.H2} type={TypographyType.Title2} bold>
          {view.headline}
        </Typography>
        {!!view.text && (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Secondary}
            className="text-pretty"
          >
            {view.text}
          </Typography>
        )}
      </div>
      {!!view.rules.length && (
        <ol className="flex flex-col gap-1.5">
          {view.rules.map((rule, index) => (
            <li key={rule} className="flex gap-2">
              <Typography
                type={TypographyType.Footnote}
                bold
                className="text-accent-cabbage-default"
              >
                {index + 1}
              </Typography>
              <Typography
                type={TypographyType.Footnote}
                color={TypographyColor.Secondary}
              >
                {rule}
              </Typography>
            </li>
          ))}
        </ol>
      )}
      <div className="flex gap-2 pt-1">
        {view.ctaUrl ? (
          <Button
            tag="a"
            href={view.ctaUrl}
            target="_blank"
            rel="noopener nofollow"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<OpenLinkIcon />}
            iconPosition={ButtonIconPosition.Right}
            onClick={onCta}
          >
            {view.ctaLabel}
          </Button>
        ) : (
          <Button
            type="button"
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            onClick={onCta}
          >
            {view.ctaLabel}
          </Button>
        )}
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={onClose}
        >
          Maybe later
        </Button>
      </div>
    </div>
  </div>
);
