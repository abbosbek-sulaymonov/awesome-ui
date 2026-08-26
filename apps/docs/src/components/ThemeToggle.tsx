import { useTheme } from "@abek/awesome-ui";
import { MoonIcon, SunIcon } from "./Icons";

/**
 * Icon toggle. The label describes what pressing it *does*, not what the
 * current state is — "Switch to dark mode" tells a screen-reader user the
 * outcome, which is what they need before pressing.
 */
export function ThemeToggle() {
  const { colorScheme, toggle } = useTheme();
  const next = colorScheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="iconButton"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      {colorScheme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
