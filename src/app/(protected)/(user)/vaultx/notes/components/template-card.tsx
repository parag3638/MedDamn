// components/templates/template-card.tsx
"use client"

import { Draggable } from "@hello-pangea/dnd"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit3, Copy, CheckCircle2, Trash2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ConfirmDialog } from "./confirm-dialog"
import type { Column, TemplateItem } from "@/lib/types"
import { formatUpdatedAgo, previewLine, typeLabel } from "./helpers"
import { Separator } from "@/components/ui/separator"
import { TemplateDialogTrigger } from "./template-dialog"

type Props = {
  item: TemplateItem
  index: number
  columnId: Column["id"]
  availableColumns: Column[]
  onEditClick: (t: TemplateItem) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onMove?: (id: string, from: Column["id"], to: Column["id"]) => void
  onApproveToggle: (id: string) => void
}

export default function TemplateCard({
  item,
  index,
  columnId,
  availableColumns,
  onEditClick,
  onDuplicate,
  onMove,
  onDelete,
  onApproveToggle,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isApproved = item.is_approved

  // lets the dropdown fully close before non-dialog actions run
  const afterMenuClose = (fn: () => void) => () => setTimeout(fn, 0)

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            willChange: "transform",
            transform: (provided.draggableProps.style as any)?.transform
              ? `${(provided.draggableProps.style as any).transform} translateZ(0)`
              : undefined,
            contain: "paint layout style",
          }}
          className={cn(
            "rounded-2xl border p-3 bg-card transition-[background-color] duration-150 mb-2",
            snapshot.isDragging ? "shadow-none bg-accent/40" : "shadow-sm",
          )}
        >

          <div className="flex items-start gap-2">

            <div className="ml-auto order-2" aria-hidden>
              <GripVertical className="size-4 text-muted-foreground opacity-70 group-hover:opacity-100 mb-2" />
            </div>

            <div className="flex-1 order-1 max-w-[600px]">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium leading-tight line-clamp-2 truncate xl:max-w-[120px] 2xl:max-w-[200px]">{item.title}</div>

                <TooltipProvider>
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="More actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>More actions</TooltipContent>
                    </Tooltip>

                    <DropdownMenuContent align="end" className="w-44">
                      {/* EDIT opens the central Dialog via Trigger.
                         Set the editing item BEFORE opening (onPointerDown). */}
                      {/* <DropdownMenuItem asChild>
                        <TemplateDialogTrigger asChild>
                          <button
                            type="button"
                            onSelect={() => onEditClick(item)}
                            className="flex w-full items-center text-left"
                          >
                            <Edit3 className="size-4 mr-2" /> Edit
                          </button>
                        </TemplateDialogTrigger>
                      </DropdownMenuItem> */}

                      <DropdownMenuItem onSelect={afterMenuClose(() => onDuplicate(item.id))} className="text-sm">
                        <Copy className="size-4 mr-2" /> Duplicate
                      </DropdownMenuItem>

                      {onMove ? (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <GripVertical className="size-4 mr-2" /> Move
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="p-0">
                            {availableColumns
                              .filter((c) => c.id !== columnId)
                              .map((c) => (
                                <DropdownMenuItem
                                  key={c.id}
                                  onSelect={afterMenuClose(() => onMove(item.id, columnId, c.id))}
                                  className="text-sm"
                                >
                                  {c.name}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      ) : null}

                      <DropdownMenuItem onSelect={afterMenuClose(() => onApproveToggle(item.id))} className="text-sm">
                        <CheckCircle2 className="size-4 mr-2" /> {isApproved ? "Unapprove" : "Approve"}
                      </DropdownMenuItem>

                      <Separator className="my-1" />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive text-sm"
                        onSelect={afterMenuClose(() => setConfirmOpen(true))}
                      >
                        <Trash2 className="size-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipProvider>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="rounded-full capitalize text-[11px] px-2 py-0.5">
                  {typeLabel(item.type)}
                </Badge>
                {item.tags.slice(0, 1).map((t) => (
                  <Badge key={t} variant="outline" className="rounded-full capitalize text-[11px] px-2 py-0.5">
                    {t}
                  </Badge>
                ))}
                {item.tags.length > 1 ? (
                  <Badge variant="outline" className="rounded-full text-[11px] px-2 py-0.5">{`+${item.tags.length - 1}`}</Badge>
                ) : null}
                <span className="ml-auto text-[10px] text-muted-foreground block xl:hidden">{formatUpdatedAgo(item.updated_at)}</span>
              </div>

              <div className="mt-2 text-[10px] sm:text-[11px] text-muted-foreground line-clamp-3 sm:line-clamp-4">
                {previewLine(item)}
              </div>

              <div className="mt-2 items-center gap-1.5 max-w-[400px]">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TemplateDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onPointerDown={() => onEditClick(item)}
                        >
                          <Edit3 className="size-4 mr-1" /> Edit
                        </Button>
                      </TemplateDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Edit note</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onDuplicate(item.id)}>
                        <Copy className="size-4 mr-1" /> Duplicate
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Duplicate note</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => onApproveToggle(item.id)}>
                        <CheckCircle2 className="size-4 mr-1" /> {isApproved ? "Unapprove" : "Approve"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle approved</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {/* Local confirm dialog stays here */}
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Delete note"
            description="This action cannot be undone."
            confirmLabel="Delete"
            onConfirm={() => onDelete(item.id)}
          />
        </Card>
      )}
    </Draggable>
  )
}
