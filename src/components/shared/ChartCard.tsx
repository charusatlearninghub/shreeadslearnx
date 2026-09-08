import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Chart body height: compact on phones, taller from sm: upward. */
  bodyClassName?: string;
}

/**
 * Card wrapper for any chart. The body has a fixed responsive height so
 * Recharts' ResponsiveContainer (width="100%" height="100%") always fits the
 * card instead of overflowing on small screens.
 */
export function ChartCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: ChartCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6 pt-0 sm:pt-0">
        <div className={cn("w-full max-w-full h-[200px] sm:h-[280px] lg:h-[320px]", bodyClassName)}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
