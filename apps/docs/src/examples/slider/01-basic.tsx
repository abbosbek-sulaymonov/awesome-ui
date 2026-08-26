import { useState } from "react";
import { Slider } from "@abek/awesome-ui";

export default function SliderBasic() {
  const [volume, setVolume] = useState(40);

  return (
    <div style={{ display: "grid", gap: "var(--aui-space-8)", width: "100%", maxWidth: "28rem" }}>
      <Slider
        label="Volume"
        showValue
        value={volume}
        onValueChange={(next) => setVolume(next as number)}
        formatValue={(n) => `${n}%`}
      />
      <Slider label="Quality" defaultValue={2} min={1} max={5} step={1} showValue
        marks={[{ value: 1, label: "Low" }, { value: 3, label: "Mid" }, { value: 5, label: "High" }]} />
      <Slider label="Disabled" defaultValue={30} disabled showValue />
    </div>
  );
}
