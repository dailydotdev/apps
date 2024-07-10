import React from 'react';
import type { Meta } from '@storybook/react';
import { StoryObj } from '@storybook/react';

const possibleTagsArray = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'a'];
const possibleClassnames = ['typo-caption2', 'typo-caption1', 'typo-footnote', 'typo-subhead', 'typo-callout', 'typo-body', 'typo-title3', 'typo-title2', 'typo-title1', 'typo-large-title', 'typo-mega3', 'typo-mega2', 'typo-mega1', 'typo-giga3', 'typo-giga2', 'typo-giga1', 'typo-tera'];
type PossibleTags = typeof possibleTagsArray[];
type PossibleTypographyClassnames = typeof possibleClassnames[];

interface TagComponentProps {
  Tag: React.ElementType & PossibleTags;
  className: React.ElementType & PossibleTypographyClassnames;
  children: string;
}

const TagComponent = ({Tag, children, ...props}: TagComponentProps) => <Tag {...props}>{children}</Tag>

const meta: Meta = {
  title: 'Tokens/Typography',
  args: {
    Tag: 'h1',
    children: 'The quick brown fox jumps over the lazy dog.',
    className: 'typo-caption2'
  },
  argTypes: {
    Tag: { control: "select", options: possibleTagsArray, description: 'Not a actual prop of this component, only used to help render different tags' },
    className: { control: "select", options: possibleClassnames, description: 'Typography classnames' },
    children: { control: "text", description: 'The text to be rendered inside the tag' }
  },
};

export default meta;

type Story = StoryObj<typeof TagComponent>;

export const Interactive: Story = {
  render: ({ children , Tag, ...props}) => {
    return <Tag {...props}>{children}</Tag>
  },
  name: 'Interactive',
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/C7n8EiXBwV1sYIEHkQHS8R/daily.dev---Design-System?type=design&node-id=450-2&mode=dev",
    },
  }
}

export const All: Story = {
  render: ({ children , Tag}) => {
    return (
      <table>
        <tbody>
        <tr className="border">
          <th className="border text-left w-1/6">Classname</th>
          <th className="text-left">Example</th>
        </tr>

        {possibleClassnames.map((className) => (
          <tr className="border">
            <td className="border w-1/6">{className}</td>
            <td><Tag className={className}>{children}</Tag></td>
          </tr>
          ))}
        </tbody>
      </table>
    )
  },
  args: {
    Tag: 'p',
    children: 'The quick brown fox jumps over the lazy dog.',
    className: null
  },
  parameters: {
    controls: {
      exclude: ['Tag', 'className', 'children' ]
    },
  },
  name: 'All',
}
