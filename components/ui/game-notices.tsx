import { Users } from "lucide-react";
import type { ReactNode } from "react";
export function OpenRoundNotice({
  children = "Hádajú všetci!",
}: {
  children?: ReactNode;
}) {
  return (
    <div
      data-slot="open-banner"
      className="flex items-center justify-center gap-[8px] bg-[#f9ebcb] text-[#977030] w-fit max-w-full rounded-[11px] pt-[14px] pb-[14px] pl-[20px] pr-[20px] text-[14px] leading-[1.5] font-extrabold m-[0_auto_22px]"
    >
      <Users size={17} />
      {children}
    </div>
  );
}
export function PrivacyNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex justify-center items-start gap-[6px] text-[14px] text-[#796c81] mt-[23px] leading-[1.6] max-[601px]:text-[14px] max-[601px]:mt-[20px] max-[601px]:items-start [&_>_svg]:shrink-0 [&_>_svg]:mt-[3px]">
      {children}
    </p>
  );
}
