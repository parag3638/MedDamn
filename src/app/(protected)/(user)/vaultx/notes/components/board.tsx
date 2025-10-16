// components/templates/board.tsx
"use client"

import * as React from "react"
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd"
import ColumnView from "./column"
import type { Column, TemplateItem } from "@/lib/types"

type Props = {
  columns: Column[]
  itemsByColumn: Record<string, TemplateItem[]>
  onDragEnd: (itemId: string, from: Column["id"], to: Column["id"], toIndex?: number) => void
  onEditClick: (t: TemplateItem) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove?: (id: string, from: Column["id"], to: Column["id"]) => void
  onApproveToggle: (id: string) => void
  onCreateInColumn?: (columnId: Column["id"]) => void
  availableColumns?: Column[]
}

export default function Board({
  columns,
  itemsByColumn,
  onDragEnd,
  onCreateInColumn,
  availableColumns,
  onEditClick,
  onDelete,
  onDuplicate,
  onMove,
  onApproveToggle,
}: Props) {
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    const from = source.droppableId as Column["id"]
    const to = destination.droppableId as Column["id"]
    if (from === to && source.index === destination.index) return
    onDragEnd(draggableId, from, to, destination.index)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2 items-start overflow-x-auto overflow-y-visible">
        {columns.map((col) => (
          <Droppable key={col.id} droppableId={col.id} type="CARD">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                id={`column-${col.id}`}
                className={[
                  "flex flex-col rounded-2xl border shadow-sm bg-background",
                  "h-full min-h-[200px]",
                  snapshot.isDraggingOver ? "bg-accent/30" : "bg-background",
                ].join(" ")}
              >
                <ColumnView
                  column={col}
                  items={itemsByColumn[col.id] ?? []}
                  isDraggingOver={snapshot.isDraggingOver}
                  onCreateInColumn={onCreateInColumn}
                  availableColumns={availableColumns ?? columns}
                  onEditClick={onEditClick}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onMove={onMove}
                  onApproveToggle={onApproveToggle}
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  )
}
