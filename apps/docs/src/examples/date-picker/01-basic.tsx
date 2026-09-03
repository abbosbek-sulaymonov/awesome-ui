import { DatePicker } from "@abek/awesome-ui";

export default function DatePickerBasic() {
  const today = new Date();
  const inAMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

  return (
    <div style={{ display: "grid", gap: "var(--aui-space-4)", maxWidth: "18rem" }}>
      <DatePicker label="Starts on" description="Type a date, or pick one." name="starts" />
      <DatePicker label="Within a month" min={today} max={inAMonth} />
      <DatePicker label="Disabled" defaultValue={today} disabled />
    </div>
  );
}
