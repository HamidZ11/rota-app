import Image from "next/image";
import Link from "next/link";
import Container from "./components/Container";

import demoImage from "../../images/demo.png";

export default function Home() {
  return (
    <main className="bg-white">
      {/* 1) HERO (Outcome + Relief) */}
      <section className="pb-16 pt-20 md:pt-28">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1.2fr]">
            <div className="space-y-8">
              <span className="inline-flex rounded-full bg-[#F5F5F4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#78716C]">
                Built for independent restaurants
              </span>

              <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-[#0F172A] md:text-6xl">
                Know exactly who’s working this week — without spreadsheets or chaos.
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-[#78716C] md:text-lg">
                Weekline helps independent restaurants plan weekly rotas in minutes, keep
                everyone aligned, and avoid last-minute confusion.
              </p>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-md bg-[#3B5BFF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2F4AE0]"
                  >
                    Create your first rota — free
                  </Link>
                </div>

                <p className="text-sm text-[#78716C]">
                  No card required • Set up in under 5 minutes
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-[#F5F5F4] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              <div className="overflow-hidden rounded-2xl bg-white">
                <Image
                  src={demoImage}
                  alt="Weekly rota view in Weekline"
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2) IMMEDIATE SOCIAL PROOF */}
      <section className="pb-10">
        <Container>
          <div className="rounded-2xl border border-[#E7E5E4] bg-white px-6 py-6 md:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-semibold text-[#0F172A]">
                Used by independent restaurants across the UK
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:w-[60%] md:gap-4">
                {/* Replace these with real logos when ready */}
                {[
                  "Neighbourhood Café",
                  "Bistro Co.",
                  "Pizza Kitchen",
                  "The Local Grill",
                ].map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-center rounded-lg bg-[#F5F5F4] px-3 py-3 text-xs font-semibold text-[#78716C]"
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#F5F5F4] px-4 py-4">
                <p className="text-sm font-semibold text-[#0F172A]">Hundreds of rotas</p>
                <p className="mt-1 text-sm text-[#78716C]">created every week</p>
              </div>
              <div className="rounded-xl bg-[#F5F5F4] px-4 py-4">
                <p className="text-sm font-semibold text-[#0F172A]">Teams up to 40</p>
                <p className="mt-1 text-sm text-[#78716C]">staff members</p>
              </div>
              <div className="rounded-xl bg-[#F5F5F4] px-4 py-4">
                <p className="text-sm font-semibold text-[#0F172A]">No training</p>
                <p className="mt-1 text-sm text-[#78716C]">required to start</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3) PROBLEM (Pain they recognise) */}
      <section className="py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78716C]">
                The problem
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#0F172A] md:text-4xl">
                If your rota lives in a spreadsheet, this probably feels familiar
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-[#78716C]">
                You don’t need more software — you need this week to run without chaos.
              </p>
            </div>

            <ul className="space-y-3 rounded-2xl bg-[#F5F5F4] p-6 text-[#292524]">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#3B5BFF]" />
                <span>Staff asking “Am I working?”</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#3B5BFF]" />
                <span>Last-minute changes lost in WhatsApp</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#3B5BFF]" />
                <span>You double-checking shifts at midnight</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#3B5BFF]" />
                <span>Nobody trusting the rota is final</span>
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* 4) SOLUTION (Why Weekline is different) */}
      <section className="py-16">
        <Container>
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78716C]">
              The solution
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#0F172A] md:text-4xl">
              Weekline replaces scattered tools with one clear weekly view
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-[#78716C]">
              A single place to plan, publish, and keep everyone aligned — without the noise.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
                <h3 className="text-lg font-semibold text-[#0F172A]">Clear</h3>
                <ul className="mt-4 space-y-2 text-sm text-[#78716C]">
                  <li>One shared rota</li>
                  <li>Everyone sees updates instantly</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
                <h3 className="text-lg font-semibold text-[#0F172A]">Controlled</h3>
                <ul className="mt-4 space-y-2 text-sm text-[#78716C]">
                  <li>Changes tracked</li>
                  <li>Approvals where needed</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[#E7E5E4] bg-white p-6">
                <h3 className="text-lg font-semibold text-[#0F172A]">Calm</h3>
                <ul className="mt-4 space-y-2 text-sm text-[#78716C]">
                  <li>Fewer surprises</li>
                  <li>Less chasing staff</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 5) PRODUCT PROOF (Screenshot + annotations) */}
      <section className="py-16">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_1.2fr]">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78716C]">
                Product proof
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[#0F172A] md:text-4xl">
                One rota everyone trusts
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-[#78716C]">
                Keep the plan visible, readable, and consistent — so you’re not answering the
                same questions all week.
              </p>

              <div className="space-y-3">
                {[
                  "Everyone sees the same plan",
                  "Clear shifts, no messages",
                  "Changes tracked, not argued",
                ].map((text) => (
                  <div
                    key={text}
                    className="flex items-start gap-3 rounded-xl bg-[#F5F5F4] px-4 py-3"
                  >
                    <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#3B5BFF]" />
                    <p className="text-sm font-medium text-[#292524]">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-[#F5F5F4] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              <div className="overflow-hidden rounded-2xl bg-white">
                <Image
                  src={demoImage}
                  alt="Weekly rota view with clear shifts"
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 6) TRUST & CREDIBILITY */}
      <section className="py-16">
        <Container>
          <div className="rounded-3xl border border-[#E7E5E4] bg-white p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78716C]">
              Trust
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0F172A] md:text-4xl">
              Built for real service weeks
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                "Designed specifically for independent restaurants",
                "No training required",
                "Works on desktop and mobile",
                "Support from real people",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-[#F5F5F4] p-5"
                >
                  <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#3B5BFF]" />
                  <p className="text-sm font-medium text-[#292524]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 7) PRICING CUE (low-friction) */}
      <section className="py-16">
        <Container>
          <div className="grid gap-10 rounded-3xl bg-[#0F172A] px-8 py-10 text-white md:grid-cols-[1.3fr_0.7fr] md:items-center md:px-10">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Pricing
              </p>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Start free. Upgrade only if you need more control.
              </h2>
              <p className="text-white/80">Free plan up to 10 staff</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 md:justify-end">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-white/90"
              >
                View pricing
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Get started — free
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 8) FINAL CTA (Reassurance) */}
      <section className="pb-28 pt-10">
        <Container>
          <div className="rounded-3xl bg-[#F5F5F4] px-8 py-12 md:px-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-[#0F172A] md:text-4xl">
                  Make next week’s rota the easy one.
                </h2>
                <p className="text-[#78716C]">Takes less time than opening a spreadsheet</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md bg-[#3B5BFF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2F4AE0]"
                >
                  Get started — free
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
