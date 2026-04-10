import { DocTableRow, DocTableCell } from "./doc-table";
import type { ReactNode } from "react";

interface ParamRowProps {
  name: string;
  type: string;
  required?: boolean;
  description: ReactNode;
}

export function ParamRow({ name, type, required, description }: ParamRowProps) {
  return (
    <DocTableRow>
      <DocTableCell mono>
        <span className="text-foreground">{name}</span>
        {required && (
          <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wider text-warning">
            required
          </span>
        )}
      </DocTableCell>
      <DocTableCell mono>
        <span className="text-primary">{type}</span>
      </DocTableCell>
      <DocTableCell>
        <span className="text-foreground-muted">{description}</span>
      </DocTableCell>
    </DocTableRow>
  );
}
