import { Button, toast } from "@abek/awesome-ui";

// `toast()` reads a module-level store, so it works anywhere — not only inside
// a component. Mount <Toaster /> once near the root of the app.
export default function ToastVariants() {
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => toast.success("Project saved")}>
        Success
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.error("Could not save", { description: "Network unreachable." })}
      >
        Error
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast("Project deleted", {
            action: { label: "Undo", onClick: () => toast.success("Restored") },
          })
        }
      >
        With action
      </Button>
    </>
  );
}
