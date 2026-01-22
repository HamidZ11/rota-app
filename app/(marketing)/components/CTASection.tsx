import Link from "next/link";

export default function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="rounded-2xl border border-[#E7E5E4] bg-white p-10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78716C]">
            Ready to simplify scheduling?
          </p>
          <h2 className="text-3xl font-semibold leading-tight text-[#0F172A]">
            Bring calm to your weekly rota
          </h2>
          <p className="text-base leading-relaxed text-[#78716C]">
            Give your managers clarity and your staff a single source of truth.
            Start with a clean, operational workflow today.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-[#3B5BFF] px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-[1px] hover:bg-[#2F4AE0]"
          >
            Get started
          </Link>
        </div>
      </div>
    </section>
  );
}
