import Link from "next/link";
import Container from "../components/Container";
import SectionHeading from "../components/SectionHeading";

const tiers = [
  {
    name: "Starter",
    price: "Free",
    note: "For small teams getting organised.",
    features: [
      "Up to 10 staff",
      "Weekly rota creation",
      "Swap requests",
      "Mobile access",
    ],
    cta: "Get started — free",
    accent: true,
  },
  {
    name: "Pro",
    price: "£49 / month",
    note: "For restaurants that need approvals and control.",
    features: [
      "Unlimited staff",
      "Manager approvals",
      "PDF export",
      "Priority support",
    ],
    cta: "Start Pro",
    accent: false,
  },
  {
    name: "Multi-site",
    price: "£129 / month",
    note: "For groups running multiple locations.",
    features: [
      "Multi-site visibility",
      "Shared staff pool",
      "Custom reporting",
      "Dedicated onboarding",
    ],
    cta: "Talk to us",
    accent: false,
    href: "/contact",
  },
];

const faqs = [
  {
    question: "Can I change plans anytime?",
    answer: "Yes. Upgrade or downgrade whenever you need.",
  },
  {
    question: "Do staff need accounts?",
    answer:
      "Optional. Staff accounts enable swap requests and a personal view of their week.",
  },
  {
    question: "Is there a contract?",
    answer: "No. Cancel whenever you need to.",
  },
  {
    question: "Do you offer help getting set up?",
    answer:
      "Yes. If you get stuck, you’ll get support from real people — not a bot loop.",
  },
];

export default function PricingPage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="pb-12 pt-20 md:pt-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-[#F5F5F4] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#78716C]">
                Pricing
              </span>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#0F172A] md:text-5xl">
                Start free. Upgrade only if you need more control.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[#78716C] md:text-lg">
                Most restaurants just want a rota everyone can trust. Start with the free
                plan, and only pay if you need approvals, exports, or more control.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-md bg-[#3B5BFF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2F4AE0]"
                >
                  Get started — free
                </Link>
                <p className="text-sm text-[#78716C]">No card required • Set up in under 5 minutes</p>
              </div>
            </div>

            <div className="rounded-3xl border border-[#E7E5E4] bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78716C]">
                Quick guide
              </p>
              <div className="mt-4 space-y-3 text-sm text-[#78716C]">
                <div className="flex gap-3">
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#3B5BFF]" />
                  <p>
                    <span className="font-semibold text-[#0F172A]">Starter</span> is free for up to 10 staff.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#3B5BFF]" />
                  <p>
                    <span className="font-semibold text-[#0F172A]">Pro</span> adds approvals, export, and priority support.
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[#3B5BFF]" />
                  <p>
                    <span className="font-semibold text-[#0F172A]">Multi-site</span> is for groups — talk to us.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* TIERS */}
      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="Plans"
            title="Pick what you need — nothing more"
            description="Calm, predictable pricing for real service weeks."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => {
              const href = tier.href ?? "/login";
              return (
                <div
                  key={tier.name}
                  className={`rounded-2xl border p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] ${
                    tier.accent
                      ? "border-[#3B5BFF] bg-white"
                      : "border-[#E7E5E4] bg-white"
                  }`}
                >
                  {tier.accent ? (
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B5BFF]">
                      Best place to start
                    </span>
                  ) : null}
                  <h3 className="mt-3 text-xl font-semibold text-[#0F172A]">{tier.name}</h3>
                  <p className="mt-2 text-sm text-[#78716C]">{tier.note}</p>
                  <p className="mt-6 text-3xl font-semibold text-[#0F172A]">{tier.price}</p>
                  <ul className="mt-6 space-y-3 text-sm text-[#78716C]">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#3B5BFF]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={href}
                    className={`mt-8 inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition duration-200 ease-out ${
                      tier.accent
                        ? "bg-[#3B5BFF] text-white shadow-sm hover:-translate-y-[1px] hover:bg-[#2F4AE0]"
                        : "border border-[#E7E5E4] bg-white text-[#292524] hover:-translate-y-[1px] hover:bg-[#F5F5F4]"
                    }`}
                  >
                    {tier.cta}
                  </Link>

                  {tier.name === "Starter" ? (
                    <p className="mt-3 text-center text-xs text-[#78716C]">
                      Free plan up to 10 staff
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <Container>
          <SectionHeading
            eyebrow="FAQ"
            title="Pricing questions"
            description="Everything you need to make a confident decision."
          />
          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-2xl border border-[#E7E5E4] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]"
              >
                <summary className="cursor-pointer text-sm font-semibold text-[#0F172A]">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#78716C]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* FINAL CTA */}
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
