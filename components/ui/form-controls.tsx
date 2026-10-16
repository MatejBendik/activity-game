import type { ReactNode } from "react";
export function SegmentedControl<T extends string | number>({
  value,
  onChange,
  options,
  className = "",
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
  label: string;
}) {
  return (
    <div
      className={`flex p-[5px] rounded-[14px] bg-[#eee9e1] gap-[4px] [&_button]:min-h-[48px] [&_button]:flex-1 [&_button]:text-[14px] [&_button]:font-extrabold [&_button]:rounded-[10px] [&_button]:flex [&_button]:justify-center [&_button]:items-center [&_button]:gap-[7px] [&_button]:text-[#8b8290] [&_button[data-selected=true]]:bg-[#fffcf7] [&_button[data-selected=true]]:text-[#7650b1] [&_button[data-selected=true]]:shadow-[0_2px_5px_#47304d0a] ${className}`}
      role="group"
      aria-label={label}
    >
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          data-selected={value === option.value}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className="min-w-[52px] h-[48px] relative [&::before]:[content:''] [&::before]:absolute [&::before]:inset-[9px_0] [&::before]:rounded-[18px] [&::before]:bg-[#d9d2db] [&::before]:[transition:background_0.2s] [&_>_span]:absolute [&_>_span]:top-[13px] [&_>_span]:left-[4px] [&_>_span]:w-[22px] [&_>_span]:h-[22px] [&_>_span]:bg-white [&_>_span]:rounded-[50%] [&_>_span]:[transition:transform_0.2s] [&_>_span]:shadow-[0_1px_3px_#0001] [&[data-on=true]::before]:bg-purple [&[data-on=true]_>_span]:[transform:translateX(22px)]"
      data-on={checked}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}
export function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p
      className="text-[#b1464e] text-[13px] mt-[10px] mb-[10px] ml-0 mr-0"
      id={id}
      role="alert"
    >
      {message}
    </p>
  ) : null;
}
