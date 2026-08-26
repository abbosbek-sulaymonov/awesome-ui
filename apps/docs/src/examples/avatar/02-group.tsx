import { Avatar, AvatarGroup } from "@abek/awesome-ui";

// The group owns sizing and counts the overflow past its limit.
export default function AvatarGroupExample() {
  return (
    <AvatarGroup max={3}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Alan Turing" />
      <Avatar name="Katherine Johnson" />
      <Avatar name="Barbara Liskov" />
    </AvatarGroup>
  );
}
