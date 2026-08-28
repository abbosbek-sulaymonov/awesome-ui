import { useState } from "react";
import { Pagination } from "@abek/awesome-ui";

// The row keeps a constant width as you page through it, so the button you are
// about to click is the one you land on.
export default function PaginationBasic() {
  const [page, setPage] = useState(1);

  return (
    <div style={{ display: "grid", gap: "var(--aui-space-5)" }}>
      <Pagination count={20} page={page} onPageChange={setPage} />
      <Pagination count={20} defaultPage={10} variant="outline" size="sm" siblings={2} />
      <Pagination count={3} defaultPage={2} hideArrows />
    </div>
  );
}
