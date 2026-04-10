"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  emptyState: ReactNode;
  getRowHref?: (row: TData) => string;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData>({
  columns,
  data,
  emptyState,
  getRowHref,
  onRowClick,
}: DataTableProps<TData>) {
  const router = useRouter();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface-1">
        {emptyState}
      </div>
    );
  }

  const rowClickable = Boolean(getRowHref || onRowClick);

  return (
    <ScrollArea className="rounded-lg border border-border bg-surface-1">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow
              key={group.id}
              className="border-border hover:bg-transparent"
            >
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="h-10 px-4 text-xs font-medium uppercase tracking-wider text-foreground-dim"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn(
                "border-border transition-colors",
                rowClickable && "cursor-pointer hover:bg-surface-2",
              )}
              onClick={
                rowClickable
                  ? () => {
                      if (getRowHref) {
                        router.push(getRowHref(row.original));
                      } else if (onRowClick) {
                        onRowClick(row.original);
                      }
                    }
                  : undefined
              }
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="h-[52px] px-4 py-3.5 text-sm"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
