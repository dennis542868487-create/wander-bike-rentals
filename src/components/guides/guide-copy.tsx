import type { ReactNode } from "react";
import type { GuideBlock } from "@/lib/guides/master-guide-data";

function InlineGuideText({ text }: { text: string }) {
  const tokenPattern = /(\*\*.+?\*\*|`.+?`|\[[^\]]+\]\([^)]+\))/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(tokenPattern)) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(text.slice(cursor, start));

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${start}-${token}`} className="font-bold text-slate-950">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <span key={`${start}-${token}`} className="font-medium text-slate-800">
          {token.slice(1, -1)}
        </span>,
      );
    } else {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        nodes.push(
          <a
            key={`${start}-${token}`}
            href={linkMatch[2]}
            className="font-semibold text-teal-700 underline decoration-teal-300 underline-offset-4 hover:text-teal-900"
            target="_blank"
            rel="noreferrer"
          >
            {linkMatch[1]}
          </a>,
        );
      }
    }
    cursor = start + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}

type GuideCopyGroup = {
  heading?: Extract<GuideBlock, { type: "heading" }>;
  blocks: Exclude<GuideBlock, { type: "heading" }>[];
};

function groupBlocks(blocks: GuideBlock[]) {
  const groups: GuideCopyGroup[] = [{ blocks: [] }];

  for (const block of blocks) {
    if (block.type === "heading") {
      groups.push({ heading: block, blocks: [] });
    } else {
      groups.at(-1)?.blocks.push(block);
    }
  }

  return groups.filter((group) => group.heading || group.blocks.length > 0);
}

function NumberedRideList({ items }: { items: string[] }) {
  return (
    <ol className="mt-8 border-t border-teal-200">
      {items.map((item, index) => (
        <li
          key={item}
          className="grid gap-3 border-b border-teal-200 py-6 sm:grid-cols-[4rem_1fr] sm:gap-6"
        >
          <span className="text-4xl font-light tracking-[-0.06em] text-teal-700 sm:text-5xl">
            {String(index + 1).padStart(2, "0")}
          </span>
          <p className="max-w-3xl text-base leading-7 text-slate-600">
            <InlineGuideText text={item} />
          </p>
        </li>
      ))}
    </ol>
  );
}
function StandardList({ ordered, items }: { ordered: boolean; items: string[] }) {
  const List = ordered ? "ol" : "ul";
  return (
    <List className="mt-5 space-y-3 border-l border-teal-300 pl-5 text-base leading-7 text-slate-600">
      {items.map((item, index) => (
        <li key={item} className="relative pl-5">
          <span
            className="absolute left-0 top-0 font-semibold text-teal-700"
            aria-hidden="true"
          >
            {ordered ? `${index + 1}.` : "•"}
          </span>
          <InlineGuideText text={item} />
        </li>
      ))}
    </List>
  );
}

function RouteHeading({ heading }: { heading: string }) {
  const match = /^(\d+)\.\s+(.+?)(?:\s+—\s+(.+))?$/.exec(heading);
  if (!match) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-[5rem_1fr_auto] sm:items-baseline sm:gap-7">
      <span className="text-5xl font-light tracking-[-0.07em] text-teal-700 sm:text-6xl">
        {String(Number(match[1])).padStart(2, "0")}
      </span>
      <h3 className="text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">
        {match[2]}
      </h3>
      {match[3] ? (
        <span className="text-xl font-semibold text-teal-700 sm:text-2xl">
          {match[3]}
        </span>
      ) : null}
    </div>
  );
}

export function GuideCopy({ blocks }: { blocks: GuideBlock[] }) {
  const groups = groupBlocks(blocks);

  return (
    <div>
      {groups.map((group, groupIndex) => {
        const heading = group.heading;
        const isRoute = heading
          ? /^\d+\.\s+/.test(heading.text)
          : false;
        const isRideIdeas = heading
          ? /best bike rides and trail ideas/i.test(heading.text)
          : false;
        const isClosure = heading
          ? /important current route note/i.test(heading.text)
          : false;

        return (
          <section
            key={heading?.id ?? `intro-${groupIndex}`}
            id={heading?.id}
            className={[
              "scroll-mt-32",
              isClosure
                ? "my-12 border-y border-teal-300 bg-teal-50 px-5 py-8 sm:px-8"
                : isRoute
                  ? "border-t border-teal-200 py-9 first:border-t-0"
                  : heading
                    ? "py-9 first:pt-0"
                    : "pb-5",
            ].join(" ")}
          >
            {heading ? (
              isRoute ? (
                <RouteHeading heading={heading.text} />
              ) : heading.level === 2 ? (
                <h2 className="max-w-4xl text-3xl font-bold tracking-[-0.045em] text-slate-950 sm:text-4xl">
                  {heading.text}
                </h2>
              ) : (
                <h3 className="max-w-3xl text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                  {heading.text}
                </h3>
              )
            ) : null}

            <div className={isRoute ? "sm:pl-[7rem]" : ""}>
              {group.blocks.map((block, blockIndex) => {
                if (block.type === "paragraph") {
                  return (
                    <p
                      key={`${groupIndex}-p-${blockIndex}`}
                      className="mt-5 max-w-4xl text-[1.02rem] leading-8 text-slate-600"
                    >
                      <InlineGuideText text={block.text} />
                    </p>
                  );
                }

                if (block.type === "list") {
                  return isRideIdeas && !block.ordered ? (
                    <NumberedRideList
                      key={`${groupIndex}-list-${blockIndex}`}
                      items={block.items}
                    />
                  ) : (
                    <StandardList
                      key={`${groupIndex}-list-${blockIndex}`}
                      ordered={block.ordered}
                      items={block.items}
                    />
                  );
                }

                return null;
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
