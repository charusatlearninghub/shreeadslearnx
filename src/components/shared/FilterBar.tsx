import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Responsive filter/search row: stacks vertically and full-width on phones,
 * inline from sm: upward. Children (inputs, selects, buttons) automatically
 * stretch on mobile.
 */
export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3 w-full max-w-full",
        "[&>*]:w-full sm:[&>*]:w-auto [&_button[role=combobox]]:w-full sm:[&_button[role=combobox]]:w-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}
