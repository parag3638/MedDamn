"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { buildColumns } from "./components/columns"; // ⟵ change import
import { DataTable } from "./components/data-table";
import { Loader2 } from "lucide-react";
import { getCookie } from "@/lib/cookies";
export type IntakeStatus = "reviewed" | "pending" | "closed";
export type InboxItem = {
    id: string;
    submitted_at?: string;
    patient_name?: string;
    status: IntakeStatus;
    red_flags_count?: number;   // ⟵ make sure the key matches your API
    files_count?: number;
    patient_phone?: string;
    updated_at?: string;
    complaint?: string;
    probable_dx?: string;
};

type InboxResponse = {
    rows: InboxItem[];
    meta: { total: number; page: number; pageSize: number };
};

// const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000").replace(/\/$/, "");
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "https://authbackend-cc2d.onrender.com").replace(/\/$/, "");

export default function DoctorInboxPage() {
    const [data, setData] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const router = useRouter();

    const loadInbox = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get<InboxResponse>(`${API_BASE}/doctor/inbox`, {
                params: {
                    page: 1,
                    pageSize: 50,
                    sort: "-createdAt",
                },
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCookie("csrf_token") ?? "",
                },
            });

            setData(res.data?.rows ?? []);
        } catch (e) {
            if (axios.isAxiosError(e) && e.response?.status === 401) {
                // 🚨 Session expired / unauthorized → send to login
                router.replace("/login");
                return;
            }
            setError("Failed to load inbox.");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        let mounted = true;
        (async () => { if (mounted) await loadInbox(); })();
        return () => { mounted = false; };
    }, [loadInbox]);

    // Optimistically update a single row's status in the table
    const updateRowStatus = (id: string, next: IntakeStatus) => {
        setData(prev =>
            prev.map(r => (r.id === id ? { ...r, status: next } : r))
        );
    };

    // Build columns with the callbacks the Dialog needs
    const columns = buildColumns({
        onDirtyClose: loadInbox, // reload list when dialog closes after changes
        onStatusChange: updateRowStatus, // update the row immediately on status change
    });

    return (
        <div className="hidden h-full flex-1 flex-col space-y-2 px-2 md:flex mb-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {loading ? (
                <div className="min-h-[100vh] flex justify-center">
                    <div className="flex mt-10 gap-3 text-sm text-neutral-600">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading…</span>
                    </div>
                </div>
            ) : (
                <DataTable data={data} columns={columns} />
            )}
        </div>
    );
}
