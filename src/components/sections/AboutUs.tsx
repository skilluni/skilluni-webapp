import { HOME } from "../../constants/home";
import SectionHeading from "../ui/SectionHeading";

export default function AboutUs() {
  return (
    <section
      id={HOME.sectionIds.about}
      className="border-y border-foreground/10 bg-foreground/2 py-20 md:py-28"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6">
        <SectionHeading
          eyebrow={HOME.about.eyebrow}
          title={HOME.about.title}
          description={HOME.about.description}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {[HOME.about.problem, HOME.about.vision].map((block) => (
            <div
              key={block.title}
              className="rounded-3xl border border-foreground/10 bg-white/70 p-7 shadow-[0_25px_70px_-50px_rgba(15,23,42,0.45)] backdrop-blur dark:bg-neutral-900/60"
            >
              <h3 className="text-lg font-semibold text-foreground">
                {block.title}
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-foreground/70">
                {block.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="mt-2 h-2 w-2 rounded-full bg-foreground" />
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
