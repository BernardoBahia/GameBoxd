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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-zinc-100"
          >
            {/* Base do joystick — retângulo arredondado */}
            <rect x="3" y="11" width="18" height="10" rx="2.5" />
            {/* Haste */}
            <line x1="12" y1="11" x2="12" y2="5" />
            {/* Bola no topo da haste */}
            <circle cx="12" cy="4.5" r="1.8" fill="currentColor" stroke="none" />
            {/* Botão de fogo */}
            <circle cx="17.5" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
          </svg>
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
          <button aria-label="Abrir menu de navegação" className="h-9 w-9 rounded-md border border-zinc-800 bg-zinc-900/30" />
        </div>
      </div>
    </header>
  );
}
