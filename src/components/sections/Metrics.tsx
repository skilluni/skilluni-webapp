import { HOME } from "../../constants/home";
import { METRICS } from "../../constants/metrics";
import SectionHeading from "../ui/SectionHeading";

const SPOTLIGHT_VARIANTS = [
  '', // surface-1
  'gradient-spotlight-violet',
  '', // surface-1
  'gradient-spotlight-magenta',
];

export default function Metrics() {
  return (
    <section
      id={HOME.sectionIds.metrics}
      className="py-20 md:py-28"
      style={{ background: 'var(--color-canvas)' }}
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1.1fr_1fr] md:items-center">
        <SectionHeading
          eyebrow={HOME.metrics.eyebrow}
          title={HOME.metrics.title}
          description={HOME.metrics.description}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {METRICS.map((metric, index) => {
            const spotlight = SPOTLIGHT_VARIANTS[index] || '';
            const isSpotlight = spotlight !== '';

            return (
              <div
                key={metric.label}
                className={`card-hover p-6 ${isSpotlight ? spotlight : ''}`}
                style={{
                  background: isSpotlight ? undefined : 'var(--color-surface-1)',
                  borderRadius: isSpotlight ? 'var(--radius-xxl)' : 'var(--radius-xl)',
                  border: isSpotlight ? 'none' : '1px solid var(--color-hairline)',
                }}
              >
                <p className="text-caption uppercase tracking-[0.2em]" style={{ color: isSpotlight ? 'rgba(255,255,255,0.7)' : 'var(--color-ink-muted)' }}>
                  {metric.label}
                </p>
                <p className="mt-3 text-display-md" style={{ color: 'var(--color-ink)' }}>
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
