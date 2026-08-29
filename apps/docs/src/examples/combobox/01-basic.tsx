import { Combobox } from "@abek/awesome-ui";

const frameworks = [
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "qwik", label: "Qwik", disabled: true },
  { value: "vue", label: "Vue" },
  { value: "preact", label: "Preact" },
  { value: "angular", label: "Angular" },
];

// Focus never leaves the input — typing has to keep working — so the highlight
// is tracked with aria-activedescendant rather than by moving focus.
export default function ComboboxBasic() {
  return (
    <div style={{ maxWidth: "20rem" }}>
      <Combobox
        options={frameworks}
        label="Framework"
        placeholder="Search frameworks"
        description="Type to filter, arrows to move, Enter to pick."
      />
    </div>
  );
}
