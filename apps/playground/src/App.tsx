import { useState } from "react";
import { Button, Input, ThemeProvider, useTheme } from "@abek/awesome-ui";

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
    </ThemeProvider>
  );
}
