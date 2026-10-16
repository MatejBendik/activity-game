import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "text" }) {
  return (
    <button
      type={type}
      className={cn(
        `${variant === "text" ? "min-h-[48px] inline-flex items-center justify-center gap-[7px] font-bold text-[13px] text-[#8b7d97] pt-[8px] pb-[8px] pl-[10px] pr-[10px] rounded-[10px] hover:bg-[#eee8e0] hover:text-purple" : variant === "secondary" ? "min-h-[58px] pt-[15px] pb-[15px] pl-[24px] pr-[24px] rounded-[17px] flex gap-[12px] justify-center items-center text-[16px] leading-[1.4] font-extrabold bg-[#eee6f5] text-[#754cb0] hover:bg-[#e5daef]" : "min-h-[58px] pt-[15px] pb-[15px] pl-[24px] pr-[24px] rounded-[17px] flex gap-[12px] justify-center items-center text-[16px] leading-[1.4] font-extrabold bg-purple text-white shadow-[0_5px_0_#65429b] hover:bg-[#7347ba] hover:shadow-[0_5px_0_#5e3b95] active:shadow-[0_2px_0_#65429b]"}`,
        className,
      )}
      {...props}
    />
  );
}
export function IconButton({
  label,
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type={type}
      className={cn(
        `w-[48px] h-[48px] min-w-[48px] inline-flex items-center justify-center text-[#77707e] rounded-[50%] hover:bg-[#eee8e0] hover:text-ink`,
        className,
      )}
      aria-label={label}
      {...props}
    />
  );
}
