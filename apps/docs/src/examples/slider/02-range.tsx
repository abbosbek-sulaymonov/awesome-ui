import { Slider } from "@abek/awesome-ui";

// Two thumbs clamp against each other rather than swapping — swapping would
// change which thumb is under the pointer mid-drag and lose keyboard focus.
export default function SliderRange() {
  return (
    <div style={{ width: "100%", maxWidth: "28rem" }}>
      <Slider
        label="Price"
        defaultValue={[20, 80]}
        step={5}
        minStepsBetweenThumbs={2}
        showValue
        formatValue={(n) => `$${n}`}
      />
    </div>
  );
}
