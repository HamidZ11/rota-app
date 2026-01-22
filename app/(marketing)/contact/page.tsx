import Container from "../components/Container";
import SectionHeading from "../components/SectionHeading";

export default function ContactPage() {
  return (
    <main className="bg-[rgb(var(--bg))]">
      <section className="py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-8">
              <SectionHeading
                eyebrow="Contact"
                title="Let’s keep your rota calm"
                description="Tell us what you’re running right now (spreadsheet, WhatsApp, something else) and what you want Weekline to solve. We’ll reply within one business day."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
                    Direct lines
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-[rgb(var(--muted))]">
                    <p className="font-medium text-[rgb(var(--text))]">hello@weekline.app</p>
                    <p>Mon–Fri, 8:30am–6:30pm</p>
                  </div>
                  <p className="mt-4 text-sm text-[rgb(var(--muted))]">
                    Prefer email? That’s usually fastest.
                  </p>
                </div>

                <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
                    Best for
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-[rgb(var(--muted))]">
                    <li className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                      <span>Replacing spreadsheets</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                      <span>Stopping WhatsApp chaos</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                      <span>Quick product demos</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[rgb(var(--brand))]" />
                      <span>Support questions</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-6 py-5 text-sm text-[rgb(var(--muted))] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
                We’re a small product — you’ll get a reply from a real person, not a ticket loop.
              </div>
            </div>

            <div className="rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(var(--muted))]">
                Send a message
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[rgb(var(--text))]">
                Tell us what you need
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[rgb(var(--muted))]">
                A couple of details helps us reply with something useful.
              </p>

              <form className="mt-8 grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-[rgb(var(--text))]">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className="mt-2 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand))]/30 focus-visible:outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-medium text-[rgb(var(--text))]">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="mt-2 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand))]/30 focus-visible:outline-none"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="restaurant" className="text-sm font-medium text-[rgb(var(--text))]">
                    Restaurant name
                  </label>
                  <input
                    id="restaurant"
                    name="restaurant"
                    type="text"
                    autoComplete="organization"
                    className="mt-2 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand))]/30 focus-visible:outline-none"
                    placeholder="e.g. The Local Grill"
                  />
                </div>

                <div>
                  <label htmlFor="teamSize" className="text-sm font-medium text-[rgb(var(--text))]">
                    Team size
                  </label>
                  <input
                    id="teamSize"
                    name="teamSize"
                    type="text"
                    inputMode="numeric"
                    className="mt-2 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand))]/30 focus-visible:outline-none"
                    placeholder="e.g. 12"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="message" className="text-sm font-medium text-[rgb(var(--text))]">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="mt-2 w-full rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-2.5 text-sm text-[rgb(var(--text))] outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--brand))]/30 focus-visible:outline-none"
                    placeholder="What’s the main rota problem you want to fix? (e.g. staff asking if they’re working, changes getting lost, approvals, multi-site, etc.)"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-4 md:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md bg-[rgb(var(--brand))] px-6 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 ease-out hover:-translate-y-[1px] hover:bg-[rgb(var(--brand-hover))]"
                  >
                    Send message
                  </button>

                  <p className="text-sm text-[rgb(var(--muted))]">
                    We’ll reply within one business day.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
