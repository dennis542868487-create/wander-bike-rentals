import { ArrowRight } from "lucide-react";
import Link from "next/link";

type EditorialGuideBandProps = {
  heading: string;
  description: string;
  links: readonly {
    href: string;
    label: string;
  }[];
};

export function EditorialGuideBand({
  heading,
  description,
  links,
}: EditorialGuideBandProps) {
  return (
    <section className="border-y border-white/10 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_0.72fr] lg:items-center lg:py-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
            Related pages
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">
            {description}
          </p>
        </div>
        <nav aria-label="Related guide pages">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="editorial-arrow-link">
              {link.label}
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
