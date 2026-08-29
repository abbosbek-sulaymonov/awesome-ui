import { useState } from "react";
import { Badge, Table } from "@abek/awesome-ui";

const rows = [
  { id: "INV-001", customer: "Acme", status: "Paid", amount: 250 },
  { id: "INV-002", customer: "Globex", status: "Pending", amount: 150 },
  { id: "INV-003", customer: "Initech", status: "Overdue", amount: 420 },
];

const tone = { Paid: "success", Pending: "warning", Overdue: "danger" } as const;

export default function TableBasic() {
  const [sort, setSort] = useState<"ascending" | "descending">("ascending");
  const sorted = [...rows].sort((a, b) =>
    sort === "ascending" ? a.amount - b.amount : b.amount - a.amount,
  );

  return (
    <Table.Root zebra interactive>
      <Table.Caption>Recent invoices</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Invoice</Table.HeaderCell>
          <Table.HeaderCell>Customer</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell
            numeric
            sort={sort}
            onSort={() => setSort(sort === "ascending" ? "descending" : "ascending")}
          >
            Amount
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sorted.map((row) => (
          <Table.Row key={row.id}>
            <Table.Cell>{row.id}</Table.Cell>
            <Table.Cell>{row.customer}</Table.Cell>
            <Table.Cell>
              <Badge tone={tone[row.status as keyof typeof tone]}>{row.status}</Badge>
            </Table.Cell>
            <Table.Cell numeric>${row.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
