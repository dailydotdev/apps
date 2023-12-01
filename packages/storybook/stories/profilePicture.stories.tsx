import type { Meta, StoryObj } from "@storybook/react";
import { ProfilePicture, sizeClasses } from '@dailydotdev/shared/src/components/ProfilePicture';
import {  ProfilePictureGroup } from '@dailydotdev/shared/src/components/ProfilePictureGroup';

// TODO: this story fails due to the below import which we will need to mock
//       jest mocking is not currently supported in storybook
// jest.mock('../hooks/useRequestProtocol', () => ({
//   useRequestProtocol() {
//     return {
//       isCompanion: false,
//     };
//   },
// }));

const user = {
  id: "1",
  image: "https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/codrops",
  username: "test",
};

const meta: Meta<typeof ProfilePicture> = {
  component: ProfilePicture,
  argTypes: {
    size: {
      control: { type: "radio" },
      options: Object.keys(sizeClasses),
    }
  },
};

export default meta;

type Story = StoryObj<typeof ProfilePicture>;

export const Primary: Story = {
  render: (props) => (
    <ProfilePicture
      user={user}
      rounded="full"
    />
  ),
  name: "ProfilePicture",
};

export const Secondary: Story = {
  render: (props) => (
    <ProfilePictureGroup>
      <ProfilePicture
        user={user}
        rounded="full"
      />

      <ProfilePicture
        user={user}
        rounded="full"
      />
    </ProfilePictureGroup>
  ),
  name: "ProfilePictureGroup",
};
