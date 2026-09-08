import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  /** Optional small caption under the value (e.g. "+12% this month"). */
  hint?: ReactNode;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

/**
 * Compact, mobile-first KPI card. Numbers stay prominent on phones without
 * making cards tall; padding and icon size scale up from sm: upward.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  className,
  iconClassName,
  onClick,
}: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "h-full overflow-hidden transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-lg hover:-translate-y-0.5",
        className,
      )}
    >
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] sm:text-xs font-medium text-muted-foreground leading-tight line-clamp-2">
            {label}
          </p>
          {Icon && (
            <span
              className={cn(
                "w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0",
                iconClassName,
              )}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
            </span>
          )}
        </div>
        <p className="mt-2 font-display font-bold text-xl sm:text-2xl leading-tight tabular-nums break-words">
          {value}
        </p>
        {hint && <p className="mt-1 text-[11px] sm:text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

/** Consistent responsive grid for KPI cards: 2 up on phones, 4 up on desktop. */
export function StatGrid({
  children,
  className,
  columns = 4,
}: {
  children: ReactNode;
  className?: string;
  columns?: 2 | 3 | 4 | 5;
}) {
  const lg = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
  }[columns];
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:gap-4", lg, className)}>{children}</div>
  );
}
