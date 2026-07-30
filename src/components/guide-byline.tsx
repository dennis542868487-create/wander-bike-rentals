/*
 * Byline for the guide pages. A guide with no visible author and no visible
 * date fails the Who/How/Why test a reader (or a model deciding whether to cite
 * the page) applies to editorial content, and the Article schema on these pages
 * has to describe something the reader can actually see.
 */

const DATE_FORMAT = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function Separator() {
  return <span aria-hidden="true">·</span>;
}

export function GuideByline({
  published,
  updated,
  tone = "light",
}: {
  /** ISO date, e.g. "2026-06-15". */
  published: string;
  /** ISO date. Omit when the guide has not been revised since publication. */
  updated?: string;
  /** "light" sits on a dark hero, "dark" on a white section. */
  tone?: "light" | "dark";
}) {
  const showUpdated = updated !== undefined && updated !== published;
  const nameColor = tone === "light" ? "text-white" : "text-slate-900";
  const metaColor = tone === "light" ? "text-slate-300/90" : "text-slate-500";

  return (
    /*
     * Each separator lives inside the segment that follows it, so a wrap can
     * never strand a bare "·" at the end of a line — which is what happens if
     * the dots are their own flex items and the byline wraps on a phone.
     */
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${metaColor}`}>
      <span className={`font-semibold ${nameColor}`}>Dennis Z</span>
      <span>
        <Separator /> Wander Bike
      </span>
      <span>
        <Separator /> Published{" "}
        <time dateTime={published}>
          {DATE_FORMAT.format(new Date(`${published}T00:00:00Z`))}
        </time>
      </span>
      {showUpdated ? (
        <span>
          <Separator /> Updated{" "}
          <time dateTime={updated}>
            {DATE_FORMAT.format(new Date(`${updated}T00:00:00Z`))}
          </time>
        </span>
      ) : null}
    </p>
  );
}
