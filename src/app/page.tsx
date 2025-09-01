"use client"

import { useState } from "react"
import { Sandpack } from "@codesandbox/sandpack-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

export default function Page() {
  const [desc, setDesc] = useState("A pricing card with title, price, 3 features, and a buy button")
  const [code, setCode] = useState<string>("")
  const [name, setName] = useState<string>("GeneratedComponent")
  const [cliCommand, setCliCommand] = useState<string>("")

  async function generate() {
    const r = await fetch("/api/generate", {
      method: "POST",
      body: JSON.stringify({ description: desc }),
      headers: { "Content-Type": "application/json" },
    })
    const json = await r.json()
    setCode(json.code || "")
    setName(json.componentName || "GeneratedComponent")
    setCliCommand("") // reset on new gen
  }

  function copyCode() {
    navigator.clipboard.writeText(code)
  }

  async function save() {
    const r = await fetch("/api/components", {
      method: "POST",
      body: JSON.stringify({ name, code }),
      headers: { "Content-Type": "application/json" },
    })
    const json = await r.json()
    if (json.id) {
      const command = `npx my-ui-gen add ${name} --id=${json.id}`
      setCliCommand(command)
    }
  }

  // Sandpack files (with styled primitives + theme)
  const files: Record<string, string> = {
    "/App.tsx": `
import React from "react";
import { ${name} } from "./${name}";
export default function App(){
  // Apply dark mode class to document
  React.useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="min-h-dvh bg-background text-foreground p-8">
      <div className="mx-auto max-w-lg">
        <${name} />
      </div>
    </div>
  )
}
`,
    [`/${name}.tsx`]: code || `export function ${name}(){ return <div/> }`,

    // utils
    "/lib/utils.ts": `
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
`,

    // button
    "/components/ui/button.tsx": `
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        // variants
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90 shadow hover:shadow-md",
        variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow hover:shadow-md",
        variant === "outline" && "border border-border bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow",
        variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        variant === "link" && "text-primary underline-offset-4 hover:underline",
        // sizes
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 rounded-md px-3",
        size === "lg" && "h-11 rounded-md px-8",
        size === "icon" && "h-10 w-10",
        className
      )}
      {...props}
    />
  )
}
`,

    // input
    "/components/ui/input.tsx": `
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"
`,

    // label
    "/components/ui/label.tsx": `
import * as React from "react"
import { cn } from "@/lib/utils"

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium text-gray-700", className)}
    {...props}
  />
))
Label.displayName = "Label"
`,

    // card
    "/components/ui/card.tsx": `
import * as React from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-xl border border-border/20 bg-card text-card-foreground shadow-lg backdrop-blur-sm", className)} {...props} />
  )
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6 pb-0", className)} {...props} />
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
}
export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
}
`,

    // badge  
    "/components/ui/badge.tsx": `
import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variant === "default" && "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      variant === "secondary" && "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80", 
      variant === "destructive" && "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      variant === "outline" && "text-foreground",
      className
    )} {...props} />
  )
}
`,

    // tailwind + theme
    "/style.css": `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --radius: 0.5rem;
  }
  
  * {
    border-color: hsl(var(--border));
  }
  
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
  }
  
  html {
    color-scheme: dark;
  }
}

@layer components {
  .bg-background { background-color: hsl(var(--background)); }
  .bg-foreground { background-color: hsl(var(--foreground)); }
  .bg-card { background-color: hsl(var(--card)); }
  .bg-card-foreground { background-color: hsl(var(--card-foreground)); }
  .bg-primary { background-color: hsl(var(--primary)); }
  .bg-primary-foreground { background-color: hsl(var(--primary-foreground)); }
  .bg-secondary { background-color: hsl(var(--secondary)); }
  .bg-secondary-foreground { background-color: hsl(var(--secondary-foreground)); }
  .bg-muted { background-color: hsl(var(--muted)); }
  .bg-muted-foreground { background-color: hsl(var(--muted-foreground)); }
  .bg-accent { background-color: hsl(var(--accent)); }
  .bg-accent-foreground { background-color: hsl(var(--accent-foreground)); }
  .bg-destructive { background-color: hsl(var(--destructive)); }
  .bg-destructive-foreground { background-color: hsl(var(--destructive-foreground)); }
  
  .text-background { color: hsl(var(--background)); }
  .text-foreground { color: hsl(var(--foreground)); }
  .text-card { color: hsl(var(--card)); }
  .text-card-foreground { color: hsl(var(--card-foreground)); }
  .text-primary { color: hsl(var(--primary)); }
  .text-primary-foreground { color: hsl(var(--primary-foreground)); }
  .text-secondary { color: hsl(var(--secondary)); }
  .text-secondary-foreground { color: hsl(var(--secondary-foreground)); }
  .text-muted { color: hsl(var(--muted)); }
  .text-muted-foreground { color: hsl(var(--muted-foreground)); }
  .text-accent { color: hsl(var(--accent)); }
  .text-accent-foreground { color: hsl(var(--accent-foreground)); }
  .text-destructive { color: hsl(var(--destructive)); }
  .text-destructive-foreground { color: hsl(var(--destructive-foreground)); }
  
  .border-border { border-color: hsl(var(--border)); }
  .border-input { border-color: hsl(var(--input)); }
  .ring-ring { --tw-ring-color: hsl(var(--ring)); }
  .ring-offset-background { --tw-ring-offset-color: hsl(var(--background)); }
}
`,
    "/icons.tsx": `
import * as React from "react"

// Fallback icons if lucide-react fails to load
export const CheckIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export const XIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export const StarIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

export const ArrowRightIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
)

export const HeartIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)
`,
    "/tsconfig.json": `{
      "compilerOptions": {
        "baseUrl": ".",
        "paths": {
          "@/*": ["./*"]
        }
      }
    }`
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-4">
      <Card className="p-4 space-y-3">
        <Textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} />
        <div className="flex gap-2">
          <Button onClick={generate}>Generate</Button>
          <Button onClick={copyCode} disabled={!code}>Copy Code</Button>
          <Button onClick={save} disabled={!code}>Save</Button>
        </div>

        {cliCommand && (
          <div className="mt-3 rounded bg-gray-100 p-3 font-mono text-sm">
            {cliCommand}
            <Button
              className="ml-2"
              onClick={() => navigator.clipboard.writeText(cliCommand)}
            >
              Copy CLI
            </Button>
          </div>
        )}
      </Card>

      {code && (
        <Card className="p-0 overflow-hidden">
          <Sandpack
            template="react-ts"
            files={files}
            theme="dark"
            options={{ 
              editorHeight: 520, 
              showConsole: true,
              externalResources: [
                "https://cdn.tailwindcss.com"
              ]
            }}
            customSetup={{
              dependencies: {
                clsx: "latest",
                "tailwind-merge": "latest",
                "lucide-react": "latest",
              },
            }}
          />
        </Card>
      )}
    </div>
  )
}
