import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "ghost"
}

export function Button({ className, variant = "solid", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none",
        variant === "solid" && "bg-blue-600 text-white hover:bg-blue-700 shadow",
        variant === "outline" && "border border-gray-300 bg-white hover:bg-gray-50 text-gray-900",
        variant === "ghost" && "text-gray-600 hover:bg-gray-100",
        className
      )}
      {...props}
    />
  )
}
