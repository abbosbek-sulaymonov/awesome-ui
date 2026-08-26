import { Avatar } from "@abek/awesome-ui";

export default function AvatarSizes() {
  return (
    <>
      <Avatar name="Ada Lovelace" size="xs" />
      <Avatar name="Grace Hopper" size="sm" />
      <Avatar name="Alan Turing" size="md" status="online" />
      <Avatar name="Katherine Johnson" size="lg" status="busy" />
      <Avatar name="Barbara Liskov" size="xl" square />
    </>
  );
}
