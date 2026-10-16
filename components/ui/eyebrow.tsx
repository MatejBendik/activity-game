import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Eyebrow({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="eyebrow"
      className={cn(
        "inline-flex items-center justify-center gap-2 text-[11px] tracking-[2px] font-black text-[#8e8297] [&>span]:size-[6px] [&>span]:rounded-full [&>span]:bg-[#d99a64]",
        className,
      )}
      {...props}
    />
  );
}
