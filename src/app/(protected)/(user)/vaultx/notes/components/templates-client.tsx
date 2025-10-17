// components/templates/templates-client.tsx
"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import axios from "axios"
import { Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Board from "./board"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useToast } from "@/hooks/use-toast"
import type { Column, TemplateItem, TemplateType } from "@/lib/types"

import { Dialog } from "@/components/ui/dialog"
import {
    TemplateDialogContent,
    TemplateDialogTrigger,
    type TemplateDialogPayload,
} from "./template-dialog"
// import { getCookie } from "@/lib/cookies"

type Filters = {
    q: string
    type: "all" | TemplateType
    tag: "all" | string
}

export function getCookie(name: string): string | null {
    if (typeof document === "undefined") {
        console.warn("getCookie called during SSR");
        return null;
    }

    console.log("All cookies:", document.cookie); // 👀 see raw cookies

    const target = name + "=";
    const parts = document.cookie.split("; ");
    console.log("Split parts:", parts);

    for (const part of parts) {
        if (part.startsWith(target)) {
            const value = decodeURIComponent(part.split("=").slice(1).join("="));
            console.log(`Cookie found: ${name}=${value}`);
            return value;
        }
    }

    console.warn(`Cookie '${name}' not found`);
    return null;
}



export default function TemplatesClient() {
    console.log("CSRF cookie value:", getCookie("csrf_token"));


    const { toast } = useToast()
    const [columns, setColumns] = useState<Column[]>([])
    const [templates, setTemplates] = useState<TemplateItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<Filters>({ q: "", type: "all", tag: "all" })
    const [columnsLoading, setColumnsLoading] = useState(true)

    // central dialog state
    const [editing, setEditing] = useState<TemplateItem | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newDialogColumn, setNewDialogColumn] = useState<string>("backlog")

    const debouncedQ = useDebouncedValue(filters.q, 300)
    const searchRef = useRef<HTMLInputElement>(null)

    // const API_URL = "http://localhost:9000/templates"
    const API_URL = "https://authbackend-cc2d.onrender.com/templates"

    const DEFAULT_COLUMNS = [
        { id: "backlog", name: "Backlog" },
        { id: "drafting", name: "Drafting" },
        { id: "clinical", name: "Clinical Review" },
        { id: "approved", name: "Approved (Ready)" },
    ]

    const cardActions = {
        onEditClick: (t: TemplateItem) => { setEditing(t); setDialogOpen(true) },
        onDelete: handleDelete,
        onDuplicate: handleDuplicate,
        onMove: handleMove,
        onApproveToggle: handleApproveToggle,
    }

    useEffect(() => {
        async function loadColumns() {
            try {
                setColumnsLoading(true);

                const res = await axios.get(`${API_URL}/columns`, { withCredentials: true });

                const cols = Array.isArray(res.data?.columns) ? res.data.columns : [];
                cols.sort((a: any, b: any) => (a?.position ?? 0) - (b?.position ?? 0));
                setColumns(cols as Column[]);
            } catch (err: any) {
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    // 🚨 session expired → redirect
                    window.location.href = "/login"; // or router.replace("/login")
                    return;
                }
                console.error(err);
                toast({
                    title: "Failed to load columns",
                    description: err.message,
                });
            } finally {
                setTimeout(() => setColumnsLoading(false), 500);
            }
        }
        loadColumns();
    }, []);


    useEffect(() => {
        async function loadTemplates() {
            setLoading(true);
            try {
                const params: any = {};
                if (debouncedQ) params.q = debouncedQ;
                if (filters.type !== "all") params.type = filters.type;
                if (filters.tag !== "all") params.tag = filters.tag;

                const res = await axios.get(`${API_URL}`, {
                    params,
                    withCredentials: true,
                });

                const items = Array.isArray(res.data?.items) ? res.data.items : [];
                setTemplates(items as TemplateItem[]);
            } catch (err: any) {
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    // 🚨 unauthorized → redirect to login
                    window.location.href = "/login"; // or router.replace("/login")
                    return;
                }
                console.error(err);
                toast({
                    title: "Failed to load notes",
                    description: err.message,
                });
            } finally {
                setLoading(false);
            }
        }
        loadTemplates();
    }, [debouncedQ, filters.type, filters.tag]);


    const availableTags = useMemo(() => {
        const q = debouncedQ.trim().toLowerCase()
        const set = new Set<string>()
        templates.forEach((t) => {
            const matchesQ = q ? t.title.toLowerCase().includes(q) : true
            const matchesType = filters.type === "all" ? true : t.type === filters.type
            if (matchesQ && matchesType) t.tags.forEach((tag) => set.add(tag))
        })
        return Array.from(set).sort((a, b) => a.localeCompare(b))
    }, [templates, debouncedQ, filters.type])

    const itemsByColumn = useMemo(() => {
        const byCol: Record<string, TemplateItem[]> = {}
        columns.forEach((c) => (byCol[c.id] = []))
        templates.forEach((t) => {
            if (!byCol[t.column_id]) return
            const qMatch = debouncedQ.trim() ? t.title.toLowerCase().includes(debouncedQ.trim().toLowerCase()) : true
            const typeMatch = filters.type === "all" ? true : t.type === filters.type
            const tagMatch = filters.tag === "all" ? true : t.tags.includes(filters.tag)
            if (!qMatch || !typeMatch || !tagMatch) return
            byCol[t.column_id].push(t)
        })
        Object.values(byCol).forEach((list) => list.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)))
        return byCol
    }, [templates, debouncedQ, filters.type, filters.tag, columns])

    async function handleDragEnd(itemId: string, from: string, to: string) {
        if (from === to) return;

        const original = templates;
        setTemplates(prev => prev.map(t => (t.id === itemId ? { ...t, column_id: to } : t)));

        try {
            const res = await axios.post(
                `${API_URL}/${itemId}/move`,
                { to_column_id: to },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": getCookie("csrf_token") ?? "",
                    },
                    withCredentials: true,
                }
            );

            const updated = res.data.item as TemplateItem;
            setTemplates(prev => prev.map(t => (t.id === updated.id ? updated : t)));
        } catch (err: any) {
            // rollback on error
            setTemplates(original);

            // redirect on unauthorized
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                window.location.href = "/login"; // or router.replace("/login")
                return;
            }

            toast({ title: "Move failed", description: err.message });
        }
    }


    async function handleSubmitFromDialog(payload: TemplateDialogPayload) {
        if ("id" in payload) {
            // UPDATE
            try {
                const res = await axios.post(
                    API_URL,
                    {
                        title: payload.title,
                        type: payload.type,
                        tags: payload.tags,
                        content: payload.content,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-Token": getCookie("csrf_token") ?? "",
                        },
                        withCredentials: true,
                    }
                );
                const updated = res.data.item as TemplateItem;
                setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
                toast({ title: "Note updated" });
            } catch (err: any) {
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    window.location.href = "/login"; // or router.replace("/login")
                    return;
                }
                toast({ title: "Update failed", description: err.message });
            }
        } else {
            // CREATE
            try {
                const res = await axios.post(
                    `${API_URL}`,
                    {
                        column_id: payload.column_id,
                        title: payload.title,
                        type: payload.type,
                        tags: payload.tags,
                        content: payload.content,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-Token": getCookie("csrf_token") ?? "",
                        },
                        withCredentials: true,
                    }
                );
                const created = res.data.item as TemplateItem;
                setTemplates((prev) => [created, ...prev]);
                const colName = columns.find((c) => c.id === payload.column_id)?.name ?? "Backlog";
                toast({ title: "Note created", description: `Added to ${colName}` });
            } catch (err: any) {
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    window.location.href = "/login"; // or router.replace("/login")
                    return;
                }
                toast({ title: "Create failed", description: err.message });
            }
        }
    }


    async function handleDuplicate(id: string) {
        try {
            const res = await axios.post(
                `${API_URL}/${id}/duplicate`,
                {}, // body (empty in this case)
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": getCookie("csrf_token") ?? "",
                    },
                    withCredentials: true,
                }
            );

            const dupe = res.data.item as TemplateItem;
            setTemplates((prev) => [dupe, ...prev]);
            toast({ title: "Note duplicated" });
        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                window.location.href = "/login"; // or router.replace("/login") in Next.js
                return;
            }
            toast({ title: "Duplicate failed", description: err.message });
        }
    }


    async function handleMove(id: string, from: string, to: string) {
        if (from === to) return
        await handleDragEnd(id, from, to)
    }

    async function handleDelete(id: string) {
        try {
            const res = await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    "X-CSRF-Token": getCookie("csrf_token") ?? "",
                },
                withCredentials: true,
            });

            if (res.status === 200 && res.data?.item?.id) {
                setTemplates((prev) => prev.filter((t) => t.id !== res.data.item.id));
            } else {
                setTemplates((prev) => prev.filter((t) => t.id !== id));
            }

            toast({ title: "Note deleted" });
        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                // 🚨 unauthorized → redirect to login
                window.location.href = "/login"; // or router.replace("/login")
                return;
            }
            toast({ title: "Delete failed", description: err.message });
        }
    }


    async function handleApproveToggle(id: string) {
        const tmpl = templates.find((t) => t.id === id);
        if (!tmpl) return;

        try {
            const res = await axios.patch(
                `${API_URL}/${id}`,
                { is_approved: !tmpl.is_approved },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": getCookie("csrf_token") ?? "",
                    },
                    withCredentials: true,
                }
            );

            const updated = res.data.item as TemplateItem;
            setTemplates((prev) =>
                prev.map((t) => (t.id === updated.id ? updated : t))
            );
        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                // 🚨 unauthorized → redirect to login
                window.location.href = "/login"; // or router.replace("/login") if using Next.js router
                return;
            }

            toast({ title: "Approve failed", description: err.message });
        }
    }


    // 👇 LIFT the Dialog to wrap EVERYTHING, so ALL triggers are inside it.
    return (
        <Dialog
            open={dialogOpen}
            onOpenChange={(v) => {
                setDialogOpen(v)
                if (!v) setEditing(null)
            }}
        >
            <section className="flex flex-col gap-4 px-2">
                <header className="flex flex-col gap-3 hidden md:block ">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex-1 relative">
                            <Input
                                ref={searchRef}
                                value={filters.q}
                                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                                placeholder="Search by title..."
                                className="pl-9 h-8 w-[150px] lg:w-[250px]"
                                aria-label="Search templates by title"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        </div>

                        <Select
                            value={filters.type}
                            onValueChange={(v) => setFilters((f) => ({ ...f, type: v as Filters["type"], tag: "all" }))}
                        >
                            <SelectTrigger className="w-[100px] rounded-lg">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All types</SelectItem>
                                <SelectItem value="soap">SOAP</SelectItem>
                                <SelectItem value="snippet">Snippet</SelectItem>
                                <SelectItem value="prompt">Prompt</SelectItem>
                                <SelectItem value="checklist">Checklist</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filters.tag} onValueChange={(v) => setFilters((f) => ({ ...f, tag: v as Filters["tag"] }))}>
                            <SelectTrigger className="w-[100px] rounded-lg">
                                <SelectValue placeholder="Tag" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All tags</SelectItem>
                                {availableTags.map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* New Note trigger is now safely inside the Dialog root */}
                        <TemplateDialogTrigger asChild>
                            <Button
                                onPointerDown={() => { setEditing(null); setNewDialogColumn("backlog") }}
                                className="rounded-lg p-4"
                            >
                                <Plus className="size-4" /> New Note
                            </Button>
                        </TemplateDialogTrigger>
                    </div>
                    <Separator className="mt-3" />
                </header>

                {(columnsLoading || loading) ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-2 items-start overflow-x-auto overflow-y-visible">
                        {(columns.length ? columns : DEFAULT_COLUMNS).map((col) => (
                            <div key={"id" in col ? col.id : col} className="rounded-2xl border bg-background shadow-sm p-3">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                                        {"name" in col ? (
                                            <div className="text-sm font-medium text-muted-foreground">{col.name}</div>
                                        ) : (
                                            <div className="h-4 w-24 bg-muted rounded" />
                                        )}
                                    </div>
                                    <div className="h-4 w-8 bg-muted rounded-full" />
                                </div>

                                <div className="space-y-2">
                                    <div className="rounded-xl border bg-card p-3 shadow-sm">
                                        <div className="h-4 w-3/5 bg-muted rounded mb-2" />
                                        <div className="h-3 w-4/5 bg-muted rounded mb-1.5" />
                                        <div className="h-3 w-2/5 bg-muted rounded" />
                                    </div>
                                    <div className="rounded-xl border bg-card p-3 shadow-sm">
                                        <div className="h-4 w-2/3 bg-muted rounded mb-2" />
                                        <div className="h-3 w-3/4 bg-muted rounded mb-1.5" />
                                        <div className="h-3 w-1/3 bg-muted rounded" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ScrollArea className="w-full">
                        <Board
                            columns={columns}
                            itemsByColumn={itemsByColumn}
                            onDragEnd={handleDragEnd}
                            onCreateInColumn={(colId) => {
                                setEditing(null)
                                setNewDialogColumn(colId)
                                setDialogOpen(true)
                            }}
                            availableColumns={columns}
                            {...cardActions}
                        />
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                )}
            </section>

            {/* Single shared content mounted under the same Dialog root */}
            <TemplateDialogContent
                open={dialogOpen}
                onOpenChange={(v) => {
                    setDialogOpen(v)
                    if (!v) setEditing(null)
                }}
                template={editing ?? undefined}
                initialColumnId={editing ? editing.column_id : newDialogColumn}
                onSubmit={async (payload) => {
                    await handleSubmitFromDialog(payload)
                    setDialogOpen(false)
                    setEditing(null)
                }}
            />
        </Dialog>
    )
}
