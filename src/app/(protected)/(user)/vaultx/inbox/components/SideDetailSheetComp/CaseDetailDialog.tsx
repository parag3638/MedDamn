"use client";

import * as React from "react";
import useSWR from "swr";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle, } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { RefreshCcw, CheckCircle2, XCircle, FileText, File, } from "lucide-react";
import { getCookie } from "@/lib/cookies";

export type IntakeStatus = "pending" | "reviewed" | "closed";

export interface CaseDetailDialogProps {
  id: string;
  onStatusChange?: (next: IntakeStatus) => void;
}

type TranscriptRole = "patient" | "agent" | "doctor";

type BackendTranscript = {
  role: TranscriptRole;
  content: string;
  created_at: string;
};

type BackendDocument = {
  id: string;
  file_name: string;
  mime_type: string | null;
  storage_path: string | null;
  created_at: string;
};

type BackendSummary =
  | {
    soap?: {
      subjective?: string;
      objective?: string;
      assessment?: Array<{
        condition?: string;
        rationale?: string;
      }>;
      plan?: string[];
    };
    ddx?: Array<{
      condition: string;
      likelihood?: number;
      rationale?: string;
    }>;
    icd10_codes?: string[];
    red_flags?: Array<{ flag: string; reason?: string }>;
    created_at?: string;
    updated_at?: string;
  }
  | null;

type BackendSession = {
  id: string;
  status: IntakeStatus;
  submitted_at?: string;
  closed_at?: string | null;
  patient: {
    name?: string;
    dob?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  transcript: BackendTranscript[];
  documents: BackendDocument[];
  summary: BackendSummary;
};

type BackendResponse = { session: BackendSession };

const API = (
  // process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000"
  process.env.NEXT_PUBLIC_API_BASE || "https://authbackend-cc2d.onrender.com"
).replace(/\/$/, "");

const fetcher = async (url: string): Promise<BackendResponse> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    let msg = "Failed to fetch intake detail";
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
      console.log("Non-JSON error response");
    }
    throw new Error(msg);
  }
  return res.json();
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function shortId(id?: string) {
  if (!id) return "—";
  return id.slice(0, 8);
}

export function StatusBadge({
  status,
  className,
}: {
  status?: IntakeStatus | string;
  className?: string;
}) {
  const s = String(status || "unknown").toLowerCase();

  const style =
    s === "reviewed"
      ? "bg-orange-200 text-orange-700"
      : s === "pending"
        ? "bg-amber-200 text-amber-700"
        : s === "closed"
          ? "bg-green-200 text-green-700"
          : "bg-gray-200 text-gray-700";

  const label =
    s === "reviewed"
      ? "Reviewed"
      : s === "pending"
        ? "Pending"
        : s === "closed"
          ? "Closed"
          : "Unknown";

  return (
    <Badge
      variant="outline"
      className={cn("font-medium rounded-xl p-1 px-2", style, className)}
    >
      {label}
    </Badge>
  );
}

