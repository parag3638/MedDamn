"use client"

import { Cross2Icon, DownloadIcon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import * as React from "react"
import { statuses } from "../data/data";

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  // const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000/doctor";
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "https://authbackend-cc2d.onrender.com/doctor";

  // ------- helpers -------
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const rowsToCSV = () => {
    const cols = table.getAllLeafColumns().filter(c => c.getIsVisible());
    const headers = cols.map(c => c.id);
    const lines = [
      headers.join(","),
      ...table.getRowModel().rows.map(r =>
        headers.map(h => {
          const col = cols.find(c => c.id === h)!;
          // getValue respects accessor
          return esc(r.getValue(col.id));
        }).join(",")
      )
    ];
    return lines.join("\n");
  };

  const downloadBlob = (csv: string, name = "inbox-export.csv") => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const makeFilename = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const ts = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
    return `inbox-export-${ts}.csv`;
  };

  // ------- Export click -------
  const onExport = async () => {
    // Gather current UI filters/sort
    const nameFilter = (table.getColumn("patient_name")?.getFilterValue() as string) || "";
    const statusFilterRaw = table.getColumn("status")?.getFilterValue() as string[] | string | undefined;
    const sorting = table.getState().sorting?.[0]; // single sort column UI

    // If multiple statuses are selected, API can’t express that → do client export
    const statusParam =
      Array.isArray(statusFilterRaw) ? (statusFilterRaw.length === 1 ? statusFilterRaw[0] : undefined)
        : (typeof statusFilterRaw === "string" ? statusFilterRaw : undefined);

    try {
      // Try API first if a single status (or none). Adjust the path if your API is mounted elsewhere.
      const url = new URL(`${apiBase}/inbox.csv`, window.location.origin);
      if (statusParam) url.searchParams.set("status", statusParam);
      if (nameFilter) url.searchParams.set("q", nameFilter);
      if (sorting?.id) {
        url.searchParams.set("sortBy", String(sorting.id));
        url.searchParams.set("sortDir", sorting.desc ? "desc" : "asc");
      }
      // big page to export more rows
      url.searchParams.set("page", "1");
      url.searchParams.set("pageSize", "5000");

      const resp = await fetch(url.toString(), {
        headers: { Accept: "text/csv" },
        credentials: "include",
      });

      // ⬇️ handle unauthorized first
      if (resp.status === 401) {
        window.location.href = "/login";
        return; // stop
      }

      if (!resp.ok || !resp.headers.get("content-type")?.includes("text/csv")) {
        throw new Error(`CSV API failed: ${resp.status}`);
      }

      const csv = await resp.text();
      downloadBlob(csv, makeFilename());
    } catch (e) {
      // Fallback: export what’s currently visible in the table
      const csv = rowsToCSV();
      downloadBlob(csv, makeFilename());
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter by patient name..."
          value={(table.getColumn("patient_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("patient_name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex space-x-2">
        <DataTableViewOptions table={table} />
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
          onClick={onExport} // ← hook up export
        >
          <DownloadIcon className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  )
}

