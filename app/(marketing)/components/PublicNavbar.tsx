"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { label: "Product", href: "/" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#E7E5E4] bg-[#FAFAF9]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-[0.12em]">
          Weekline
        </Link>

        <div className="hidden items-center gap-8 text-sm text-[#78716C] md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative pb-1 transition hover:text-[#292524] ${
                pathname === link.href
                  ? "text-[#0F172A] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-[#0F172A]"
                  : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden items-center justify-center rounded-md bg-[#3B5BFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2F4AE0] md:inline-flex"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E7E5E4] bg-white text-[#292524] md:hidden"
            aria-label="Toggle menu"
          >
            <span className="h-4 w-4">
              <span className="block h-0.5 w-4 bg-current" />
              <span className="mt-1.5 block h-0.5 w-4 bg-current" />
              <span className="mt-1.5 block h-0.5 w-4 bg-current" />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-[#E7E5E4] bg-[#FAFAF9] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm text-[#78716C]">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="transition hover:text-[#292524]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="mt-2 inline-flex items-center justify-center rounded-md bg-[#3B5BFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2F4AE0]"
            >
              Sign in
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
