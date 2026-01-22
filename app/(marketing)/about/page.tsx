import Container from "../components/Container";
import SectionHeading from "../components/SectionHeading";
import CTASection from "../components/CTASection";

const outcomes = [
  {
    title: "One rota everyone trusts",
    description:
      "Managers and staff see the same plan, updated in one place, with fewer questions during service.",
  },
  {
    title: "Changes stay controlled",
    description:
      "Updates are visible and predictable, so the rota stays final instead of turning into a moving target.",
  },
  {
    title: "Calmer weeks",
    description:
      "Less Sunday-night scrambling, fewer surprises, and more confidence that shifts are covered.",
  },
];

const values = [
  {
    title: "Clarity over features",
    description:
      "We keep the weekly view readable first. No clutter, no busywork, just what matters for the week.",
  },
  {
    title: "Respect for staff time",
    description:
      "Staff shouldn’t have to chase messages to know their shifts. The rota should be obvious and consistent.",
  },
  {
    title: "Designed for pressure",
    description:
      "Hospitality runs fast. Weekline is built to stay clear when plans change and time is short.",
  },
];

const whoItsFor = [
  {
    title: "Independent restaurants",
    description:
      "Owners and managers who plan week to week and need the rota to stay simple.",
  },
  {
    title: "Small teams with busy shifts",
    description:
      "Front of house, kitchen, part-time staff, and everyone who needs a clear view of the week.",
  },
  {
    title: "Anyone replacing spreadsheets",
    description:
      "If your rota lives in Excel and WhatsApp, Weekline gives you one dependable place to manage it.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-[rgb(var(--bg))]">
      {/* HERO */}
      <section className="py-20 md:py-24">
        <Container>
          <div className="max-w-3xl space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
                About Weekline
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-[rgb(var(--text))] md:text-5xl">
                Built to make weekly rota planning feel calm and predictable.
              </h1>
            </div>

            <p className="text-base leading-relaxed text-[rgb(var(--muted))] md:text-lg">
              Weekline exists for independent restaurant managers who are tired of spreadsheets,
              message threads, and last-minute confusion. It gives you one clear weekly view,
              so everyone knows the plan and changes don’t turn into chaos.
            </p>

            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-6 py-5 text-sm text-[rgb(var(--muted))] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              The goal is simple: fewer questions, fewer surprises, and a rota your team can trust.
            </div>
          </div>
        </Container>
      </section>

      {/* WHY */}
      <section className="border-t border-[rgb(var(--border))] py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Why"
            title="Why Weekline was built"
            description="Because the rota shouldn’t be a weekly battle."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-semibold text-[rgb(var(--text))]">
                The problem we kept seeing
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>Rotas shared as screenshots that go out of date instantly.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>Changes lost across WhatsApp, calls, and “did you see my message?”.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>Managers double-checking coverage late at night to avoid surprises.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-semibold text-[rgb(var(--text))]">
                The approach
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[rgb(var(--muted))]">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>One shared weekly rota, readable on desktop and mobile.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>Changes stay visible, so staff trust the rota is current.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                  <span>Less admin, more time focused on service and the floor.</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* OUTCOME */}
      <section className="border-t border-[rgb(var(--border))] py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Outcome"
            title="What managers get"
            description="Weekly planning that feels calm, controlled, and dependable."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {outcomes.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]"
              >
                <h3 className="text-base font-semibold text-[rgb(var(--text))]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* WHO IT'S FOR */}
      <section className="border-t border-[rgb(var(--border))] py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Fit"
            title="Who Weekline is for"
            description="If you run service weeks, you’ll recognise the problem."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {whoItsFor.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]"
              >
                <h3 className="text-base font-semibold text-[rgb(var(--text))]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* PRINCIPLES */}
      <section className="border-t border-[rgb(var(--border))] py-16 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Principles"
            title="How we design Weekline"
            description="Built to stay clear under pressure."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]"
              >
                <h3 className="text-base font-semibold text-[rgb(var(--text))]">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-6 py-5 text-sm text-[rgb(var(--muted))] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
            Calm weeks create better service. Our job is to keep the rota clear so teams can focus on the floor.
          </div>
        </Container>
      </section>

      <CTASection />
    </main>
  );
}
