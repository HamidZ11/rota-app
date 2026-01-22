import Link from "next/link";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-[#F9FAFB]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-[#0F172A]">
          Weekline
        </Link>

        <div className="hidden items-center gap-8 text-sm text-[#475569] md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-[#0F172A]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#1D4ED8]"
        >
          Sign in
        </Link>
      </div>
    </nav>
  );
}
