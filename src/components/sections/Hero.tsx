import { HOME } from "../../constants/home";
import ButtonLink from "../ui/ButtonLink";

export default function Hero() {
  const { hero } = HOME;

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'var(--color-canvas)' }}
    >
      {/* Atmospheric glow */}
      <div className="absolute inset-0 -z-10">
        <div
          className="animate-pulse-glow absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: '800px',
            height: '600px',
            background: 'radial-gradient(50% 50% at 50% 0%, rgba(106, 76, 245, 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -right-32 top-1/4"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(212, 77, 240, 0.08) 0%, transparent 60%)',
            borderRadius: '50%',
          }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 md:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        {/* Left column */}
        <div className="space-y-8">
          <div
            className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 text-caption uppercase tracking-[0.25em]"
            style={{
              background: 'var(--color-surface-1)',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--color-ink-muted)',
            }}
          >
            {hero.eyebrow}
          </div>

          <h1 className="animate-fade-in-up-delay-1 text-display-xxl max-w-xl" style={{ color: 'var(--color-ink)' }}>
            {hero.title}
          </h1>

          <p
            className="animate-fade-in-up-delay-2 text-body-lg max-w-xl"
            style={{ color: 'var(--color-ink-muted)' }}
          >
            {hero.description}
          </p>

          <div className="animate-fade-in-up-delay-3 flex flex-wrap gap-4">
            <ButtonLink
              href={hero.primaryCta.href}
              label={hero.primaryCta.label}
              size="lg"
            />
            <ButtonLink
              href={hero.secondaryCta.href}
              label={hero.secondaryCta.label}
              size="lg"
              variant="secondary"
              isExternal={hero.secondaryCta.isExternal}
            />
          </div>

          <ul className="animate-fade-in-up-delay-4 grid gap-3 md:grid-cols-2">
            {hero.highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 px-4 py-3 text-body-sm"
                style={{
                  background: 'var(--color-surface-1)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-ink-muted)',
                }}
              >
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: 'var(--color-gradient-violet)' }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right column — Preview card */}
        <div
          className="animate-scale-in p-8"
          style={{
            background: 'var(--color-surface-1)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-hairline)',
          }}
        >
          <div className="space-y-5">
            <p
              className="text-caption uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              {hero.preview.title}
            </p>
            <h3 className="text-headline" style={{ color: 'var(--color-ink)' }}>
              {hero.preview.description}
            </h3>
            <div className="space-y-3">
              {hero.preview.steps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center justify-between px-4 py-3 text-body-sm"
                  style={{
                    background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span style={{ color: 'var(--color-ink-muted)' }}>{step}</span>
                  <span
                    className="flex h-6 w-6 items-center justify-center text-micro"
                    style={{
                      background: 'var(--color-canvas)',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--color-ink-muted)',
                    }}
                  >
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
