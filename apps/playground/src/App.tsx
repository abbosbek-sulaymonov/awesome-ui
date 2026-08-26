import { useState } from "react";
import {
  Button,
  Dialog,
  Input,
  Popover,
  ThemeProvider,
  Toaster,
  Tooltip,
  toast,
  useTheme,
} from "@abek/awesome-ui";

function ThemeToggle() {
  const { colorScheme, toggle } = useTheme();
  return (
    <Button variant="outline" size="sm" onClick={toggle}>
      {colorScheme === "dark" ? "Light" : "Dark"} mode
    </Button>
  );
}

function Playground() {
  const [email, setEmail] = useState("");
  const invalid = email.length > 0 && !email.includes("@");

  return (
    <div className="stack">
      <div className="row">
        <h2 style={{ marginRight: "auto" }}>awesome-ui</h2>
        <ThemeToggle />
      </div>

      <section className="stack">
        <h2>Variants</h2>
        <div className="row">
          <Button variant="solid">Solid</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section className="stack">
        <h2>Sizes &amp; states</h2>
        <div className="row">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="stack">
        <h2>asChild</h2>
        <div className="row">
          <Button asChild variant="outline">
            <a href="https://github.com/abek01sulaymonov" target="_blank" rel="noreferrer">
              Renders a real anchor
            </a>
          </Button>
        </div>
      </section>

      <section className="stack">
        <h2>Dialog</h2>
        <div className="row">
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button variant="danger">Delete project</Button>
            </Dialog.Trigger>
            <Dialog.Overlay />
            <Dialog.Content size="sm">
              <Dialog.Header>
                <Dialog.Title>Delete project</Dialog.Title>
                <Dialog.Description>
                  This permanently removes the project and everything in it.
                </Dialog.Description>
              </Dialog.Header>
              <Input label="Type the project name to confirm" placeholder="awesome-ui" />
              <Dialog.Footer>
                <Dialog.Close asChild>
                  <Button variant="ghost">Cancel</Button>
                </Dialog.Close>
                <Button variant="danger">Delete</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Root>
        </div>
      </section>

      <section className="stack">
        <h2>Popover</h2>
        <div className="row">
          {(["top", "right", "bottom", "left"] as const).map((placement) => (
            <Popover.Root key={placement} placement={placement}>
              <Popover.Trigger asChild>
                <Button variant="outline" size="sm">
                  {placement}
                </Button>
              </Popover.Trigger>
              <Popover.Content aria-label={`${placement} popover`}>
                <Popover.Arrow />
                <strong>Placement: {placement}</strong>
                <p style={{ margin: "var(--aui-space-2) 0 0" }}>
                  Flips and shifts to stay on screen. Scroll or resize to see it.
                </p>
              </Popover.Content>
            </Popover.Root>
          ))}
        </div>
      </section>

      <section className="stack">
        <h2>Tooltip</h2>
        <div className="row">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button variant="ghost" size="sm">
                Hover me
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Arrow />
              Waits 500ms on hover, opens instantly on focus
            </Tooltip.Content>
          </Tooltip.Root>

          <Tooltip.Root placement="right" openDelay={0}>
            <Tooltip.Trigger asChild>
              <Button variant="ghost" size="sm">
                No delay
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Arrow />
              Opens immediately
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
      </section>

      <section className="stack">
        <h2>Toast</h2>
        <div className="row">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Project saved")}
          >
            Success
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.error("Could not save", { description: "Network unreachable." })
            }
          >
            Error
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast("Project deleted", {
                action: { label: "Undo", onClick: () => toast.success("Restored") },
              })
            }
          >
            With action
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast.promise(
                new Promise((resolve) => setTimeout(resolve, 1800)),
                { loading: "Saving\u2026", success: "Saved", error: "Failed" },
              )
            }
          >
            Promise
          </Button>
        </div>
      </section>

      <section className="stack">
        <h2>Input</h2>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          description="We never share it."
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          {...(invalid ? { errorMessage: "Enter a valid email address." } : {})}
          required
        />
        <Input label="Filled" variant="filled" placeholder="Filled variant" />
        <Input label="Flushed" variant="flushed" placeholder="Flushed variant" />
        <Input label="Disabled" placeholder="Disabled" disabled />
      </section>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <Playground />
      <Toaster />
    </ThemeProvider>
  );
}
