import { Button } from "@abek/awesome-ui";

// `asChild` renders your element with the button's styling and behaviour.
// This is a real anchor with real link semantics — right-click, middle-click
// and "open in new tab" all work, which they would not on a div with onClick.
export default function ButtonAsChild() {
  return (
    <Button asChild variant="outline">
      <a href="https://github.com/abbosbek-sulaymonov/awesome-ui" target="_blank" rel="noreferrer">
        Open on GitHub
      </a>
    </Button>
  );
}
