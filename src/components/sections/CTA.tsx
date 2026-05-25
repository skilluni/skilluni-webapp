import { HOME } from "../../constants/home";
import ButtonLink from "../ui/ButtonLink";

export default function CTA() {
  return (
    <section
      id={HOME.sectionIds.cta}
      className="py-20 md:py-28"
      style={{ background: 'var(--color-canvas)' }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div
          className="relative overflow-hidden p-10 text-center md:p-16"
          style={{
            background: 'linear-gradient(135deg, #6a4cf5 0%, #d44df0 50%, #ff5577 100%)',
            borderRadius: 'var(--radius-xxl)',
          }}
        >
          {/* Atmosphere overlay */}
          <div
            className="absolute inset-0 -z-0"
            style={{
              background: 'radial-gradient(60% 60% at 50% 100%, rgba(0,0,0,0.3) 0%, transparent 60%)',
            }}
          />
          <div className="relative z-10">
            <h2 className="text-display-lg" style={{ color: 'var(--color-ink)' }}>
              {HOME.cta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-body-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {HOME.cta.description}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <ButtonLink
                href={HOME.cta.primaryCta.href}
                label={HOME.cta.primaryCta.label}
                size="lg"
              />
              <ButtonLink
                href={HOME.cta.secondaryCta.href}
                label={HOME.cta.secondaryCta.label}
                size="lg"
                variant="secondary"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
