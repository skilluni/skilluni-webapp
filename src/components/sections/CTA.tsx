import { HOME } from "../../constants/home";
import ButtonLink from "../ui/ButtonLink";

export default function CTA() {
  return (
    <section id={HOME.sectionIds.cta} className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/3 p-10 text-center md:p-14">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_50%_0%,rgba(148,163,184,0.25)_0%,rgba(255,255,255,0)_60%)]" />
          <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            {HOME.cta.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-foreground/70 md:text-lg">
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
              variant="ghost"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
