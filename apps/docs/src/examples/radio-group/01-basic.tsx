import { RadioGroup } from "@abek/awesome-ui";

export default function RadioGroupBasic() {
  return (
    <RadioGroup.Root label="Plan" name="plan" defaultValue="pro">
      <RadioGroup.Item value="free" label="Free" description="No card needed." />
      <RadioGroup.Item value="pro" label="Pro" description="Everything in Free, plus history." />
      <RadioGroup.Item value="team" label="Team" disabled description="Contact sales." />
    </RadioGroup.Root>
  );
}
