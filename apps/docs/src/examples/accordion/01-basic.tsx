import { Accordion } from "@abek/awesome-ui";

export default function AccordionBasic() {
  return (
    <Accordion.Root defaultValue="what">
      <Accordion.Item value="what">
        <Accordion.Trigger>What is awesome-ui?</Accordion.Trigger>
        <Accordion.Panel>
          A personal React component library: accessible primitives, CSS Modules, zero
          runtime dependencies.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="how">
        <Accordion.Trigger>How is it distributed?</Accordion.Trigger>
        <Accordion.Panel>
          As an npm package, and as source you copy through the shadcn CLI.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="soon" disabled>
        <Accordion.Trigger>Coming soon</Accordion.Trigger>
        <Accordion.Panel>Not yet.</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}
