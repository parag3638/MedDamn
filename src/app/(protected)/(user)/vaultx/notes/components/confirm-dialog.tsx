// components/templates/confirm-dialog.tsx
"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ConfirmDialogProps = {
    open: boolean
    onOpenChange: (v: boolean) => void
    title?: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title = "Are you sure?",
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-2xl sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>{cancelLabel}</Button>
                    <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false) }}>{confirmLabel}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
