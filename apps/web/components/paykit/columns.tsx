import type { ColumnDef } from "@tanstack/react-table";
import { Amount } from "./amount";
import { AddressText } from "./address-text";
import { HashText } from "./hash-text";
import { StatusBadge } from "./status-badge";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Align = "left" | "right";

function textCell(value: unknown, align: Align, muted: boolean): ReactNode {
  return (
    <div
      className={cn(
        align === "right" && "text-right",
        muted && "text-foreground-muted",
      )}
    >
      {(value as ReactNode) ?? "—"}
    </div>
  );
}

export const col = {
  text<T>(
    key: keyof T,
    header: string,
    opts: { align?: Align; muted?: boolean } = {},
  ): ColumnDef<T, unknown> {
    const { align = "left", muted = false } = opts;
    return {
      accessorKey: key as string,
      header: () => (
        <div className={align === "right" ? "text-right" : undefined}>
          {header}
        </div>
      ),
      cell: ({ row }) => textCell(row.getValue(key as string), align, muted),
    };
  },

  mono<T>(key: keyof T, header: string): ColumnDef<T, unknown> {
    return {
      accessorKey: key as string,
      header,
      cell: ({ row }) => {
        const v = row.getValue(key as string) as string | null | undefined;
        return v ? (
          <span className="font-mono tabular-nums">{v}</span>
        ) : (
          "—"
        );
      },
    };
  },

  amount<T>(
    key: keyof T,
    header: string,
    opts: { withBadge?: boolean } = {},
  ): ColumnDef<T, unknown> {
    return {
      accessorKey: key as string,
      header: () => <div className="text-right">{header}</div>,
      cell: ({ row }) => {
        const v = row.getValue(key as string) as number;
        return <Amount cents={v} withBadge={opts.withBadge} align="right" />;
      },
    };
  },

  date<T>(key: keyof T, header: string): ColumnDef<T, unknown> {
    return {
      accessorKey: key as string,
      header,
      cell: ({ row }) => {
        const v = row.getValue(key as string) as Date | null | undefined;
        return v ? (
          <span className="text-foreground-muted">{formatDate(v)}</span>
        ) : (
          "—"
        );
      },
    };
  },

  dateTime<T>(key: keyof T, header: string): ColumnDef<T, unknown> {
    return {
      accessorKey: key as string,
      header,
      cell: ({ row }) => {
        const v = row.getValue(key as string) as Date | null | undefined;
        return v ? (
          <span className="text-foreground-muted">{formatDateTime(v)}</span>
        ) : (
          "—"
        );
      },
    };
  },

  address<T>(
    key: keyof T,
    header: string,
    opts: { link?: boolean } = {},
  ): ColumnDef<T, unknown> {
    return {
      accessorKey: key as string,
      header,
      cell: ({ row }) => {
        const v = row.getValue(key as string) as string | null | undefined;
        return v ? <AddressText address={v} link={opts.link} /> : "—";
      },
    };
  },

  hash<T>(
    key: keyof T,
    header: string,
    opts: { explorer?: "tx" | "none" } = {},
  ): ColumnDef<T, unknown> {
    return {
      accessorKey: key as string,
      header,
      cell: ({ row }) => {
        const v = row.getValue(key as string) as string | null | undefined;
        return v ? <HashText hash={v} link={opts.explorer ?? "tx"} /> : "—";
      },
    };
  },

  status<T>(
    key: keyof T,
    header: string,
    kind:
      | "payment"
      | "subscription"
      | "apiKey"
      | "webhook"
      | "productType"
      | "productState"
      | "checkout"
      | "delivery",
  ): ColumnDef<T, unknown> {
    return {
      accessorKey: key as string,
      header,
      cell: ({ row }) => {
        const v = row.getValue(key as string) as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <StatusBadge kind={kind as any} status={v as any} />;
      },
    };
  },

  customer<T>(opts: {
    emailKey: keyof T;
    walletKey: keyof T;
    header?: string;
  }): ColumnDef<T, unknown> {
    return {
      id: "customer",
      header: opts.header ?? "Customer",
      cell: ({ row }) => {
        const email = row.original[opts.emailKey] as
          | string
          | null
          | undefined;
        const wallet = row.original[opts.walletKey] as
          | string
          | null
          | undefined;
        if (email) return <span>{email}</span>;
        if (wallet) return <AddressText address={wallet} />;
        return <span className="text-foreground-dim">—</span>;
      },
    };
  },

  actions<T>(
    build: (row: T) => ReactNode,
  ): ColumnDef<T, unknown> {
    return {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end">{build(row.original)}</div>
      ),
    };
  },
};
