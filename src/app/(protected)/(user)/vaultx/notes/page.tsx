// app/templates/page.tsx
import TemplatesClient from "./components/templates-client"

export const dynamic = "force-dynamic"

export default function TemplatesPage() {
    return (
        <main className="p-6 md:p-2">
            <TemplatesClient />
        </main>
    )
}
