import { Accordion } from "@abek/awesome-ui";

// `type="multiple"` holds several panels open, and reports an array.
export default function AccordionMultiple() {
  return (
    <Accordion.Root type="multiple" defaultValue={["one", "two"]} variant="separated">
      <Accordion.Item value="one">
        <Accordion.Trigger>First</Accordion.Trigger>
        <Accordion.Panel>Both of these start open.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Trigger>Second</Accordion.Trigger>
        <Accordion.Panel>Closing one leaves the other alone.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="three">
        <Accordion.Trigger>Third</Accordion.Trigger>
        <Accordion.Panel>Open me too.</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}
