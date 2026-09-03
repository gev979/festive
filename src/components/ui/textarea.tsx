import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground/70 flex min-h-24 w-full resize-none rounded-lg border border-input bg-[color-mix(in_oklab,var(--surface-soft)_70%,transparent)] px-4 py-3 text-base leading-relaxed shadow-inner outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
