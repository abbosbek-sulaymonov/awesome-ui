import { Select } from "@abek/awesome-ui";

export default function SelectBasic() {
  return (
    <div style={{ maxWidth: "20rem" }}>
      <Select.Root defaultValue="react" name="framework">
        <Select.Trigger label="Framework" description="Arrow keys, Home/End, and type to jump.">
          <Select.Value placeholder="Pick one" />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Label>Signals</Select.Label>
            <Select.Item value="solid">Solid</Select.Item>
            <Select.Item value="svelte">Svelte</Select.Item>
            <Select.Item value="qwik" disabled>Qwik (unavailable)</Select.Item>
          </Select.Group>
          <Select.Separator />
          <Select.Group>
            <Select.Label>Virtual DOM</Select.Label>
            <Select.Item value="react">React</Select.Item>
            <Select.Item value="vue">Vue</Select.Item>
            <Select.Item value="preact">Preact</Select.Item>
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </div>
  );
}
