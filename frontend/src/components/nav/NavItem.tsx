import * as React from "react";

import { ActiveLink } from "@/components/nav/ActiveLink";
import { cn } from "@/lib/utils";

export interface NavItemProps {
  href: string;
  children: React.ReactNode;
  end?: boolean;
  className?: string;
}

export function NavItem({ href, children, end, className }: NavItemProps) {
  return (
    <ActiveLink
      href={href}
      end={end}
      className={cn(
        "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-zinc-400 transition-colors",
        "hover:bg-zinc-900/60 hover:text-zinc-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-200/20",
        className
      )}
      activeClassName="bg-zinc-900/60 text-zinc-50 border border-zinc-800"
    >
      {children}
    </ActiveLink>
  );
}
