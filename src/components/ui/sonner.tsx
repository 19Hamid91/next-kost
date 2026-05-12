"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-white/20 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-muted-foreground font-medium",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-bold rounded-xl",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-bold rounded-xl",
          success: "group-[.toaster]:!bg-emerald-50/80 group-[.toaster]:!text-emerald-900 group-[.toaster]:!border-emerald-200/50",
          error: "group-[.toaster]:!bg-destructive/5 group-[.toaster]:!text-destructive group-[.toaster]:!border-destructive/20",
          info: "group-[.toaster]:!bg-blue-50/80 group-[.toaster]:!text-blue-900 group-[.toaster]:!border-blue-200/50",
          warning: "group-[.toaster]:!bg-orange-50/80 group-[.toaster]:!text-orange-900 group-[.toaster]:!border-orange-200/50",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
