import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Mobile-first page header: title stacks above actions on phones. */
export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 sm:mb-8",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="font-display font-bold text-xl sm:text-2xl lg:text-3xl leading-tight break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1 break-words">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0 [&>*]:flex-1 sm:[&>*]:flex-none">
          {actions}
        </div>
      )}
    </div>
  );
}
