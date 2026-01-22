import Link from "next/link";

const sections = [
  {
    title: "Product",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-[#E7E5E4] bg-[#FAFAF9]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78716C]">
            Weekline
          </p>
          <p className="text-sm leading-relaxed text-[#78716C]">
            Calm, reliable rotas for busy hospitality teams.
          </p>
          <p className="text-xs text-[#A8A29E]">
            © 2025 Weekline. All rights reserved.
          </p>
        </div>
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78716C]">
              {section.title}
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#78716C]">
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-[#292524]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
