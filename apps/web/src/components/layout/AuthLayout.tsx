import type { ReactNode } from "react";
import { Link } from "react-router";

import { Logo } from "@/components/common";

import { BrandArt } from "./BrandArt";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Panel de marca */}
      <aside className="relative hidden overflow-hidden bg-oliva-500 text-marfil lg:flex lg:flex-col lg:justify-between lg:p-12">
        <BrandArt className="absolute inset-0 size-full" />
        <Link
          to="/"
          className="relative w-fit"
          aria-label="Arizona Health & Studio, ir al inicio"
        >
          <Logo tono="marfil" className="h-16" />
        </Link>
        <div className="relative space-y-6">
          <p className="max-w-64 text-lg text-marfil/90">
            Un espacio para hacerte bien.
          </p>
          <p className="font-display text-4xl leading-tight font-medium">
            Movimiento
            <br />
            Salud
            <br />
            Bienestar
          </p>
        </div>
      </aside>

      {/* Formulario */}
      <main className="flex flex-col">
        <header className="flex items-center justify-between bg-oliva-500 px-6 py-4 lg:hidden">
          <Link to="/" aria-label="Arizona Health & Studio, ir al inicio">
            <Logo tono="marfil" className="h-10" />
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 space-y-2">
              <h1>{title}</h1>
              {subtitle && <p className="text-oliva-700">{subtitle}</p>}
            </div>
            {children}
            {footer && (
              <div className="mt-8 text-center text-sm text-oliva-700">
                {footer}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