function ExpandableText({
  text,
  lines = 5,
  inline = false,
}: { text?: string; lines?: number; inline?: boolean }) {
  const [expanded, setExpanded] = React.useState(false);
  const [isClamped, setIsClamped] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | HTMLSpanElement | null>(null);

  // recompute clamping when text/lines/expanded changes or on resize
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Apply clamp styles only when not expanded (matches actual render)
    if (!expanded) {
      // Force a reflow after styles apply
      requestAnimationFrame(() => {
        // If scrollHeight > clientHeight, it's clamped
        const clamped = el.scrollHeight > el.clientHeight + 1; // +1 tolerance
        setIsClamped(clamped);
      });
    } else {
      setIsClamped(false);
    }
  }, [text, lines, expanded]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !ref.current) return;
    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(() => {
        // re-check clamp on resize
        const el = ref.current;
        if (!el) return;
        if (!expanded) {
          const clamped = el.scrollHeight > el.clientHeight + 1;
          setIsClamped(clamped);
        }
      });
      ro.observe(ref.current);
    } catch {
      // ignore if ResizeObserver not available
    }
    return () => {
      if (ro && ref.current) ro.unobserve(ref.current);
    };
  }, [expanded]);

  if (!text) return <span className="text-muted-foreground">—</span>;

  const Container: any = inline ? "span" : "div";
  const Block: any = inline ? "span" : "div";

  const clampStyle = expanded
    ? {}
    : {
      display: "-webkit-box",
      WebkitLineClamp: lines,
      WebkitBoxOrient: "vertical" as const,
      overflow: "hidden",
    };

  return (
    <Container className={cn("text-sm break-words", inline && "align-top")}>
      <Block ref={ref} className={!inline ? "whitespace-pre-wrap" : ""} style={clampStyle}>
        {text}
      </Block>

      {(isClamped || expanded) && (
        <button
          type="button"
          className={cn(
            "mt-1 text-xs font-medium underline text-muted-foreground hover:text-foreground",
            inline && "ml-1"
          )}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </Container>
  );
}


export default function CaseDetailDialog(props: CaseDetailDialogProps) {
  const { id, onStatusChange } = props;
  const { toast } = useToast();
  const [regenerating, setRegenerating] = React.useState(false);
  // Ensure loader shows for at least 3 seconds from first render
  const [minDelayPassed, setMinDelayPassed] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMinDelayPassed(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const url = id ? `${API}/doctor/intake/${id}` : null;

  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<BackendResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  const uiLoading = isLoading || !minDelayPassed;


  const session = data?.session;
  const status: IntakeStatus | undefined = session?.status;

  // Helper to regenerate summary using the new API payload
  const handleRegenerate = async () => {
    try {
      setRegenerating(true);
      const res = await fetch(`${API}/doctor/intake/${id}/summary/regenerate`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCookie("csrf_token") ?? "",
        },
        body: JSON.stringify({ include_ocr: true }),
      });

      // ⬇️ check unauthorized first
      if (res.status === 401) {
        window.location.href = "/login"; // or router.replace("/login") in Next.js
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to regenerate summary");
      }

      await mutate(); // refetch updated details
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Unable to regenerate summary",
        description: e?.message || "Please try again.",
      });
    } finally {
      setRegenerating(false);
    }
  };

  // Update the status optimistically
  const optimisticSetStatus = async (
    next: IntakeStatus,
    endpoint: "review" | "close"
  ) => {
    if (!session || !data) return;
    const prev = data;
    const optimistic: BackendResponse = {
      session: { ...session, status: next },
    };
    mutate(optimistic, { revalidate: false, populateCache: true });
    onStatusChange?.(next);

    try {
      const res = await fetch(`${API}/doctor/intake/${id}/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCookie("csrf_token") ?? "",
        },
      });

      // ⬇️ Handle unauthorized: rollback + redirect
      if (res.status === 401) {
        mutate(prev, { revalidate: false, populateCache: true });
        onStatusChange?.(prev.session.status);
        window.location.href = "/login"; // or router.replace("/login")
        return;
      }

      if (!res.ok) throw new Error(`Failed to ${endpoint} case`);
      await mutate();
    } catch (e: any) {
      mutate(prev, { revalidate: false, populateCache: true });
      onStatusChange?.(prev.session.status);
      toast({
        variant: "destructive",
        title: "Action failed",
        description: e?.message || "Please try again.",
      });
    }
  };


  const handleReviewed = async () => {
    if (status !== "pending") return;
    await optimisticSetStatus("reviewed", "review");
  };

  const handleClose = async () => {
    if (status === "closed") return;
    // const ok =
    //   typeof window !== "undefined"
    //     ? window.confirm("Close this case?")
    //     : true;
    // if (!ok) return;
    await optimisticSetStatus("closed", "close");
  };

  // Fetch a signed URL for a document and open it
  const handleDocClick = async (docId: string) => {
    try {
      const res = await fetch(`${API}/doctor/intake/${id}/documents/${docId}/url`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": getCookie("csrf_token") ?? "",
        },
      });

      // ⬇️ Handle unauthorized first
      if (res.status === 401) {
        window.location.href = "/login"; // or router.replace("/login") in Next.js
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch document URL");

      const { url } = await res.json();
      if (url) {
        window.open(url, "_blank");
      } else {
        throw new Error("Missing URL");
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error fetching document",
        description: e?.message || "Please try again.",
      });
    }
  };


  const SOAP = session?.summary?.soap;
  const DDx = session?.summary?.ddx || [];
  const ICD10 = session?.summary?.icd10_codes || [];
  const redFlags = session?.summary?.red_flags || [];
  const transcript = session?.transcript || [];
  const documents = session?.documents || [];


  const renderSummarySkeleton = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
      {/* SOAP skeleton (left column, spans 3 rows) */}
      <Card className="md:row-span-3">
        <CardHeader>
          <Skeleton className="h-5 w-24" /> {/* SOAP title */}
        </CardHeader>
        <CardContent className="space-y-4 overflow-auto">
          {/* Subjective */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />      {/* label */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          {/* Objective */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />      {/* label */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          {/* Assessment */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />      {/* label */}
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-3 w-4/6" />
          </div>
          {/* Plan */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />      {/* label */}
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </CardContent>
      </Card>

      {/* Right column: DDx */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-3/6" />
        </CardContent>
      </Card>

      {/* Right column: ICD-10 */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-20" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </CardContent>
      </Card>

      {/* Right column: Red Flags */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-10 w-full" /> {/* alert block feel */}
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  );


  const renderSOAPField = (label: string, value?: string) => (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <ExpandableText text={value} lines={5} />
    </div>
  );


  const renderHeader = () => {
    if (uiLoading) {
      return (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Failed to load</h2>
            <p className="text-sm text-muted-foreground">
              Please close and try again.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={"pending"} />
          </div>
        </div>
      );
    }
    const submittedAt = session?.submitted_at;
    const patientName = session?.patient?.name || "Unknown Patient";
    const idShort = shortId(session?.id);
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{`Case #${idShort}`}</h2>
          <p className="text-sm text-muted-foreground">
            {`${formatDate(submittedAt)} • ${patientName || "Unknown Patient"
              }`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {status && <StatusBadge status={status} />}
          <Button
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            <RefreshCcw
              className={cn("mr-2 h-4 w-4", regenerating && "animate-spin")}
            />
            {regenerating ? "Regenerating..." : "Regenerate Summary"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReviewed}
            disabled={status !== "pending"}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark Reviewed
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleClose}
            disabled={status === "closed"}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Close Case
          </Button>
        </div>
      </div>
    );
  };

  // Render single row in Meta section
  const MetaRow = ({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) => {
    return (
      <div className="rounded-md border p-3">
        <div className="text-xs font-medium text-muted-foreground">
          {label}
        </div>
        <div className={(label === "Status" ? "truncate text-sm capitalize" : "truncate text-sm")}>{value}</div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderHeader()}
      <Separator />
      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="meta">Meta</TabsTrigger>
        </TabsList>

        {/* SUMMARY TAB */}
        <TabsContent value="summary" className="mt-4">
          {uiLoading ? (
            renderSummarySkeleton()
          ) : error ? (
            <div className="text-sm text-destructive">
              Failed to load summary.
            </div>
          ) : (
            <ScrollArea className="h-[540px] px-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* SOAP CARD */}
                <Card className="md:row-span-3">
                  <CardHeader>
                    <CardTitle className="text-base">SOAP</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 overflow-auto">

                    {renderSOAPField("Subjective (S)", SOAP?.subjective)}
                    {renderSOAPField("Objective (O)", SOAP?.objective)}

                    {/* Assessment */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">
                        Assessment (A)
                      </div>
                      {SOAP?.assessment && SOAP.assessment.length ? (
                        <ul className="list-disc pl-5 text-sm">
                          {SOAP.assessment.map((a, idx) => (
                            <li key={idx}>
                              <span className="font-medium">
                                {a.condition}
                              </span>
                              {a.rationale
                                ? ` — ${a.rationale}`
                                : ""}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          —
                        </div>
                      )}
                    </div>
                    {/* Plan */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">
                        Plan (P)
                      </div>
                      {SOAP?.plan && SOAP.plan.length ? (
                        <ul className="list-disc pl-5 text-sm">
                          {SOAP.plan.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          —
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* DDx CARD */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Differential Dx
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {DDx.length ? (
                      <ul className="list-disc pl-5 text-sm">
                        {DDx.map((d, i) => (
                          <li key={i}>
                            <span className="font-medium">
                              {d.condition}
                            </span>
                            {typeof d.likelihood === "number" ? (
                              <>
                                {" "}
                                (
                                {Math.round(
                                  d.likelihood * 100
                                )}
                                %)
                              </>
                            ) : null}
                            {d.rationale
                              ? ` — ${d.rationale}`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        —
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* ICD-10 CARD */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      ICD-10
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ICD10.length ? (
                      <ul className="list-disc pl-5 text-sm">
                        {ICD10.map((code, i) => (
                          <li key={i}>{code}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        —
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* RED FLAGS CARD */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Red Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {redFlags.length ? (
                      <Alert variant="destructive">
                        <AlertTitle>Attention</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc pl-5 text-sm">
                            {redFlags.map((rf, i) => (
                              <li key={i}>
                                <span className="font-medium">
                                  {rf.flag}
                                </span>
                                {rf.reason
                                  ? ` — ${rf.reason}`
                                  : ""}
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        —
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* TRANSCRIPT TAB */}
        <TabsContent value="transcript" className="mt-4">
          {uiLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-5/6" />
              <Skeleton className="h-16 w-2/3" />
            </div>
          ) : error ? (
            <div className="text-sm text-destructive">
              Failed to load transcript.
            </div>
          ) : (
            <ScrollArea className="h-[540px] pr-2">
              <div className="space-y-3">
                {transcript.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No transcript available.
                  </div>
                )}
                {transcript.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-md border bg-secondary/50 p-3"
                    aria-label={`Transcript message from ${m.role}`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        aria-label={`Role: ${m.role}`}
                        className={
                          `capitalize font-medium rounded-xl p-1 px-2 ` +
                          (m.role === "patient"
                            ? "bg-blue-100 text-blue-700"
                            : m.role === "agent"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-100 text-gray-700")
                        }
                      >
                        {m.role}
                      </Badge>
                      {m.created_at ? (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(m.created_at)}
                        </span>
                      ) : null}
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* DOCUMENTS TAB */}
        <TabsContent value="documents" className="mt-4">
          {uiLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-5/6" />
              <Skeleton className="h-10 w-2/3" />
            </div>
          ) : error ? (
            <div className="text-sm text-destructive">
              Failed to load documents.
            </div>
          ) : (
            <ScrollArea className="h-[540px] pr-2">
              <ul className="divide-y">
                {documents.length === 0 && (
                  <li className="py-3 text-sm text-muted-foreground">
                    No documents.
                  </li>
                )}
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {doc.mime_type?.includes("pdf") ? (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <File className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="min-w-0">
                        <span
                          onClick={() => handleDocClick(doc.id)}
                          className="truncate text-sm underline cursor-pointer"
                        >
                          {doc.file_name ||
                            doc.storage_path ||
                            "file"}
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {doc.mime_type || "file"}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </TabsContent>

        {/* META TAB */}
        <TabsContent value="meta" className="mt-4">
          {uiLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          ) : error ? (
            <div className="text-sm text-destructive">
              Failed to load metadata.
            </div>
          ) : (
            <ScrollArea className="h-[540px] pr-2">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <MetaRow
                  label="Status"
                  value={status || "—"}
                />
                <MetaRow
                  label="Created"
                  value={formatDate(session?.submitted_at)}
                />
                <MetaRow
                  label="Updated"
                  value={formatDate(
                    session?.summary?.updated_at ||
                    session?.closed_at ||
                    session?.submitted_at
                  )}
                />
                <MetaRow
                  label="Patient Email"
                  value={session?.patient?.email || "—"}
                />
                <MetaRow
                  label="Patient Phone"
                  value={session?.patient?.phone || "—"}
                />
                <MetaRow
                  label="Patient DOB"
                  value={session?.patient?.dob || "—"}
                />
                <MetaRow
                  label="Case ID"
                  value={session?.id || "—"}
                />
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
      <p className="text-xs text-muted-foreground">
        Handle PHI responsibly.
      </p>
    </div>
  );
}
