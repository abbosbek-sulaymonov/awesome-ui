import { Textarea } from "@abek/awesome-ui";

// Grows with the content and shrinks again when lines are deleted. The height
// is reset before measuring, which is what makes shrinking possible at all.
export default function TextareaAutoResize() {
  return (
    <div style={{ maxWidth: "28rem" }}>
      <Textarea
        label="Notes"
        autoResize
        minRows={2}
        maxRows={8}
        showCount
        maxLength={280}
        placeholder="Type several lines, then delete them again"
      />
    </div>
  );
}
