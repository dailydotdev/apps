import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  ButtonVariant,
} from "@dailydotdev/shared/src/components/buttons/ButtonV2";
import SearchIcon from "@dailydotdev/shared/src/components/icons/Search";

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  argTypes: {
    href: {
      control: "text",
    },
    onClick: {
      control: "object",
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Basic: Story = {
  render: (props) => <Button {...props}>{props.children}</Button>,
  name: "Basic",
  args: {
    children: "Click me",
    variant: ButtonVariant.Primary,
    onClick: () => {
      // eslint-disable-next-line no-alert -- alert for demo
      alert("Hello!");
    },
  },
};

export const Icon: Story = {
  render: (props) => <Button {...props}>{props.children}</Button>,
  name: "Icon",
  args: {
    children: "Hello",
    // TODO: WT-2017 importing the SearchIcon fails for some reason 😭
    // This is a poor mans attempt at getting the icon to show up
    icon: (
      <svg
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 pointer-events-none hover:text-theme-label-primary"
      >
        <path
          d="M12 3a2.312 2.312 0 012.25 2.847 6.39 6.39 0 014.106 5.491l.015.264.004.21v2.226l.072.022c.803.28 1.405.988 1.53 1.852l.018.175.005.158c0 1.224-.95 2.226-2.154 2.307l-.159.006-2.046-.001-.013.033a3.94 3.94 0 01-3.216 2.384l-.21.016-.202.005a3.926 3.926 0 01-3.536-2.22l-.083-.183-.015-.035H6.313c-1.171 0-2.139-.87-2.292-1.998l-.016-.156L4 16.245c0-.903.52-1.693 1.325-2.076l.165-.071.135-.048v-2.238A6.377 6.377 0 019.75 5.846 2.312 2.312 0 0112 3zm0 3.938c-.437 0-.86.057-1.262.165l-.148.042a4.876 4.876 0 00-3.46 4.441l-.005.226v2.808c0 .414-.31.756-.71.806l-.197.012a.813.813 0 00-.007 1.613l.101.007h3.25l.005.143a2.438 2.438 0 002.272 2.289l.161.005.16-.005a2.438 2.438 0 002.272-2.265l.005-.168h3.25l.102-.006a.813.813 0 000-1.612l-.196-.012a.813.813 0 01-.712-.704l-.006-.103v-2.807l-.003-.183a4.878 4.878 0 00-3.461-4.485l-.143-.041A4.881 4.881 0 0012 6.937zM12 4.5a.812.812 0 10.788 1.013l.018-.099.007-.101A.812.812 0 0012 4.5z"
          fill="currentcolor"
          fill-rule="evenodd"
        ></path>
      </svg>
    ),
  },
};
