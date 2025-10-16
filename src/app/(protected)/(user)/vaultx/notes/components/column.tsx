// components/templates/column.tsx
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import TemplateCard from "./template-card"
import type { Column, TemplateItem } from "@/lib/types"
import { cn } from "@/lib/utils"

type Props = {
  column: Column
  items: TemplateItem[]
  isDraggingOver?: boolean
  onEditClick: (t: TemplateItem) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove?: (id: string, from: Column["id"], to: Column["id"]) => void
  onApproveToggle: (id: string) => void
  onCreateInColumn?: (columnId: Column["id"]) => void
  availableColumns: Column[]
}

export default function ColumnView({
  column,
  items,
  isDraggingOver,
  onCreateInColumn,
  availableColumns,
  onEditClick,
  onDelete,
  onDuplicate,
  onMove,
  onApproveToggle,
}: Props) {
  return (
    <Card className="rounded-2xl shadow-sm border h-full min-h-[200px]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{column.name}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{items.length}</span>
            {onCreateInColumn ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onCreateInColumn(column.id)}
                aria-label="New note in this column"
              >
                <Plus className="size-4" />
              </Button>
            ) : null}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pb-4">
        <div className={cn("rounded-xl p-1 min-h-[8px]", isDraggingOver ? "bg-accent/30" : "bg-transparent")}>
          {items.map((it, idx) => (
            <TemplateCard
              key={it.id}
              item={it}
              index={idx}
              columnId={column.id}
              availableColumns={availableColumns}
              onEditClick={onEditClick}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onMove={onMove}
              onApproveToggle={onApproveToggle}
            />
          ))}
          {items.length === 0 ? <div className="text-xs text-muted-foreground px-2 py-4">No notes</div> : null}
        </div>
      </CardContent>
    </Card>
  )
}
