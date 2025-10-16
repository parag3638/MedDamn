"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "./data-table-column-header";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Paperclip, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CaseDetailDialog from "./SideDetailSheetComp/CaseDetailDialog";
import type { InboxItem } from "../page"; // adjust relative path if different
import React from "react";


const flagTone = (n: number) =>
  n === 0
    ? "hover:bg-muted hover:text-muted-foreground bg-muted text-muted-foreground"
    : n === 1
      ? "bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800"
      : "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800";

// helper
function formatDateTime(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type BuilderArgs = {
  onDirtyClose?: () => void;
  onStatusChange?: (id: string, next: "pending" | "reviewed" | "closed") => void;
};

export const buildColumns = ({ onDirtyClose, onStatusChange }: BuilderArgs): ColumnDef<InboxItem>[] => {
  return [
    {
      accessorKey: "patient_name",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Patient" />,
      cell: ({ row }) => (
        <div className="placeholder:w-[150px] font-medium">
          {row.getValue("patient_name") ?? "—"}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "complaint",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Chief Complaint" />,
      cell: ({ row }) => (
        <div className="flex space-x-0">
          <span className="max-w-[320px]">{row.getValue("complaint") ?? "—"}</span>
        </div>
      ),
    },
    {
      accessorKey: "probable_dx",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Top DDx" />,
      cell: ({ row }) => (
        <div className="flex space-x-0">
          <span className="max-w-[200px] truncate">
            {row.getValue("probable_dx") ?? "—"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "red_flags_count",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Red Flags" />,
      cell: ({ row }) => {
        const n = Number(row.getValue("red_flags_count") ?? 0);
        return (
          <div className="flex items-center justify-center gap-1 max-w-[70px]">
            {n === 0 ? (
              <CheckCircle className="h-4 w-4 text-muted-foreground" aria-hidden />
            ) : (
              <AlertTriangle className={`h-4 w-4 ${n >= 2 ? "text-red-500" : "text-amber-500"}`} aria-hidden />
            )}
            <Badge className={`px-2 py-0.5 text-xs ${flagTone(n)}`}>{n}</Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "files_count",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Files" />,
      cell: ({ row }) => {
        const count = Number(row.getValue("files_count") ?? 0);
        return (
          <div className="flex items-center justify-center max-w-[40px]">
            <Paperclip className="h-4 w-4 mr-1" />
            <span className="text-xs font-medium">{count}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "patient_phone",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
      cell: ({ row }) => <div className="text-sm">{row.getValue("patient_phone") ?? "N/A"}</div>,
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      filterFn: (row, id, value) => value.includes(row.getValue("status")),
      cell: ({ row }) => {
        const s = row.getValue("status") as string;
        const pill = (txt: string, cls: string) => (
          <Badge className={`font-medium rounded-xl p-1 px-2 ${cls}`} variant="outline">
            {txt}
          </Badge>
        );
        if (s === "reviewed") return pill("Reviewed", "bg-orange-200 text-orange-700");
        if (s === "pending") return pill("Pending", "bg-amber-200 text-amber-700");
        if (s === "closed") return pill("Closed", "bg-green-200 text-green-700");
        return pill("Unknown", "bg-gray-200 text-gray-700");
      },
    },
    {
      accessorKey: "submitted_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Submitted At" />,
      cell: ({ row }) => (
        <div className="flex space-x-0">
          <span className="max-w-[200px] truncate">
            {formatDateTime(row.getValue("submitted_at") as string)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
      id: "id",
      cell: ({ row }) => {
        // track if dialog made changes; only then ask parent to reload on close
        const [dirty, setDirty] = React.useState(false);
        const id = row.getValue("id") as string;

        return (
          <Dialog
            onOpenChange={(open) => {
              // When closing and something changed → ask parent to reload
              if (!open && dirty) {
                onDirtyClose?.();
                setDirty(false); // reset for next open
              }
            }}
          >
            <DialogTrigger asChild>
              <div className="flex space-x-0">
                <span className="max-w-[200px]">
                  <Button variant="outline" className="h-8 w-10 p-0">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </span>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1200px]">
              <DialogHeader className="space-y-1">
                <DialogTitle>Case Details</DialogTitle>
                <DialogDescription>
                  Review the intake, documents, and summary.
                </DialogDescription>
              </DialogHeader>
              <CaseDetailDialog
                id={id}
                onStatusChange={(next) => {
                  onStatusChange?.(id, next);
                  setDirty(true);
                }}
              />
            </DialogContent>
          </Dialog>
        );
      },
    },
  ];
};
