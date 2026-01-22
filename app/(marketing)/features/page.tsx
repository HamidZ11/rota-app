

import Image from "next/image";
import Link from "next/link";

import Container from "../components/Container";
import SectionHeading from "../components/SectionHeading";
import CTASection from "../components/CTASection";

import staffHolidayReq from "../../../images/staffholidayreq.png";
import staffShifts from "../../../images/staffshifts.png";
import swapRequestsView from "../../../images/swaprequestsview.png";
import holidayRequests from "../../../images/holidayrequests.png";

const managerFeatures = [
  {
    title: "Build the weekly rota",
    description:
      "Create and publish the rota in one place so the plan stays clear for everyone.",
  },
  {
    title: "Approve holidays",
    description:
      "Review requests with context, approve quickly, and keep coverage predictable.",
  },
  {
    title: "Approve shift swaps",
    description:
      "Let staff request swaps without chaos — you stay in control of the final rota.",
  },
  {
    title: "Export as PDF",
    description:
      "Generate a clean rota PDF when you need a printed copy or a simple share.",
  },
];

const staffFeatures = [
  {
    title: "See your shifts",
    description:
      "Staff can check their week in seconds without chasing messages.",
  },
  {
    title: "Request a swap",
    description:
      "Request shift swaps in-app so changes are visible and properly approved.",
  },
  {
    title: "Request holidays",
    description:
      "Send holiday requests with dates and notes — no back-and-forth.",
  },
];

export default function FeaturesPage() {
  return (
    <main className="bg-[rgb(var(--bg))]">
      {/* HERO */}
      <section className="pb-14 pt-20 md:pt-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.05fr_1.2fr] lg:items-center">
            <div className="space-y-7">
              <span className="inline-flex rounded-full bg-[rgb(var(--surface))] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
                Features
              </span>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[rgb(var(--text))] md:text-5xl">
                Everything you need to run a calm rota week
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-[rgb(var(--muted))] md:text-lg">
                Weekline is built for two roles — managers and staff — so everyone knows the plan,
                requests stay controlled, and the rota doesn’t turn into chaos.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md bg-[rgb(var(--brand))] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[rgb(var(--brand-hover))]"
                >
                  Create your first rota — free
                </Link>
                <p className="text-sm text-[rgb(var(--muted))]">No card required • Set up in under 5 minutes</p>
              </div>
            </div>

            <div className="rounded-3xl bg-[rgb(var(--surface))] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              <div className="overflow-hidden rounded-2xl bg-[rgb(var(--bg))]">
                <Image
                  src={staffShifts}
                  alt="Staff view showing upcoming shifts"
                  className="h-auto w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* QUICK SPLIT */}
      <section className="pb-10">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
                Managers
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
                Build the rota, approve requests, and keep the final plan under control.
              </p>
            </div>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
                Staff
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
                Check shifts, request swaps, and request holidays — without WhatsApp confusion.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* MANAGER FEATURES */}
      <section className="border-t border-[rgb(var(--border))] py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Managers"
            title="Control the rota without micromanaging"
            description="Managers keep the rota accurate, approvals clear, and weeks predictable."
          />

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div className="grid gap-6 md:grid-cols-2">
              {managerFeatures.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]"
                >
                  <h3 className="text-base font-semibold text-[rgb(var(--text))]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">{f.description}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-[rgb(var(--surface))] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
                <div className="overflow-hidden rounded-2xl bg-[rgb(var(--bg))]">
                  <Image
                    src={holidayRequests}
                    alt="Manager view showing holiday requests awaiting approval"
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-6 py-5 text-sm text-[rgb(var(--muted))] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
                Approvals keep the rota trustworthy. Staff can request — managers decide.
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* STAFF FEATURES */}
      <section className="border-t border-[rgb(var(--border))] py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Staff"
            title="A clear view of the week"
            description="Staff get clarity, and managers get fewer questions during service."
          />

          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-6">
              <div className="rounded-3xl bg-[rgb(var(--surface))] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
                <div className="overflow-hidden rounded-2xl bg-[rgb(var(--bg))]">
                  <Image
                    src={staffHolidayReq}
                    alt="Staff holiday request screen"
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-[rgb(var(--surface))] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
                <div className="overflow-hidden rounded-2xl bg-[rgb(var(--bg))]">
                  <Image
                    src={swapRequestsView}
                    alt="Swap requests view"
                    className="h-auto w-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
                <h3 className="text-base font-semibold text-[rgb(var(--text))]">What staff can do</h3>
                <div className="mt-4 space-y-4">
                  {staffFeatures.map((f) => (
                    <div key={f.title} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                      <div>
                        <p className="text-sm font-semibold text-[rgb(var(--text))]">{f.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-[rgb(var(--muted))]">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-6 py-5 text-sm text-[rgb(var(--muted))] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
                Requests stay in one place — no more “did you see my message?”
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* PERMISSIONS / ROLES */}
      <section className="border-t border-[rgb(var(--border))] py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Roles"
            title="Two roles. Clear responsibility."
            description="Managers control the rota. Staff can request changes. That’s the whole point."
          />

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-semibold text-[rgb(var(--text))]">Managers</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>Create and publish the rota</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>Approve holidays</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>Approve shift swaps</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>Export rota as PDF</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-semibold text-[rgb(var(--text))]">Staff</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>View their shifts</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>Request shift swaps</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>Request holidays</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <CTASection />
    </main>
  );
}