import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import type { Deal } from '../types';
import type { DealComment } from '../mockCommunity';
import {
  DEAL_AFFILIATE_DISCLOSURE,
  DEAL_NO_COMMISSION_DISCLOSURE,
  formatDealDate,
  getDealBrandPath,
  getDealCategoryPath,
  getDealDirectAnswer,
  getDealFacts,
  getDealPath,
} from '../dealsFormat';
import { DealVerification } from './DealVerification';

interface DealEvidenceProps {
  deal: Deal;
  comments: DealComment[];
  similarDeals: Deal[];
  now: number;
  className?: string;
}

const Block = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-3">
    <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
      {title}
    </Typography>
    {children}
  </section>
);

export const DealEvidence = ({
  deal,
  comments,
  similarDeals,
  now,
  className,
}: DealEvidenceProps): ReactElement => (
  <div className={classNames('flex flex-col gap-8', className)}>
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Body}
      color={TypographyColor.Primary}
    >
      {getDealDirectAnswer(deal, now)}
    </Typography>

    <DealVerification deal={deal} now={now} />

    <Block title="Terms at a glance">
      <table className="w-full table-fixed border-collapse text-left">
        <tbody>
          {getDealFacts(deal).map(({ label, value }) => (
            <tr
              key={label}
              className="border-b border-border-subtlest-tertiary"
            >
              <th
                scope="row"
                className="py-2 pr-4 align-top font-normal text-text-tertiary typo-footnote"
              >
                {label}
              </th>
              <td className="py-2 align-top text-text-primary typo-footnote">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {deal.terms}
      </Typography>
    </Block>

    {comments.length > 0 && (
      <Block title="What developers reported">
        <ul className="flex flex-col gap-4">
          {comments.map((comment) => (
            <li key={comment.id}>
              <blockquote className="border-l-2 border-border-subtlest-tertiary pl-3 text-text-primary typo-callout">
                {comment.body}
              </blockquote>
              <Typography
                tag={TypographyTag.P}
                type={TypographyType.Caption1}
                color={TypographyColor.Quaternary}
                className="pl-3 pt-1"
              >
                <cite className="not-italic">
                  {comment.author} ({comment.handle})
                </cite>{' '}
                on daily.dev,{' '}
                <time dateTime={comment.createdAt}>
                  {formatDealDate(comment.createdAt)}
                </time>
              </Typography>
            </li>
          ))}
        </ul>
      </Block>
    )}

    <Block title="Where this offer comes from">
      <ul className="flex flex-col gap-2 text-text-link typo-footnote">
        <li>
          <a
            href={deal.partnerUrl}
            target="_blank"
            rel="sponsored nofollow noopener"
          >
            {deal.brand.name} offer page on {deal.brand.domain}
          </a>
        </li>
        <li>
          <Link href={getDealBrandPath(deal.brand)} passHref>
            <a>All {deal.brand.name} deals on daily.dev</a>
          </Link>
        </li>
        {deal.categories.map((category) => (
          <li key={category}>
            <Link href={getDealCategoryPath(category)} passHref>
              <a>{category} deals on daily.dev</a>
            </Link>
          </li>
        ))}
      </ul>
      <Typography
        tag={TypographyTag.P}
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        {deal.isCommissioned
          ? DEAL_AFFILIATE_DISCLOSURE
          : DEAL_NO_COMMISSION_DISCLOSURE}
      </Typography>
    </Block>

    {similarDeals.length > 0 && (
      <Block title="Similar live deals">
        <ul className="flex flex-col gap-2 text-text-link typo-footnote">
          {similarDeals.map((similar) => (
            <li key={similar.id}>
              <Link href={getDealPath(similar)} passHref>
                <a>{similar.title}</a>
              </Link>
            </li>
          ))}
        </ul>
      </Block>
    )}
  </div>
);
