"use client";

import * as React from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export interface ActiveLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  end?: boolean;
}

function isActivePath(pathname: string, href: string, end: boolean) {
  if (end) return pathname === href;
  if (pathname === href) return true;
  return pathname.startsWith(href.endsWith("/") ? href : `${href}/`);
}

export function ActiveLink({
  children,
  className,
  activeClassName,
  end = false,
  href,
  ...props
}: ActiveLinkProps) {
  const pathname = usePathname() ?? "/";
  const hrefString = typeof href === "string" ? href : href.pathname ?? "/";

  const active = isActivePath(pathname, hrefString, end);

  return (
    <Link
      href={href}
      className={cn(className, active && activeClassName)}
      aria-current={active ? "page" : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}
