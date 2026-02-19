import Link from "next/link";

import { NavItem } from "@/components/nav/NavItem";
import { cn } from "@/lib/utils";

export interface NavbarProps {
  className?: string;
  brand?: {
    name: string;
    href?: string;
  };
}

export function Navbar({
  className,
  brand = { name: "GameBoxd", href: "/" },
}: NavbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 border-b bg-zinc-900/80 backdrop-blur",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href={brand.href ?? "/"} className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-50" />
          <span className="text-sm font-semibold tracking-tight">
            {brand.name}
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 sm:flex"
          aria-label="Navegação"
        >
          <NavItem href="/" end>
            Início
          </NavItem>
          <NavItem href="/games">Jogos</NavItem>
          <NavItem href="/lists">Listas</NavItem>
          <NavItem href="/profile">Perfil</NavItem>
        </nav>

        <div className="sm:hidden">
          <div className="h-9 w-9 rounded-md border border-zinc-800 bg-zinc-900/30" />
        </div>
      </div>
    </header>
  );
}
