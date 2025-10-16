import { z } from "zod"

// Schema matching the InboxItem type used in page.tsx
export const InboxItemSchema = z.object({
  id: z.string(),
  patient_name: z.string().optional(),
  complaint: z.string().optional(),
  probable_dx: z.string().optional(),
  files_count: z.number().optional(),
  red_flags_count: z.number().optional(),
  status: z.union([
    z.literal("pending"),
    z.literal("closed"),
    z.literal("reviewed"),
  ]),
  updated_at: z.string().optional(),
  submitted_at: z.string().optional(),
  patient_phone: z.string().nullable().optional(), // this can be null too

})

export type InboxItem = z.infer<typeof InboxItemSchema>

// If you still need the old IncidentSchema elsewhere, you can add it back or
// create a separate file. For now we've replaced it to match the inbox data.


