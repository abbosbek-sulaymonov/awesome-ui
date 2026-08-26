import { useState } from "react";
import { Button, Menu } from "@abek/awesome-ui";

export default function MenuBasic() {
  const [sidebar, setSidebar] = useState(true);

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button variant="outline" size="sm">Actions</Button>
      </Menu.Trigger>
      <Menu.Content label="Actions">
        <Menu.Group>
          <Menu.Label>File</Menu.Label>
          <Menu.Item shortcut="⌘N">New file</Menu.Item>
          <Menu.Item shortcut="⌘D">Duplicate</Menu.Item>
          <Menu.Item disabled>Archive</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        {/* A toggle keeps the menu open, so several can be flipped in one visit. */}
        <Menu.CheckboxItem checked={sidebar} onCheckedChange={setSidebar}>
          Show sidebar
        </Menu.CheckboxItem>
        <Menu.Separator />
        <Menu.Item danger shortcut="⌘⌫">Delete</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}
