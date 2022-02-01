import React from 'react';
import nock from 'nock';
import { getDayOfYear, getDaysInYear } from 'date-fns';
import { render, screen } from '@testing-library/react';
import { ReadingTopTag } from '../../graphql/users';
import { ReadingTagProgress } from './ReadingTagProgress';

beforeEach(() => {
  nock.cleanAll();
  jest.clearAllMocks();
});

const defaultTopTag: ReadingTopTag = {
  tag: 'javascript',
  readingDays: 4,
  percentage: 0.8,
};

const renderComponent = (
  isFilterSameYear = false,
  topTag: ReadingTopTag = defaultTopTag,
) => {
  return render(
    <ReadingTagProgress topTag={topTag} isFilterSameYear={isFilterSameYear} />,
  );
};

describe('ProfileTooltipContent component', () => {
  it('should show tag', async () => {
    renderComponent();
    await screen.findByText(`#${defaultTopTag.tag}`);
  });

  it('should show the percentage', async () => {
    renderComponent();
    await screen.findByText(`${(defaultTopTag.percentage * 100).toFixed(0)}%`);
  });

  it('should show default tooltip', async () => {
    renderComponent();
    const days = getDaysInYear(new Date());
    await screen.findByLabelText(
      `${defaultTopTag.readingDays}/${days} reading days`,
    );
  });

  it('should show appropriate tooltip for format same year', async () => {
    renderComponent(true);
    const days = getDayOfYear(new Date());
    await screen.findByLabelText(
      `${defaultTopTag.readingDays}/${days} reading days`,
    );
  });
});
