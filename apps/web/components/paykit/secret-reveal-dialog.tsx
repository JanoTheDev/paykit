"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyableField } from "./copyable-field";
import { AlertTriangle } from "lucide-react";

interface SecretRevealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  secret: string;
  onAcknowledge: () => void;
}

export function SecretRevealDialog({
  open,
  onOpenChange,
  title,
  description,
  secret,
  onAcknowledge,
}: SecretRevealDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-surface-1 sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <CopyableField value={secret} />
          <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/5 p-3 text-xs text-warning">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              This secret will only be shown once. Copy and store it securely —
              you won&apos;t be able to view it again.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              onAcknowledge();
              onOpenChange(false);
            }}
          >
            I&apos;ve saved it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
