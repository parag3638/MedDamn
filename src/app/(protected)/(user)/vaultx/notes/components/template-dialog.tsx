// components/templates/template-dialog.tsx
"use client"

import { useEffect, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import type { TemplateItem, TemplateType, TemplateContent } from "@/lib/types"

export { DialogTrigger as TemplateDialogTrigger } from "@/components/ui/dialog"

export type TemplateDialogPayload =
    | (Partial<TemplateItem> & { id: string })
    | ({ column_id: string } & {
        title: string
        type: TemplateType
        tags: string[]
        content: TemplateContent
    })

type ContentProps = {
    open: boolean
    onOpenChange: (v: boolean) => void
    template?: TemplateItem
    initialColumnId?: string
    onSubmit?: (data: TemplateDialogPayload) => void
}

/** Content-only component to be rendered inside a shared <Dialog> root. */
export function TemplateDialogContent({
    open,
    onOpenChange,
    template,
    initialColumnId = "backlog",
    onSubmit,
}: ContentProps) {
    const isEdit = !!template

    // Base fields
    const [type, setType] = useState<TemplateType>(template?.type ?? "soap")
    const [title, setTitle] = useState(template?.title ?? "")
    const [tagsStr, setTagsStr] = useState(template?.tags.join(", ") ?? "")

    const [soapS, setSoapS] = useState("")
    const [soapO, setSoapO] = useState("")
    const [soapA, setSoapA] = useState("")
    const [soapP, setSoapP] = useState("")
    const [snippetSection, setSnippetSection] = useState("")
    const [snippetText, setSnippetText] = useState("")
    const [promptSystem, setPromptSystem] = useState("")
    const [promptUser, setPromptUser] = useState("")
    const [checklistItems, setChecklistItems] = useState<{ text: string; done: boolean }[]>([])

    // hydrate/reset on open / template change
    useEffect(() => {
        if (!open) return
        if (template) {
            setType(template.type)
            setTitle(template.title)
            setTagsStr(template.tags.join(", "))
            const content = template.content as TemplateContent
            if ("soap" in content) {
                setSoapS(content.soap.S); setSoapO(content.soap.O); setSoapA(content.soap.A); setSoapP(content.soap.P)
            } else if ("snippet" in content) {
                setSnippetSection(content.snippet.section ?? ""); setSnippetText(content.snippet.text)
            } else if ("prompt" in content) {
                setPromptSystem(content.prompt.system ?? ""); setPromptUser(content.prompt.user)
            } else if ("checklist" in content) {
                setChecklistItems(content.checklist.items.map((i) => ({ text: i.text, done: i.done })))
            }
        } else {
            setType("soap")
            setTitle("")
            setTagsStr("")
            setSoapS(""); setSoapO(""); setSoapA(""); setSoapP("")
            setSnippetSection(""); setSnippetText("")
            setPromptSystem(""); setPromptUser("")
            setChecklistItems([])
        }
    }, [open, template])

    // safety: remove any leftover pointer/inert locks if closed
    useEffect(() => {
        if (open) return
        const body = document.body
        if (body.style.pointerEvents === "none") body.style.pointerEvents = ""
        document.querySelectorAll<HTMLElement>("[data-radix-scroll-locked]").forEach((el) => {
            el.style.removeProperty("pointer-events")
        })
        document.querySelectorAll<HTMLElement>("[inert]").forEach((el) => el.removeAttribute("inert"))
    }, [open])

    function parseTags(str: string): string[] {
        return str.split(",").map((t) => t.trim()).filter(Boolean)
    }
    function buildContent(): TemplateContent {
        if (type === "soap") return { soap: { S: soapS, O: soapO, A: soapA, P: soapP } }
        if (type === "snippet") return { snippet: { section: snippetSection, text: snippetText } }
        if (type === "prompt") {
            const p: any = { user: promptUser }; if (promptSystem) p.system = promptSystem
            return { prompt: p } as TemplateContent
        }
        return { checklist: { items: checklistItems.map((i) => ({ text: i.text, done: i.done })) } }
    }
    function handleSave() {
        if (!title.trim()) return
        const tags = parseTags(tagsStr)
        const content = buildContent()
        const payload = template
            ? { id: template.id, title: title.trim(), type, tags, content }
            : { column_id: initialColumnId, title: title.trim(), type, tags, content }
        onSubmit?.(payload as TemplateDialogPayload)
        onOpenChange(false)
    }

    return (
        <DialogContent className="sm:max-w-[640px] rounded-2xl">
            <DialogHeader>
                <DialogTitle>{isEdit ? "Edit Note" : "New Note"}</DialogTitle>
                <DialogDescription className="sr-only">
                    {isEdit ? "Edit the note fields and save your changes." : "Fill in the fields to create a new note."}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title" className="sr-only">Title</Label>
                    <Input id="title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tags" className="sr-only">Tags</Label>
                    <Input id="tags" placeholder="Tags (comma separated)" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} className="rounded-xl" />
                </div>

                <Tabs value={type} onValueChange={(v) => setType(v as TemplateType)} className="w-full">
                    <TabsList>
                        <TabsTrigger value="soap">SOAP</TabsTrigger>
                        <TabsTrigger value="snippet">Snippet</TabsTrigger>
                        <TabsTrigger value="prompt">Prompt</TabsTrigger>
                        <TabsTrigger value="checklist">Checklist</TabsTrigger>
                    </TabsList>

                    <TabsContent value="soap" className="pt-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1"><Label>Subjective</Label><Textarea value={soapS} onChange={(e) => setSoapS(e.target.value)} rows={3} className="rounded-xl" /></div>
                            <div className="space-y-1"><Label>Objective</Label><Textarea value={soapO} onChange={(e) => setSoapO(e.target.value)} rows={3} className="rounded-xl" /></div>
                            <div className="space-y-1"><Label>Assessment</Label><Textarea value={soapA} onChange={(e) => setSoapA(e.target.value)} rows={3} className="rounded-xl" /></div>
                            <div className="space-y-1"><Label>Plan</Label><Textarea value={soapP} onChange={(e) => setSoapP(e.target.value)} rows={3} className="rounded-xl" /></div>
                        </div>
                    </TabsContent>

                    <TabsContent value="snippet" className="pt-4 space-y-3">
                        <div className="space-y-1"><Label>Section</Label><Input value={snippetSection} onChange={(e) => setSnippetSection(e.target.value)} placeholder="e.g. History, Physical Exam" className="rounded-xl" /></div>
                        <div className="space-y-1"><Label>Text</Label><Textarea value={snippetText} onChange={(e) => setSnippetText(e.target.value)} rows={5} placeholder="Snippet text..." className="rounded-xl" /></div>
                    </TabsContent>

                    <TabsContent value="prompt" className="pt-4 space-y-3">
                        <div className="space-y-1"><Label>System (optional)</Label><Textarea value={promptSystem} onChange={(e) => setPromptSystem(e.target.value)} rows={2} placeholder="System prompt..." className="rounded-xl" /></div>
                        <div className="space-y-1"><Label>User</Label><Textarea value={promptUser} onChange={(e) => setPromptUser(e.target.value)} rows={5} placeholder="User prompt..." className="rounded-xl" /></div>
                    </TabsContent>

                    <TabsContent value="checklist" className="pt-4 space-y-3">
                        <div className="space-y-2">
                            {checklistItems.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Checkbox checked={item.done} onCheckedChange={(val) => setChecklistItems((s) => s.map((it, i) => i === idx ? { ...it, done: !!val } : it))} className="mt-1" />
                                    <Input value={item.text} onChange={(e) => setChecklistItems((s) => s.map((it, i) => i === idx ? { ...it, text: e.target.value } : it))} placeholder={`Item ${idx + 1}`} className="flex-1 rounded-xl" />
                                    <Button variant="ghost" size="icon" onClick={() => setChecklistItems((s) => s.filter((_, i) => i !== idx))} aria-label="Remove item" className="h-8 w-8 text-destructive">✕</Button>
                                </div>
                            ))}
                            <Button variant="outline" onClick={() => setChecklistItems((s) => [...s, { text: "", done: false }])} className="rounded-xl">+ Add item</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <DialogFooter className="gap-2 pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
                <Button onClick={handleSave} className="rounded-xl">Save</Button>
            </DialogFooter>
        </DialogContent>
    )
}

/** Optional wrapper for places that still want a self-contained dialog. */
export default function TemplateDialog(props: Omit<ContentProps, "open" | "onOpenChange"> & {
    open: boolean; onOpenChange: (v: boolean) => void
}) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <TemplateDialogContent {...props} />
        </Dialog>
    )
}
