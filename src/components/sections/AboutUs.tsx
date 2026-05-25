import { HOME } from "../../constants/home";
import SectionHeading from "../ui/SectionHeading";

export default function AboutUs() {
  const blocks = [
    { data: HOME.about.problem, spotlight: false },
    { data: HOME.about.vision, spotlight: true },
  ];

  return (
    <section
      id={HOME.sectionIds.about}
      className="py-20 md:py-28"
      style={{ background: 'var(--color-canvas)' }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        <SectionHeading
          eyebrow={HOME.about.eyebrow}
          title={HOME.about.title}
          description={HOME.about.description}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {blocks.map(({ data, spotlight }) => (
            <div
              key={data.title}
              className={`card-hover p-7 ${spotlight ? 'gradient-spotlight-orange' : ''}`}
              style={{
                background: spotlight ? undefined : 'var(--color-surface-1)',
                borderRadius: spotlight ? 'var(--radius-xxl)' : 'var(--radius-xl)',
                border: spotlight ? 'none' : '1px solid var(--color-hairline)',
              }}
            >
              <h3 className="text-headline" style={{ color: 'var(--color-ink)' }}>
                {data.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {data.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-body" style={{ color: spotlight ? 'rgba(255,255,255,0.85)' : 'var(--color-ink-muted)' }}>
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: spotlight ? 'rgba(255,255,255,0.5)' : 'var(--color-gradient-orange)' }}
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
