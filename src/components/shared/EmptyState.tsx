import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Responsive empty / no-results state used across public, dashboard and admin pages. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Card className={cn("p-6 sm:p-10 text-center", className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="font-display font-bold text-base sm:text-lg mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">{description}</p>
      )}
      {action}
    </Card>
  );
}
