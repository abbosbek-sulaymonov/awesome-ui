import { useState } from "react";
import { Calendar } from "@abek/awesome-ui";

export default function CalendarBasic() {
  const [value, setValue] = useState<Date | null>(null);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--aui-space-6)" }}>
      <Calendar value={value} onValueChange={setValue} />

      {/* Weekends rejected, and the range capped to this month. */}
      <Calendar
        defaultMonth={new Date()}
        isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6}
      />
    </div>
  );
}
