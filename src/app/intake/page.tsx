"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Send, CheckCircle, Loader2, FileText, Shield, Paperclip, X, House } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { DatePickerField } from "@/components/ui/datepicker";
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"

// Message type for chat transcript
type Message = {
  role: "patient" | "assistant" | "system"
  content: string
}

export default function PatientIntakePage() {

  const router = useRouter()


  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [showSkeletons, setShowSkeletons] = useState(false)

  // File upload state
  const [files, setFiles] = useState<File[]>([])

  const [patientName, setPatientName] = useState("")
  const [patientDob, setPatientDob] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [patientEmail, setPatientEmail] = useState("")

  const todayIso = new Date().toISOString().slice(0, 10);

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [successSessionId, setSuccessSessionId] = useState<string | null>(null)

  // Session tracking
  const [startedAt] = useState(new Date().toISOString())

  // Refs for auto-scroll and abort controller
  const chatEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const { toast } = useToast()
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://authbackend-cc2d.onrender.com"
  // const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:9000"

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initial greeting from virtual nurse
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Hello! I'm your virtual nurse assistant. I'm here to help gather your intake information. Let's start with your name and what brings you in today.",
        },
      ])
    }
  }, [messages.length])

  /**
   * Handle sending a patient message and streaming the agent's response
   */
  const handleSend = async () => {
    if (!input.trim() || streaming) return

    const userMessage: Message = {
      role: "patient",
      content: input.trim(),
    }

    // Add user message to transcript
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setStreaming(true)
    // show skeleton placeholders while waiting for the first token
    setShowSkeletons(true)

    // Do NOT create an empty assistant placeholder here.
    // We'll append the assistant message when the first token arrives so
    // no empty chat bubble appears before the agent actually responds.

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController()

      // POST to agent-turn endpoint with history + user_message (matches backend validation)
      const history = updatedMessages.slice(0, -1) // all messages except the new user message
      const user_message = userMessage.content

      const url = `${API_BASE}/intake/agent-turn`
      console.debug("[agent-turn] POST ->", url)
      console.debug("[agent-turn] history length", history.length, "user_message length", user_message.length)

      // POST to agent-turn endpoint (streaming response expected)
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, user_message }),
        signal: abortControllerRef.current.signal,
      })

      // Read SSE stream with a buffered parser that handles event: and data: lines
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      let buffer = ""
      let finished = false

      while (!finished) {
        const { done, value } = await reader.read()
        if (done) {
          // process any remaining buffer then break
          if (buffer.trim()) {
            // fall through to processing below
          } else {
            break
          }
        }

        if (value) {
          buffer += decoder.decode(value, { stream: true })
        }

        // Split into complete SSE blocks separated by double newline
        const parts = buffer.split("\n\n")
        // The last part may be incomplete — keep it in buffer
        buffer = parts.pop() || ""

        for (const part of parts) {
          const lines = part.split(/\r?\n/)
          let eventType = "message"
          const dataLines: string[] = []

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue
            if (trimmed.startsWith("event:")) {
              eventType = trimmed.slice(6).trim()
            } else if (trimmed.startsWith("data:")) {
              dataLines.push(trimmed.slice(5).trim())
            }
          }

          const dataStr = dataLines.join("\n")

          // Handle event types from backend: token, done, error
          if (eventType === "token") {
            try {
              const obj = JSON.parse(dataStr)
              const text = obj?.text
              if (text && typeof text === "string") {
                // once the first token arrives, hide the skeletons
                setShowSkeletons(false)
                // If the last message is already the assistant, append the
                // token. Otherwise push a new assistant message (first token).
                setMessages((prev) => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  if (last && last.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: (last.content || "") + text,
                    }
                  } else {
                    updated.push({ role: "assistant", content: text })
                  }
                  return updated
                })
                // scroll to bottom for live feeling
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 0)
              }
            } catch (e) {
              // ignore parse errors for keepalives
            }
          } else if (eventType === "done") {
            // finished — stop showing skeletons
            setShowSkeletons(false)
            finished = true
            break
          } else if (eventType === "error") {
            let errMsg = "Unknown error"
            try {
              const obj = JSON.parse(dataStr)
              errMsg = obj?.error || obj?.message || JSON.stringify(obj)
            } catch {
              errMsg = dataStr
            }
            toast({ title: "Agent Error", description: String(errMsg), variant: "destructive" })
            // stop showing skeletons and remove incomplete assistant message only if it's present and empty
            setShowSkeletons(false)
            setMessages((prev) => {
              if (prev.length === 0) return prev
              const last = prev[prev.length - 1]
              if (last && last.role === "assistant" && (last.content || "").trim().length === 0) {
                return prev.slice(0, -1)
              }
              return prev
            })
            finished = true
            break
          } else {
            // ignore other events
          }
        }
      }
    } catch (error: unknown) {
      // Handle errors (network issues, aborts, etc.)
      if (error instanceof Error && error.name === "AbortError") {
        // User cancelled - silent
        return
      }

      toast({
        title: "Connection Error",
        description: "Unable to reach the virtual nurse. Please try again.",
        variant: "destructive",
      })

      // stop showing skeletons and remove incomplete assistant message only if it's present and empty
      setShowSkeletons(false)
      setMessages((prev) => {
        if (prev.length === 0) return prev
        const last = prev[prev.length - 1]
        if (last && last.role === "assistant" && (last.content || "").trim().length === 0) {
          return prev.slice(0, -1)
        }
        return prev
      })
    } finally {
      setStreaming(false)
      abortControllerRef.current = null
    }
  }

  /**
   * Handle file selection
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  /**
   * Remove a selected file
   */
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  /**
   * Submit the full intake (transcript + files)
   */

  const handleSubmit = async () => {
    if (messages.length === 0 && files.length === 0) return;
    setSubmitting(true);

    try {
      // Build the logical payload (no documents yet; server will create from files)
      const payload: any = {
        transcript: messages.map((m) => ({
          role: m.role === "assistant" ? "agent" : m.role,
          content: m.content,
        })),
        summary: { soap: null, ddx: [], icd10_codes: [], red_flags: [] },
      };
      if (patientName?.trim()) payload.patient_name = patientName.trim();
      if (patientDob?.trim()) payload.patient_dob = patientDob.trim();
      if (patientPhone?.trim()) payload.patient_phone = patientPhone.trim();
      if (patientEmail?.trim()) payload.patient_email = patientEmail.trim();

      let resp;
      if (files.length > 0) {
        const fd = new FormData();
        fd.append("payload", JSON.stringify(payload));
        files.forEach((f) => fd.append("files", f)); // key "files" matches multer.any()

        resp = await axios.post(`${API_BASE}/intake/submit`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        resp = await axios.post(`${API_BASE}/intake/submit`, payload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      const result = resp.data;
      if (result.ok && result.sessionId) {
        setSuccessSessionId(result.sessionId);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (e) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit your intake. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Reset and start a new intake
   */
  const handleNewIntake = () => {
    // abort any in-flight agent-turn request
    try {
      abortControllerRef.current?.abort()
    } catch (e) {
      // ignore
    }

    setMessages([])
    setFiles([])
    setSuccessSessionId(null)
    setInput("")
    // clear patient fields
    setPatientName("")
    setPatientDob("")
    setPatientPhone("")
    setPatientEmail("")
    // reset streaming/skeleton state
    setStreaming(false)
    setShowSkeletons(false)
  }

  /**
   * Handle Enter key to send message
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Success state - show confirmation card
  if (successSessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-accent" />
            </div>
            <CardTitle className="text-2xl">Intake Submitted Successfully</CardTitle>
            <CardDescription>
              Your intake information has been securely received and will be reviewed by our medical team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Session ID</p>
              <code className="text-sm font-mono text-foreground">{successSessionId}</code>
            </div>
            <Button onClick={handleNewIntake} variant="outline" className="w-full bg-transparent">
              Start New Intake
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }


  // Main intake interface
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card flex mx-auto px-32">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Patient Intake</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Your conversation is confidential and secure. All information is protected under HIPAA guidelines.
          </p>
        </div>

        <div className="flex items-center px-4 py-6 ml-auto">
          <Button className="hover:bg-muted-foreground hover:cursor-pointer text-white" onClick={() => router.push("/")} aria-label="Go to home page">
            <House className="h-5 w-5 text-white" />
            Home
          </Button>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 items-stretch">
          {/* Left column - Chat (2/3 width) */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-11rem)]">
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    Virtual Nurse
                  </CardTitle>
                  <CardDescription>Chat with our AI assistant to complete your intake</CardDescription>
                </div>

                <div>
                  <Button variant="default" onClick={handleNewIntake}>
                    Reset
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col h-[calc(100%-5rem)]">
                {/* Chat messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex", msg.role === "patient" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed",
                          msg.role === "patient"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {streaming && (
                    <div className="flex justify-start">
                      {showSkeletons && (
                        <div className="flex flex-col ml-2">
                          <div className="flex space-x-2 items-center">
                            <div className="font-semibold text-sm">Paratus</div>
                            <div className="text-sm text-gray-500 italic">Agent is Thinking...</div>
                          </div>
                          <div className="w-96 mt-1 flex flex-col gap-2">
                            <Skeleton className="w-[90%] h-[16px] rounded-md" />
                            <Skeleton className="w-[60%] h-[16px] rounded-md" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input bar */}
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={streaming}
                    // className="flex-1"
                    className="flex-1 min-h-[48px] max-h-[80px] resize-none rounded-xl bg-muted/50 px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground border border-border focus-visible:ring-1 
                    focus-visible:ring-ring disabled:opacity-50 transition-all"
                  />
                  <Button onClick={handleSend} disabled={!input.trim() || streaming} size='icon' className="h-12 w-12">
                    {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>

                {/* AI disclaimer */}
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Responses are generated by AI; please verify details with your healthcare provider.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Summary & Submit (1/3 width) */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100vh-11rem)] flex flex-col">
              <ScrollArea>

                <CardHeader>
                  <CardTitle>Intake Summary</CardTitle>
                  <CardDescription>Review and submit when ready</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="patient-name">
                        Patient Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="patient-name"
                        value={patientName}
                        autoComplete="off"
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Full name"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="patient-dob">
                        Date of Birth <span className="text-destructive">*</span>
                      </Label>

                      <DatePickerField
                        id="patient-dob"
                        value={patientDob}
                        onChange={setPatientDob}
                        required
                        min="1900-01-01"
                        max={todayIso}
                        // 👇 ensure dropdowns show 1900..current-year
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        // (optional) open around a sensible month when empty
                        defaultMonth={new Date(1995, 0, 1)}
                        placeholder="Select date of birth"
                      />
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="patient-phone">Phone Number</Label>
                      <Input
                        id="patient-phone"
                        type="tel"
                        autoComplete="off"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="patient-email">Email</Label>
                      <Input
                        id="patient-email"
                        type="email"
                        autoComplete="off"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Message count */}
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Messages exchanged</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {messages.filter((m) => m.role === "patient").length}
                    </p>
                  </div>

                  {/* File upload */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Attach Documents (Optional)</label>
                    <div className="space-y-2">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm">Choose files</span>
                        </div>
                        <input id="file-upload" type="file" multiple onChange={handleFileChange} className="sr-only" />
                      </label>

                      {/* Selected files list */}
                      {files.length > 0 && (
                        <div className="space-y-2">
                          {files.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-muted rounded-lg p-2 text-sm">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="truncate text-foreground">{file.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(idx)}
                                className="h-6 w-6 flex-shrink-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={messages.length === 0 || submitting}
                    className="w-full"
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Intake"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    By submitting, you confirm that the information provided is accurate to the best of your knowledge.
                  </p>
                </CardContent>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div >
  )
}
