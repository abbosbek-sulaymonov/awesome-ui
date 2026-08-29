import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Table } from "../../../src/components/Table/Table";

const Basic = (props: React.ComponentProps<typeof Table.Root> = {}) => (
  <Table.Root {...props}>
    <Table.Caption>Recent invoices</Table.Caption>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>Invoice</Table.HeaderCell>
        <Table.HeaderCell numeric>Amount</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      <Table.Row>
        <Table.Cell>INV-001</Table.Cell>
        <Table.Cell numeric>$250</Table.Cell>
      </Table.Row>
      <Table.Row selected>
        <Table.Cell>INV-002</Table.Cell>
        <Table.Cell numeric>$150</Table.Cell>
      </Table.Row>
    </Table.Body>
  </Table.Root>
);

describe("Table", () => {
  it("renders a table named by its caption", () => {
    render(<Basic />);
    // A caption names the table for assistive tech, which a heading above it
    // cannot do.
    expect(screen.getByRole("table", { name: "Recent invoices" })).toBeInTheDocument();
  });

  it("renders header cells as column headers", () => {
    render(<Basic />);
    const headers = screen.getAllByRole("columnheader");

    expect(headers).toHaveLength(2);
    expect(headers[0]).toHaveAttribute("scope", "col");
  });

  it("renders rows and cells", () => {
    render(<Basic />);
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("cell", { name: "INV-001" })).toBeInTheDocument();
  });

  it("marks a selected row with a data attribute rather than aria-selected", () => {
    render(<Basic />);
    const rows = screen.getAllByRole("row");

    // aria-selected belongs to grid and listbox roles, not to a plain table row.
    expect(rows[2]).toHaveAttribute("data-selected", "true");
    expect(rows[2]).not.toHaveAttribute("aria-selected");
  });

  it("exposes its density", () => {
    render(<Basic density="compact" />);
    expect(screen.getByRole("table")).toHaveAttribute("data-density", "compact");
  });

  it("scrolls inside its own container", () => {
    const { container } = render(<Basic />);
    // A wide table must scroll in its own box rather than pushing the page.
    expect(container.firstElementChild).not.toBe(screen.getByRole("table"));
    expect(container.firstElementChild).toContainElement(screen.getByRole("table"));
  });

  describe("sorting", () => {
    const Sortable = ({ sort }: { sort: "ascending" | "descending" | false }) => (
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell sort={sort} onSort={() => {}}>Invoice</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row><Table.Cell>a</Table.Cell><Table.Cell>b</Table.Cell></Table.Row>
        </Table.Body>
      </Table.Root>
    );

    it("marks only the column actually being sorted", () => {
      render(<Sortable sort="ascending" />);
      const headers = screen.getAllByRole("columnheader");

      expect(headers[0]).toHaveAttribute("aria-sort", "ascending");
      // Marking every sortable column "none" is legal but noisy, and screen
      // readers read it.
      expect(headers[1]).not.toHaveAttribute("aria-sort");
    });

    it("carries no aria-sort while sortable but unsorted", () => {
      render(<Sortable sort={false} />);
      expect(screen.getAllByRole("columnheader")[0]).not.toHaveAttribute("aria-sort");
    });

    it("puts a real button inside the header cell", () => {
      render(<Sortable sort={false} />);
      // The cell is a header; the thing that sorts it is a button.
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("says what activating the header will do", () => {
      render(<Sortable sort={false} />);
      expect(screen.getByRole("button")).toHaveAccessibleName(/sortable/i);
    });

    it("says which way it is currently sorted", () => {
      render(<Sortable sort="descending" />);
      expect(screen.getByRole("button")).toHaveAccessibleName(/sorted descending/i);
    });

    it("calls onSort when activated", async () => {
      const onSort = vi.fn();
      render(
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell sort={false} onSort={onSort}>Invoice</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body><Table.Row><Table.Cell>a</Table.Cell></Table.Row></Table.Body>
        </Table.Root>,
      );

      await userEvent.click(screen.getByRole("button"));
      expect(onSort).toHaveBeenCalledOnce();
    });

    it("leaves a non-sortable header as plain text", () => {
      render(<Sortable sort={false} />);
      const headers = screen.getAllByRole("columnheader");
      expect(headers[1]!.querySelector("button")).toBeNull();
    });
  });

  it("renders an empty state", () => {
    render(
      <Table.Root>
        <Table.Body>
          <Table.Row>
            <Table.Empty colSpan={2}>Nothing here yet</Table.Empty>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    );

    expect(screen.getByRole("cell", { name: "Nothing here yet" })).toBeInTheDocument();
  });
});
