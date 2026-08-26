import { Button, toast } from "@abek/awesome-ui";

// One toast moves from loading to success in place, rather than stacking three.
export default function ToastPromise() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        toast.promise(new Promise((resolve) => setTimeout(resolve, 1800)), {
          loading: "Saving…",
          success: "Saved",
          error: "Failed",
        })
      }
    >
      Track a promise
    </Button>
  );
}
